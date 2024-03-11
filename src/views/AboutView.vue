<script lang="ts" setup>
import { onMounted, ref } from 'vue'

// 点击的画布
var clickCanvas = ref(null)
var clickCtx = ref(null)
// 实际看的画布
var previewCanvas = ref(null)
var previewCtx = ref(null)

const pointArr = ref([])
const originX = ref(null)
const originY = ref(null)

const getLastXY = (arr) => {
  return {
    x: arr[arr.length - 1]?.[0],
    y: arr[arr.length - 1]?.[1]
  }
}

const getFirstXY = (arr) => {
  return {
    x: arr[0]?.[0],
    y: arr[0]?.[1]
  }
}

const getSecondFromEndXY = (arr) => {
  return {
    x: arr[arr.length - 2]?.[0],
    y: arr[arr.length - 2]?.[1]
  }
}

const checkRangeWithError = (x1, y1, x2, y2, range) => {
  const dx = Math.abs(x1 - x2)
  const dy = Math.abs(y1 - y2)

  return dx <= range && dy <= range
}

const toDrawLine = (ctx, x, y, toX, toY) => {
  // 绘制新的线条
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(toX, toY)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.stroke()
}

const onClick = (event) => {
  // 获取鼠标点击相对于canvas的位置
  var rect = clickCanvas.value.getBoundingClientRect()
  originX.value = event.clientX - rect.left
  originY.value = event.clientY - rect.top

  // 排除同一位置重复点击
  if (
    originX.value !== getLastXY(pointArr.value).x &&
    originY.value !== getLastXY(pointArr.value).y
  ) {
    // 点击了第一个点，就可以结束了
    if (
      checkRangeWithError(
        originX.value,
        originY.value,
        getFirstXY(pointArr.value).x,
        getFirstXY(pointArr.value).y,
        5
      )
    ) {
      toDrawLine(
        previewCtx.value,
        getLastXY(pointArr.value).x,
        getLastXY(pointArr.value).y,
        getFirstXY(pointArr.value).x,
        getFirstXY(pointArr.value).y
      )
      pointArr.value = []
    } else {
      pointArr.value.push([originX.value, originY.value])
      if (pointArr.value.length > 1) {
        toDrawLine(
          previewCtx.value,
          getLastXY(pointArr.value).x,
          getLastXY(pointArr.value).y,
          getSecondFromEndXY(pointArr.value).x,
          getSecondFromEndXY(pointArr.value).y
        )
      }

      // 绘制一个蓝色的点
      previewCtx.value.fillStyle = 'blue'
      previewCtx.value.beginPath()
      previewCtx.value.arc(
        getLastXY(pointArr.value).x,
        getLastXY(pointArr.value).y,
        5,
        0,
        Math.PI * 2
      ) // 绘制一个半径为5的圆形点
      previewCtx.value.fill()
    }
  }
}

const onDblclick = (event) => {
  // 获取鼠标双击相对于canvas的位置
  var rect = clickCanvas.value.getBoundingClientRect()
  var x = event.clientX - rect.left
  var y = event.clientY - rect.top
  if (pointArr.value.length > 2) {
    toDrawLine(previewCtx.value, x, y, getFirstXY(pointArr.value).x, getFirstXY(pointArr.value).y)
    pointArr.value = []
  }
}

// 清除线条函数（可选，用于在鼠标抬起后清除线条）
const clearLine = () => {
  clickCtx.value.clearRect(0, 0, clickCanvas.value.width, clickCanvas.value.height)
}

// 绘制线条函数
const drawLine = (e) => {
  if (!e) e = window.event // 兼容IE
  var mouseX = e.clientX - clickCanvas.value.offsetLeft
  var mouseY = e.clientY - clickCanvas.value.offsetTop

  // 清除上一次的线条
  clearLine()

  toDrawLine(
    clickCtx.value,
    getLastXY(pointArr.value).x,
    getLastXY(pointArr.value).y,
    mouseX,
    mouseY
  )
}

onMounted(() => {
  if (clickCanvas.value) {
    clickCtx.value = clickCanvas.value.getContext('2d')
  }
  if (previewCanvas.value) {
    previewCtx.value = previewCanvas.value.getContext('2d')
  }
})
</script>

<template>
  <canvas
    id="clickCanvas"
    ref="clickCanvas"
    width="800"
    height="600"
    @click="onClick"
    @dblclick="onDblclick"
    @mousemove="drawLine"
  ></canvas>
  <canvas id="previewCanvas" ref="previewCanvas" width="800" height="600"></canvas>
</template>

<style scoped>
canvas {
  border: 1px solid #000;
  position: fixed;
  top: 100px;
  left: 100px;
}
#clickCanvas {
  z-index: 2;
}
#previewCanvas {
  z-index: 1;
}
</style>
