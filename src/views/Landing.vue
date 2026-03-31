<template>
  <div class="landing-page" ref="containerRef">
    <!-- 中心轴承图片（主 orb） -->
    <div class="brand-obstacle" ref="obstacleRef">
      <img
        src="/bearing.svg"
        alt="轴承"
        class="bearing-image"
        @error="handleImageError"
      />
      <div class="brand-hint">{{ config.hint }}</div>
    </div>

    <!-- 其他 orbs（视觉装饰） -->
    <div
      v-for="(orb, index) in secondaryOrbs"
      :key="`orb-${index}`"
      class="orb"
      :style="{
        left: `${orb.x}px`,
        top: `${orb.y}px`,
        width: `${orb.r * 2}px`,
        height: `${orb.r * 2}px`,
        background: orb.background,
        boxShadow: orb.boxShadow,
      }"
    ></div>

    <!-- 首字下沉 -->
    <div
      class="drop-cap"
      ref="dropCapRef"
      :style="{
        left: `${dropCapPosition.x}px`,
        top: `${dropCapPosition.y}px`,
        fontSize: `${dropCapSize}px`,
        lineHeight: `${dropCapSize}px`,
      }"
    >
      {{ dropCapText }}
    </div>

    <!-- 环绕文字容器 -->
    <div class="text-container">
      <div
        v-for="(line, index) in layoutLines"
        :key="index"
        class="flowing-line"
        :style="{
          left: `${line.x}px`,
          top: `${line.y}px`,
        }"
      >
        {{ line.text }}
      </div>
    </div>

    <!-- 进入按钮 -->
    <div class="enter-section">
      <a-button type="primary" size="large" class="enter-button" @click="enterPlatform">
        {{ config.buttonText }} <RightOutlined />
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { RightOutlined } from '@ant-design/icons-vue'
import { layoutTextWithObstacles, prepareTextForLayout, layoutColumn, type RectObstacle, type CircleObstacle, type LayoutCursor, type PositionedLine } from '../utils/text-layout'
import { getLandingConfig } from '../config/landing'
import { walkLineRanges } from '@chenglou/pretext'

const router = useRouter()
const containerRef = ref<HTMLElement>()
const obstacleRef = ref<HTMLElement>()
const dropCapRef = ref<HTMLElement>()

// 获取配置
const config = getLandingConfig()

// 将多行文字合并为一段（用于布局）
const introText = computed(() => config.flowingText.join(''))

const layoutLines = ref<Array<{ x: number; y: number; text: string; width: number }>>([])
const obstaclePosition = ref({ x: 0.5, y: 0.45 })

// 次要 orbs 的视觉位置
const secondaryOrbs = ref<Array<{ x: number; y: number; r: number; background: string; boxShadow: string }>>([])

// 首字下沉
const dropCapText = computed(() => introText.value[0] || '')
const dropCapPosition = ref({ x: 0, y: 0 })
const DROP_CAP_LINES = 3

let animationFrameId: number | null = null
let preparedText: any = null  // 缓存预处理结果
let preparedDropCap: any = null
let dropCapWidth = 0
let dropCapSize = 0

// Orb 定义 - 多个圆形障碍物
interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
}

const orbs = ref<Orb[]>([
  { x: 0.5, y: 0.45, vx: 0.015, vy: 0.01, r: 0.15, color: '#1890ff' },
  { x: 0.2, y: 0.6, vx: -0.012, vy: 0.016, r: 0.1, color: '#40a9ff' },
  { x: 0.8, y: 0.3, vx: 0.01, vy: -0.013, r: 0.08, color: '#69c0ff' },
])
let lastTime = 0

// 初始化首字下沉
const initDropCap = (containerWidth: number) => {
  const fontSize = Math.max(11, Math.min(13, containerWidth / 100))
  const lineHeight = fontSize * 1.6
  dropCapSize = lineHeight * DROP_CAP_LINES - 4
  const dropCapFont = `700 ${dropCapSize}px system-ui, -apple-system, sans-serif`

  preparedDropCap = prepareTextForLayout(dropCapText.value, dropCapFont)

  // 计算首字宽度（同步）
  walkLineRanges(preparedDropCap, 9999, (line: any) => {
    dropCapWidth = line.width
  })
}

