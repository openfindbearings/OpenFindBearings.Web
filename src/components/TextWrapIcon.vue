<template>
  <div ref="containerRef" class="text-wrap-icon-wrapper">
    <div class="icon-layer">
      <div 
        class="icon-wrapper" 
        :class="{ spinning: isSpinning }" 
        :style="iconStyle"
        @click="handleClick"
      >
        <img :src="resolvedIconSrc" :alt="iconAlt" />
      </div>
    </div>
    <div class="text-layer">
      <span
        v-for="(line, index) in positionedLines"
        :key="index"
        class="text-line"
        :style="{
          left: line.x + 'px',
          top: line.y + 'px',
        }"
      >{{ line.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import {
  getWrapHull,
  transformWrapPoints,
  layoutTextWithObstacles,
  type Point,
} from '../utils/text-wrap'

const props = defineProps<{
  iconSrc: string
  iconAlt?: string
  text: string
}>()

const containerRef = ref<HTMLElement | null>(null)

const resolvedIconSrc = computed(() => {
  const src = props.iconSrc
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src
  }
  return new URL(src, window.location.origin).href
})
const isSpinning = ref(false)
const positionedLines = ref<{ x: number; y: number; text: string; width: number }[]>([])
const iconPoints = ref<Point[]>([])
const iconRect = ref({ x: 0, y: 0, width: 140, height: 140 })

const iconStyle = computed(() => ({
  width: iconRect.value.width + 'px',
  height: iconRect.value.height + 'px',
}))

const font = '18px "Helvetica Neue", Helvetica, Arial, sans-serif'
const lineHeight = 28

const handleClick = () => {
  isSpinning.value = true
  setTimeout(() => {
    isSpinning.value = false
    recalculateLayout()
  }, 2000)
}

async function loadIconHull() {
  try {
    const points = await getWrapHull(props.iconSrc)
    iconPoints.value = points
    recalculateLayout()
  } catch (e) {
    console.error('Failed to load icon hull:', e)
  }
}

function recalculateLayout() {
  const container = containerRef.value
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width || 400
  const containerHeight = containerRect.height || 300

  const iconWidth = 200
  const iconHeight = 200
  const iconX = containerWidth - iconWidth - 10
  const iconY = 0

  iconRect.value = { x: iconX, y: iconY, width: iconWidth, height: iconHeight }

  const transformedPoints = transformWrapPoints(iconPoints.value, iconRect.value)

  const textRegion = {
    x: 20,
    y: 10,
    width: iconX - 40,
    height: containerHeight - 20,
  }

  positionedLines.value = layoutTextWithObstacles(
    props.text,
    font,
    lineHeight,
    textRegion,
    transformedPoints,
  )
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await loadIconHull()

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      recalculateLayout()
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => props.text, () => {
  recalculateLayout()
})
</script>

<style scoped>
.text-wrap-icon-wrapper {
  position: relative;
  width: 100%;
  min-height: 200px;
  overflow: hidden;
}

.icon-layer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 220px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper {
  position: relative;
  cursor: pointer;
  pointer-events: auto;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%);
  padding: 10px;
}

.icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(74, 144, 217, 0.3) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
  z-index: -1;
}

.icon-wrapper.spinning {
  animation: spin 2s ease-in-out;
}

.icon-wrapper:hover {
  transform: scale(1.05);
}

.icon-wrapper:hover::before {
  animation: pulse-fast 1.5s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes pulse-fast {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.icon-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.25));
}

.text-layer {
  position: relative;
  z-index: 1;
}

.text-line {
  position: absolute;
  white-space: pre;
  font: 18px/28px "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: rgba(255, 255, 255, 0.9);
  text-align: justify;
  line-height: 28px;
}

@media (max-width: 640px) {
  .text-wrap-icon-wrapper {
    min-height: 180px;
  }
}
</style>
