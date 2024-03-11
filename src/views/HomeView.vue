<script setup lang="ts">
import { onMounted, ref } from 'vue'

const myCanvas = ref(null)
const ctx = ref(null)
const history = ref([])
const currentIndex = ref(0)
const isDrawing = ref(false)
const maxHistorySteps = 3
const canRedo = ref(false)
let lastX = 0
let lastY = 0

onMounted(() => {
  // 初始化时获取绘图上下文
  if (myCanvas.value) {
    ctx.value = myCanvas.value.getContext('2d')
    saveCurrent()
  }
})

const onMousedown = (event) => {
  isDrawing.value = true
  ;[lastX, lastY] = [
    event.clientX - myCanvas.value.offsetLeft,
    event.clientY - myCanvas.value.offsetTop
  ]
}
const onMousemove = (event) => {
  if (!isDrawing.value) return
  ctx.value.beginPath()
  ctx.value.lineWidth = 5 // 设置线条宽度
  ctx.value.moveTo(lastX, lastY)
  const [x, y] = [
    event.clientX - myCanvas.value.offsetLeft,
    event.clientY - myCanvas.value.offsetTop
  ]
  ctx.value.lineTo(x, y)
  ctx.value.stroke()
  ;[lastX, lastY] = [x, y]
}

// 在mousemove事件内部添加保存历史记录的逻辑，需要保存的数量比最大值多一个，因为要还原最后一个
const onMouseup = (event) => {
  if (isDrawing.value) {
    saveCurrent()
  }
  isDrawing.value = false
}

const saveCurrent = () => {
  if (currentIndex.value !== history.value.length - 1) {
    history.value.splice(currentIndex.value + 1)
  }
  if (history.value.length === maxHistorySteps + 1) {
    history.value.shift()
  }
  const imageData = ctx.value.getImageData(0, 0, myCanvas.value.width, myCanvas.value.height)
  history.value.push(imageData)
  currentIndex.value = history.value.length - 1
  canRedo.value = false
}

const undo = () => {
  if (currentIndex.value > 0) {
    ctx.value.putImageData(history.value[currentIndex.value - 1], 0, 0)
    currentIndex.value--
    canRedo.value = true
  } else {
    console.log('无法撤销，已在第一步')
  }
}

const redo = () => {
  if (canRedo.value) {
    ctx.value.putImageData(history.value[currentIndex.value + 1], 0, 0)
    currentIndex.value++
    canRedo.value = false
  } else {
    console.log('无法重做')
  }
}
</script>

<template>
  <canvas
    ref="myCanvas"
    width="500"
    height="500"
    @mousedown="onMousedown"
    @mousemove="onMousemove"
    @mouseup="onMouseup"
  ></canvas>
  <button @click="undo">撤销</button>
  <button @click="redo">重做</button>
</template>

<style scoped>
canvas {
  border: 1px solid #000;
}
</style>
