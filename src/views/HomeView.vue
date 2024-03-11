<script setup lang="ts">
import { onMounted, ref } from 'vue'

const myCanvas = ref(null)
const ctx = ref(null)

onMounted(() => {
  // 初始化时获取绘图上下文
  if (myCanvas.value) {
    ctx.value = myCanvas.value.getContext('2d')
    saveCurrent()
  }
})

let isDrawing = false
let lastX = 0
let lastY = 0
let history = []
let currentIndex = 0
const maxHistorySteps = 3

const onMousedown = (event) => {
  isDrawing = true
  ;[lastX, lastY] = [
    event.clientX - myCanvas.value.offsetLeft,
    event.clientY - myCanvas.value.offsetTop
  ]
}
const onMousemove = (event) => {
  if (!isDrawing) return
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
  if (isDrawing) {
    if (history.length === maxHistorySteps + 1) {
      history.shift()
    }
    saveCurrent()
  }
  isDrawing = false
}

const saveCurrent = () => {
  const imageData = ctx.value.getImageData(0, 0, myCanvas.value.width, myCanvas.value.height)
  history.push(imageData)
  currentIndex = history.length - 1
  console.log(history.length, currentIndex)
}

const undo = () => {
  console.log(history.length, currentIndex)
  if (currentIndex > 0) {
    ctx.value.putImageData(history[currentIndex - 1], 0, 0)
    history.pop()
    currentIndex = history.length - 1
  } else {
    console.log('无法撤销，已在第一步')
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
</template>
