<script setup lang="ts">
import { onMounted, ref } from 'vue'

const myCanvas = ref()
const ctx = ref()
const imgCanvas = ref()
const imgCtx = ref()
const history = ref<any[]>([])
const currentIndex = ref(0)
const isDrawing = ref(false)
const maxHistorySteps = 3
const canRedo = ref(false)
let lastX = 0
let lastY = 0
const width = ref(25)
const color = ref('blue')

const onMousedown = (event: any) => {
  isDrawing.value = true
  ;[lastX, lastY] = [
    event.clientX - myCanvas.value.offsetLeft,
    event.clientY - myCanvas.value.offsetTop
  ]
}
const onMousemove = (event: any) => {
  if (!isDrawing.value) return
  ctx.value.beginPath()
  ctx.value.lineWidth = width.value // 设置线条宽度
  ctx.value.strokeStyle = color.value // 设置线条宽度
  ctx.value.lineCap = 'round' // 圆角线头
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
const onMouseup = (event: any) => {
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

const save = () => {
  imgCtx.value.drawImage(myCanvas.value, 0, 0, imgCanvas.value.width, imgCanvas.value.height)
  downloadImg(myCanvas.value)
  downloadImg(imgCanvas.value)
  setImg()
}

const downloadImg = (canvas: any) => {
  const dataURL = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = 'canvas-image.png'
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const setImg = () => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = 'https://file.ccmapp.cn/group1/M00/16/64/rApntl7CSdeAbpYqABArOjGaasg001.jpg'
  img.onload = () => {
    imgCtx.value.drawImage(img, 0, 0, imgCanvas.value.width, imgCanvas.value.height)
  }
}

onMounted(() => {
  // 初始化时获取绘图上下文
  if (myCanvas.value) {
    ctx.value = myCanvas.value.getContext('2d')
    saveCurrent()
  }
  if (imgCanvas.value) {
    imgCtx.value = imgCanvas.value.getContext('2d')
    setImg()
  }
})
</script>

<template>
  <canvas
    id="myCanvas"
    ref="myCanvas"
    width="800"
    height="600"
    @mousedown="onMousedown"
    @mousemove="onMousemove"
    @mouseup="onMouseup"
  ></canvas>
  <canvas id="imgCanvas" ref="imgCanvas" width="800" height="600"></canvas>
  <button @click="undo">撤销</button>
  <button @click="redo">重做</button>
  <button @click="save">保存</button>
</template>

<style scoped>
canvas {
  border: 1px solid #000;
  position: fixed;
  top: 100px;
  left: 100px;
}
#myCanvas {
  z-index: 2;
}
#imgCanvas {
  z-index: 1;
}
</style>
