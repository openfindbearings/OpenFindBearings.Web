/**
 * 文字环绕布局工具
 * 实时文字避让算法：像水流一样环绕障碍物
 */

import { prepareWithSegments, layoutNextLine, type LayoutCursor, layoutWithLines } from '@chenglou/pretext'

/** 水平区间 */
export interface Interval {
  left: number
  right: number
}

/** 定位后的文本行 */
export interface PositionedLine {
  x: number
  y: number
  text: string
  width: number
}

/** 单列布局结果 */
export interface ColumnLayoutResult {
  lines: PositionedLine[]
  cursor: LayoutCursor
}

/** 矩形障碍物 */
export interface RectObstacle {
  x: number
  y: number
  width: number
  height: number
}

/** 圆形障碍物 */
export interface CircleObstacle {
  cx: number
  cy: number
  r: number
  hPad?: number  // 水平内边距
  vPad?: number  // 垂直内边距
}

/**
 * 计算矩形障碍物在给定垂直条带中占据的水平区间
 */
export function rectIntervalForBand(
  obstacle: RectObstacle,
  bandTop: number,
  bandBottom: number,
): Interval | null {
  if (bandBottom <= obstacle.y || bandTop >= obstacle.y + obstacle.height) {
    return null
  }
  return {
    left: obstacle.x,
    right: obstacle.x + obstacle.width,
  }
}

/**
 * 计算圆形障碍物在给定垂直条带中占据的水平区间
 * @param cx 圆心 X
 * @param cy 圆心 Y
 * @param r 半径
 * @param bandTop 条带顶部
 * @param bandBottom 条带底部
 * @param hPad 水平内边距
 * @param vPad 垂直内边距
 */
export function circleIntervalForBand(
  cx: number,
  cy: number,
  r: number,
  bandTop: number,
  bandBottom: number,
  hPad: number = 0,
  vPad: number = 0,
): Interval | null {
  const top = bandTop - vPad
  const bottom = bandBottom + vPad

  // 条带完全在圆外
  if (top >= cy + r || bottom <= cy - r) return null

  // 计算条带到圆心的最小垂直距离
  const minDy = cy >= top && cy <= bottom ? 0 : cy < top ? top - cy : cy - bottom

  // 条带与圆不相交
  if (minDy >= r) return null

  // 计算水平方向的最大偏移量
  const maxDx = Math.sqrt(r * r - minDy * minDy)

  return {
    left: cx - maxDx - hPad,
    right: cx + maxDx + hPad,
  }
}

/**
 * 从基础区间中扣除障碍物区间，返回剩余的可用文本槽
 */
export function carveTextLineSlots(
  base: Interval,
  blocked: Interval[],
  minSlotWidth: number = 20,
): Interval[] {
  let slots: Interval[] = [base]

  for (const interval of blocked) {
    const next: Interval[] = []
    for (const slot of slots) {
      if (interval.right <= slot.left || interval.left >= slot.right) {
        next.push(slot)
        continue
      }
      if (interval.left > slot.left) {
        next.push({ left: slot.left, right: interval.left })
      }
      if (interval.right < slot.right) {
        next.push({ left: interval.right, right: slot.right })
      }
    }
    slots = next
  }

  return slots.filter(slot => slot.right - slot.left >= minSlotWidth)
}

/**
 * 在障碍物周围布局文字
 * 实时避让算法：每一帧重新计算，文字自动环绕障碍物
 * @param prepared 预处理后的文本（外部缓存以提高性能）
 */
export function layoutTextWithObstacles(
  textOrPrepared: string | any,
  font: string,
  lineHeight: number,
  region: RectObstacle,
  obstacles: RectObstacle[],
  circleObstacles?: CircleObstacle[],
): PositionedLine[] {
  const lines: PositionedLine[] = []

  // 判断是文本还是预处理结果
  const prepared = typeof textOrPrepared === 'string'
    ? prepareWithSegments(textOrPrepared, font)
    : textOrPrepared

  // 计算理想行宽（不超过区域宽度的 40%）
  const idealLineWidth = Math.min(region.width * 0.4, 400)

  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let lineY = region.y
  const maxY = region.y + region.height

  const maxIterations = 2000
  let iterations = 0

  while (iterations < maxIterations) {
    iterations++

    // 检查是否完成所有文本
    if (cursor.segmentIndex >= prepared.segments.length) {
      break
    }

    const bandTop = lineY
    const bandBottom = lineY + lineHeight

    // 超出最大高度则停止
    if (bandTop >= maxY) {
      break
    }

    // 收集当前行的所有障碍物区间
    const blocked: Interval[] = []

    // 矩形障碍物
    for (const obstacle of obstacles) {
      const interval = rectIntervalForBand(obstacle, bandTop, bandBottom)
      if (interval) {
        blocked.push(interval)
      }
    }

    // 圆形障碍物
    if (circleObstacles) {
      for (const circle of circleObstacles) {
        const interval = circleIntervalForBand(
          circle.cx,
          circle.cy,
          circle.r,
          bandTop,
          bandBottom,
          circle.hPad ?? 0,
          circle.vPad ?? 0,
        )
        if (interval) {
          blocked.push(interval)
        }
      }
    }

    // 基础可用区间
    const baseInterval: Interval = {
      left: region.x,
      right: region.x + region.width,
    }

    // 扣除障碍物，获取可用槽
    const slots = carveTextLineSlots(baseInterval, blocked, 15)

    if (slots.length === 0) {
      // 没有可用空间，跳到下一行
      lineY += lineHeight
      continue
    }

    // 选择槽：优先选择接近理想宽度的槽
    let bestSlot = slots[0]!
    let bestScore = Infinity

    for (const slot of slots) {
      const slotWidth = slot.right - slot.left
      // 评分：槽宽与理想宽度的差距越小越好
      const score = Math.abs(slotWidth - idealLineWidth)
      if (score < bestScore) {
        bestScore = score
        bestSlot = slot
      }
    }

    // 使用槽宽和理想宽度中的较小值
    const maxWidth = Math.min(bestSlot.right - bestSlot.left, idealLineWidth)

    // 使用 pretext 布局一行
    const line = layoutNextLine(prepared, cursor, maxWidth)

    if (!line) {
      break
    }

    lines.push({
      x: bestSlot.left,
      y: lineY,
      text: line.text,
      width: line.width,
    })

    // 更新 cursor
    cursor = line.end
    lineY += lineHeight

    // 检查是否完成
    if (cursor.segmentIndex >= prepared.segments.length) {
      break
    }
  }

  return lines
}