// 计算多列布局和圆形障碍物
const performLayout = (timestamp: number = 0) => {
  if (!containerRef.value || !preparedText) return

  const container = containerRef.value
  const containerRect = container.getBoundingClientRect()
  const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016
  lastTime = timestamp

  // 布局常量
  const GUTTER = 48
  const COL_GAP = 40
  const BOTTOM_GAP = 100
  const padding = Math.max(15, containerRect.width * 0.02)

  const pageWidth = containerRect.width
  const pageHeight = containerRect.height
  const isNarrow = pageWidth < 760

  // 初始化首字下沉
  if (dropCapSize === 0) {
    initDropCap(pageWidth)
  }

  // 更新 orb 位置（物理模拟）
  const minSize = Math.min(pageWidth, pageHeight)

  // 边界和碰撞
  for (let i = 0; i < orbs.value.length; i++) {
    const orb = orbs.value[i]!
    const radius = orb.r * minSize

    // 更新位置
    orb.x += orb.vx * dt
    orb.y += orb.vy * dt

    // 边界碰撞
    if (orb.x * pageWidth - radius < 0) {
      orb.x = radius / pageWidth
      orb.vx = Math.abs(orb.vx)
    }
    if (orb.x * pageWidth + radius > pageWidth) {
      orb.x = (pageWidth - radius) / pageWidth
      orb.vx = -Math.abs(orb.vx)
    }
    if (orb.y * pageHeight - radius < 0) {
      orb.y = radius / pageHeight
      orb.vy = Math.abs(orb.vy)
    }
    if (orb.y * pageHeight + radius > pageHeight - BOTTOM_GAP) {
      orb.y = (pageHeight - BOTTOM_GAP - radius) / pageHeight
      orb.vy = -Math.abs(orb.vy)
    }
  }

  // Orb 之间的碰撞
  for (let i = 0; i < orbs.value.length; i++) {
    const a = orbs.value[i]!
    const aRadius = a.r * minSize
    for (let j = i + 1; j < orbs.value.length; j++) {
      const b = orbs.value[j]!
      const bRadius = b.r * minSize
      const dx = (b.x - a.x) * pageWidth
      const dy = (b.y - a.y) * pageHeight
      const dist = Math.sqrt(dx * dx + dy * dy)
      const minDist = aRadius + bRadius + 20

      if (dist < minDist && dist > 0.1) {
        const force = (minDist - dist) * 0.8  // 稍微增加力系数
        const nx = dx / dist
        const ny = dy / dist

        // 只使用 dt，不乘以 60
        a.vx -= nx * force * dt
        a.vy -= ny * force * dt
        b.vx += nx * force * dt
        b.vy += ny * force * dt
      }
    }
  }

  // 更新主障碍物位置（第一个 orb）
  const mainOrb = orbs.value[0]!
  obstaclePosition.value = { x: mainOrb.x, y: mainOrb.y }

  // 使用 CSS transform 移动主障碍物
  if (obstacleRef.value) {
    const offsetX = mainOrb.x * pageWidth - pageWidth / 2
    const offsetY = mainOrb.y * pageHeight - pageHeight / 2
    obstacleRef.value.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`
  }

  // 更新次要 orbs 的视觉位置
  secondaryOrbs.value = orbs.value.slice(1).map(orb => ({
    x: orb.x * pageWidth - orb.r * minSize,
    y: orb.y * pageHeight - orb.r * minSize,
    r: orb.r * minSize,
    background: `radial-gradient(circle at 35% 35%, rgba(${hexToRgb(orb.color)},0.35), rgba(${hexToRgb(orb.color)},0.12) 55%, transparent 72%)`,
    boxShadow: `0 0 60px 15px rgba(${hexToRgb(orb.color)},0.18), 0 0 120px 40px rgba(${hexToRgb(orb.color)},0.07)`,
  }))

  // 生成圆形障碍物数组
  const circleObstacles: CircleObstacle[] = orbs.value.map(orb => ({
    cx: orb.x * pageWidth,
    cy: orb.y * pageHeight,
    r: orb.r * minSize,
    hPad: isNarrow ? 10 : 14,
    vPad: isNarrow ? 2 : 4,
  }))

  // 多列布局 - 使用固定字体大小以匹配预处理时的字体
  const fontSize = 13  // 固定字体大小，与预处理时一致
  const font = `${fontSize}px system-ui, -apple-system, sans-serif`
  const lineHeight = fontSize * 1.6
  const columnCount = pageWidth > 1200 ? 3 : pageWidth > 760 ? 2 : 1
  const totalGutter = GUTTER * 2 + COL_GAP * (columnCount - 1)
  const maxContentWidth = Math.min(pageWidth, 1500)
  const columnWidth = Math.floor((maxContentWidth - totalGutter) / columnCount)
  const contentLeft = Math.round((pageWidth - (columnCount * columnWidth + (columnCount - 1) * COL_GAP)) / 2)

  // 首字下沉障碍物
  const dropCapTotalW = Math.ceil(dropCapWidth) + 10
  const dropCapRect: RectObstacle = {
    x: contentLeft - 2,
    y: GUTTER + 20 - 2,
    width: dropCapTotalW,
    height: DROP_CAP_LINES * lineHeight + 2,
  }

  // 更新首字下沉位置
  dropCapPosition.value = { x: contentLeft, y: GUTTER + 20 }

  // 执行多列布局
  const allBodyLines: PositionedLine[] = []
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }  // 从头开始，首字下沉会覆盖第一个字符

  for (let colIndex = 0; colIndex < columnCount; colIndex++) {
    const columnX = contentLeft + colIndex * (columnWidth + COL_GAP)
    const rects: RectObstacle[] = []

    // 只在第一列添加首字下沉障碍物
    if (colIndex === 0) {
      rects.push(dropCapRect)
    }

    const result = layoutColumn(
      preparedText || introText.value,
      cursor,
      columnX,
      GUTTER + 20,
      columnWidth,
      pageHeight - GUTTER - 20 - BOTTOM_GAP,
      lineHeight,
      circleObstacles,
      rects,
      isNarrow,
      font,
    )

    allBodyLines.push(...result.lines)
    cursor = result.cursor
  }

  layoutLines.value = allBodyLines
}

// 辅助函数：hex 转 rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}`
    : '24, 144, 255'
}

// 自动飘动动画 - 使用物理模拟
const startFloatingAnimation = () => {
  const animate = (timestamp: number) => {
    performLayout(timestamp)
    animationFrameId = requestAnimationFrame(animate)
  }

  animationFrameId = requestAnimationFrame(animate)
}

const enterPlatform = () => {
  router.push('/home')
}

// 图片加载失败处理
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

onMounted(async () => {
  await nextTick()

  // 等待字体加载完成
  await document.fonts.ready

  // 预处理文本（只执行一次）
  const fontSize = 13
  const font = `${fontSize}px system-ui, -apple-system, sans-serif`

  try {
    preparedText = prepareTextForLayout(introText.value, font)
    console.log('[preparedText]', preparedText ? 'OK' : 'FAILED')
  } catch (e) {
    console.error('[prepareTextForLayout error]', e)
  }

  // 初始化后立即启动动画
  lastTime = performance.now()
  startFloatingAnimation()
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.landing-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%);
  overflow: hidden;
  color: #e0e0e0;
  font-family: system-ui, -apple-system, sans-serif;
}

/* 品牌障碍物 - 中心定位 */
.brand-obstacle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  width: auto;
  height: auto;
  will-change: transform;
}

