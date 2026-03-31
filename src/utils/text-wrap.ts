export interface Point {
  x: number
  y: number
}

export interface Interval {
  left: number
  right: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface PositionedLine {
  x: number
  y: number
  text: string
  width: number
}

let measureContext: CanvasRenderingContext2D | null = null

function getMeasureContext(): CanvasRenderingContext2D {
  if (measureContext !== null) return measureContext
  measureContext = document.createElement('canvas').getContext('2d')!
  return measureContext
}

export function measureTextWidth(text: string, font: string): number {
  const ctx = getMeasureContext()
  ctx.font = font
  return ctx.measureText(text).width
}

export function segmentText(text: string): string[] {
  if (typeof Intl === 'undefined' || !Intl.Segmenter) {
    return [text]
  }
  const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' })
  const segments: string[] = []
  for (const seg of segmenter.segment(text)) {
    segments.push(seg.segment)
  }
  return segments
}

export function prepareText(text: string, font: string): { segments: string[]; widths: number[] } {
  const ctx = getMeasureContext()
  ctx.font = font
  const segments = segmentText(text)
  const widths = segments.map(seg => ctx.measureText(seg).width)
  return { segments, widths }
}

export async function getWrapHull(src: string): Promise<Point[]> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      try {
        const points = extractHullFromImage(image)
        resolve(points)
      } catch (e) {
        console.warn('Failed to extract hull:', e)
        resolve(getDefaultHull())
      }
    }
    image.onerror = () => {
      console.warn('Failed to load image, using default hull:', src)
      resolve(getDefaultHull())
    }
    image.src = src
  })
}

function getDefaultHull(): Point[] {
  const steps = 20
  const points: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    points.push({
      x: 0.5 + Math.cos(angle) * 0.4,
      y: 0.5 + Math.sin(angle) * 0.4,
    })
  }
  return points
}

function extractHullFromImage(image: HTMLImageElement): Point[] {
  const maxDimension = 200
  const aspect = image.naturalWidth / image.naturalHeight
  const width = aspect >= 1 ? maxDimension : Math.max(32, Math.round(maxDimension * aspect))
  const height = aspect >= 1 ? Math.max(32, Math.round(maxDimension / aspect)) : maxDimension

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)

  const { data } = ctx.getImageData(0, 0, width, height)
  const lefts: (number | null)[] = new Array(height).fill(null)
  const rights: (number | null)[] = new Array(height).fill(null)
  const alphaThreshold = 12

  for (let y = 0; y < height; y++) {
    let left = -1
    let right = -1
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha !== undefined && alpha >= alphaThreshold) {
        if (left === -1) left = x
        right = x
      }
    }
    if (left !== -1 && right !== -1) {
      lefts[y] = left
      rights[y] = right + 1
    }
  }

  const validRows: number[] = []
  for (let y = 0; y < height; y++) {
    if (lefts[y] !== null && rights[y] !== null) validRows.push(y)
  }

  if (validRows.length === 0) {
    return [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]
  }

  let boundLeft = Infinity
  let boundRight = -Infinity
  const boundTop = validRows[0]
  const boundBottom = validRows[validRows.length - 1]

  for (const y of validRows) {
    const left = lefts[y]!
    const right = rights[y]!
    if (left < boundLeft) boundLeft = left
    if (right > boundRight) boundRight = right
  }

  const boundWidth = Math.max(1, boundRight - boundLeft)
  const boundHeight = Math.max(1, boundBottom - boundTop)

  const smoothedLefts = smoothValues(lefts, validRows, 4)
  const smoothedRights = smoothValues(rights, validRows, 4)

  const step = Math.max(1, Math.floor(validRows.length / 32))
  const sampledRows: number[] = []
  for (let i = 0; i < validRows.length; i += step) {
    sampledRows.push(validRows[i]!)
  }
  if (sampledRows[sampledRows.length - 1] !== boundBottom) {
    sampledRows.push(boundBottom)
  }

  const points: Point[] = []
  for (const y of sampledRows) {
    points.push({
      x: (smoothedLefts[y]! - boundLeft) / boundWidth,
      y: (y - boundTop) / boundHeight,
    })
  }
  for (let i = sampledRows.length - 1; i >= 0; i--) {
    const y = sampledRows[i]!
    points.push({
      x: (smoothedRights[y]! - boundLeft) / boundWidth,
      y: (y - boundTop) / boundHeight,
    })
  }

  return points
}