/**
 * 预处理文本
 */
export function prepareTextForLayout(text: string, font: string) {
  return prepareWithSegments(text, font)
}

/**
 * 单列布局 - 支持光标传递，用于多列布局
 * @param textOrPrepared 预处理后的文本或原始字符串
 * @param startCursor 起始光标位置
 * @param regionX 列区域 X 坐标
 * @param regionY 列区域 Y 坐标
 * @param regionW 列区域宽度
 * @param regionH 列区域高度
 * @param lineHeight 行高
 * @param circleObstacles 圆形障碍物数组
 * @param rectObstacles 矩形障碍物数组
 * @param singleSlotOnly 是否只使用最佳槽（用于窄屏）
 * @returns 布局结果和新的光标位置
 */
export function layoutColumn(
  textOrPrepared: string | any,
  startCursor: LayoutCursor,
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number,
  lineHeight: number,
  circleObstacles: CircleObstacle[],
  rectObstacles: RectObstacle[],
  singleSlotOnly: boolean = false,
  font?: string,
): ColumnLayoutResult {
  // 判断是文本还是预处理结果
  const prepared = typeof textOrPrepared === 'string'
    ? prepareWithSegments(textOrPrepared, font || '13px system-ui, -apple-system, sans-serif')
    : textOrPrepared

  let cursor: LayoutCursor = startCursor
  let lineTop = regionY
  const lines: PositionedLine[] = []
  let textExhausted = false
  const minSlotWidth = 50

  while (lineTop + lineHeight <= regionY + regionH && !textExhausted) {
    const bandTop = lineTop
    const bandBottom = lineTop + lineHeight
    const blocked: Interval[] = []

    // 收集圆形障碍物区间
    for (const circle of circleObstacles) {
      const interval = circleIntervalForBand(
        circle.cx,
        circle.cy,
        circle.r,
        bandTop,
        bandBottom,
        circle.hPad ?? 0,
        circle.vPad ?? 0,
      )
      if (interval !== null) blocked.push(interval)
    }

    // 收集矩形障碍物区间
    for (const rect of rectObstacles) {
      if (bandBottom <= rect.y || bandTop >= rect.y + rect.height) continue
      blocked.push({ left: rect.x, right: rect.x + rect.width })
    }

    // 计算可用槽
    const baseInterval: Interval = { left: regionX, right: regionX + regionW }
    const slots = carveTextLineSlots(baseInterval, blocked, minSlotWidth)

    if (slots.length === 0) {
      lineTop += lineHeight
      continue
    }

    // 选择槽：优先使用接近理想宽度的槽
    const idealLineWidth = Math.min(regionW * 0.5, 400)
    let bestSlot = slots[0]!
    let bestScore = Infinity

    for (const slot of slots) {
      const slotWidth = slot.right - slot.left
      const score = Math.abs(slotWidth - idealLineWidth)
      if (score < bestScore) {
        bestScore = score
        bestSlot = slot
      }
    }

    const orderedSlots = singleSlotOnly
      ? [bestSlot]
      : [...slots].sort((a, b) => a.left - b.left)

    // 在每个槽中放置文本
    for (const slot of orderedSlots) {
      const slotWidth = slot.right - slot.left
      const maxWidth = Math.min(slotWidth, idealLineWidth)
      const line = layoutNextLine(prepared, cursor, maxWidth)

      if (line === null) {
        textExhausted = true
        break
      }

      lines.push({
        x: Math.round(slot.left),
        y: Math.round(lineTop),
        text: line.text,
        width: line.width,
      })

      cursor = line.end
    }

    lineTop += lineHeight
  }

  return { lines, cursor }
}