.bearing-image {
  width: min(30vw, 280px);
  height: min(30vw, 280px);
  object-fit: contain;
  filter: drop-shadow(0 0 30px rgba(24, 144, 255, 0.5));
  animation: glow 3s ease-in-out infinite alternate;
}

/* 备用文字（图片加载失败时显示） */
.fallback-text {
  display: none;
  text-align: center;
}

.fallback-text .brand-text {
  font-size: min(20vw, 200px);
  font-weight: 900;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 50%, #69c0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.05em;
  line-height: 1;
}

.fallback-text .brand-subtitle {
  font-size: min(3vw, 24px);
  font-weight: 500;
  color: #69c0ff;
  letter-spacing: 0.2em;
  margin-top: -10px;
  opacity: 0.9;
}

.brand-text {
  font-size: min(20vw, 200px);
  font-weight: 900;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 50%, #69c0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.05em;
  text-shadow: 0 0 60px rgba(24, 144, 255, 0.3);
  line-height: 1;
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    filter: drop-shadow(0 0 20px rgba(24, 144, 255, 0.3));
  }
  to {
    filter: drop-shadow(0 0 40px rgba(24, 144, 255, 0.6));
  }
}

.brand-subtitle {
  font-size: min(3vw, 24px);
  font-weight: 500;
  color: #69c0ff;
  letter-spacing: 0.2em;
  margin-top: -10px;
  opacity: 0.9;
  line-height: 1;
}

.brand-hint {
  font-size: 12px;
  color: rgba(105, 192, 255, 0.6);
  margin-top: 12px;
  letter-spacing: 0.1em;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* 首字下沉 */
.drop-cap {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  font-weight: 700;
  color: #c4a35a;
  line-height: 1;
}

/* 次要 orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 4;
  will-change: transform;
  opacity: 0.8;
}

/* 环绕文字 */
.text-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.flowing-line {
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  color: rgba(224, 224, 224, 0.85);
  font-weight: 300;
  letter-spacing: 0.02em;
  will-change: left, top;
}

/* 进入按钮区域 */
.enter-section {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 20;
}

.enter-button {
  height: 50px;
  padding: 0 40px;
  font-size: 18px;
  font-weight: 500;
  border-radius: 25px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border: none;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.4);
  transition: all 0.3s ease;
}

.enter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(24, 144, 255, 0.6);
}

.enter-button :deep(.anticon) {
  margin-left: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .bearing-image {
    width: 40vw;
    height: 40vw;
  }

  .enter-section {
    bottom: 40px;
  }

  .enter-button {
    height: 44px;
    padding: 0 32px;
    font-size: 16px;
  }
}
</style>