function smoothValues(values: (number | null)[], validRows: number[], radius: number): number[] {
  const smoothed: number[] = new Array(values.length).fill(0)
  for (const y of validRows) {
    let sum = 0
    let count = 0
    let edge = -Infinity
    for (let offset = -radius; offset <= radius; offset++) {
      const sampleY = y + offset
      if (sampleY < 0 || sampleY >= values.length) continue
      const v = values[sampleY]
      if (v !== null) {
        sum += v
        if (v > edge) edge = v
        count++
      }
    }
    smoothed[y] = count > 0 ? sum / count : (edge > -Infinity ? edge : 0)
  }
  return smoothed
}

export function transformWrapPoints(points: Point[], rect: Rect): Point[] {
  return points.map(point => ({
    x: rect.x + point.x * rect.width,
    y: rect.y + point.y * rect.height,
  }))
}

export function getPolygonIntervalForBand(
  points: Point[],
  bandTop: number,
  bandBottom: number,
  padding: number,
): Interval | null {
  const startY = Math.floor(bandTop)
  const endY = Math.ceil(bandBottom)

  let left = Infinity
  let right = -Infinity

  for (let y = startY; y <= endY; y++) {
    const xs = getPolygonXsAtY(points, y + 0.5)
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const runLeft = xs[i]!
      const runRight = xs[i + 1]!
      if (runLeft < left) left = runLeft
      if (runRight > right) right = runRight
    }
  }

  if (!Number.isFinite(left) || !Number.isFinite(right)) return null
  return { left: left - padding, right: right + padding }
}

function getPolygonXsAtY(points: Point[], y: number): number[] {
  const xs: number[] = []
  let a = points[points.length - 1]
  if (!a) return xs

  for (let i = 0; i < points.length; i++) {
    const b = points[i]!
    if ((a.y <= y && y < b.y) || (b.y <= y && y < a.y)) {
      xs.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y))
    }
    a = b
  }

  xs.sort((a, b) => a - b)
  return xs
}

export function carveTextLineSlots(base: Interval, blocked: Interval[]): Interval[] {
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

  return slots.filter(slot => slot.right - slot.left >= 20)
}

export function layoutTextWithObstacles(
  text: string,
  font: string,
  lineHeight: number,
  region: Rect,
  obstaclePoints: Point[],
): PositionedLine[] {
  const prepared = prepareText(text, font)
  const lines: PositionedLine[] = []
  let cursor = { segmentIndex: 0, graphemeIndex: 0 }
  let lineY = region.y

  while (cursor.segmentIndex < prepared.segments.length) {
    const bandTop = lineY
    const bandBottom = lineY + lineHeight

    const blocked = getPolygonIntervalForBand(obstaclePoints, bandTop, bandBottom, 8)
    const baseInterval: Interval = { left: region.x, right: region.x + region.width }

    const slots = blocked
      ? carveTextLineSlots(baseInterval, [blocked])
      : [baseInterval]

    if (slots.length === 0) {
      lineY += lineHeight
      continue
    }

    let bestSlot = slots[0]!
    for (const slot of slots) {
      if (slot.right - slot.left > bestSlot.right - bestSlot.left) {
        bestSlot = slot
      }
    }

    const maxWidth = bestSlot.right - bestSlot.left
    const result = fitTextInWidth(prepared, cursor, maxWidth)

    if (result.text === '') {
      lineY += lineHeight
      if (lineY > region.y + region.height) break
      continue
    }

    lines.push({
      x: bestSlot.left,
      y: lineY,
      text: result.text,
      width: result.width,
    })

    cursor = result.endCursor
    lineY += lineHeight

    if (lineY > region.y + region.height) break
  }

  return lines
}

function fitTextInWidth(
  prepared: { segments: string[]; widths: number[] },
  startCursor: { segmentIndex: number; graphemeIndex: number },
  maxWidth: number,
): { text: string; width: number; endCursor: { segmentIndex: number; graphemeIndex: number } } {
  let width = 0
  let endIndex = startCursor.segmentIndex
  let endGrapheme = startCursor.graphemeIndex

  for (let i = startCursor.segmentIndex; i < prepared.segments.length; i++) {
    const segWidth = prepared.widths[i]!
    if (width + segWidth > maxWidth && width > 0) break
    width += segWidth
    endIndex = i + 1
    endGrapheme = 0
  }

  let text = ''
  for (let i = startCursor.segmentIndex; i < endIndex; i++) {
    text += prepared.segments[i]!
  }

  return {
    text,
    width,
    endCursor: { segmentIndex: endIndex, graphemeIndex: endGrapheme },
  }
}
