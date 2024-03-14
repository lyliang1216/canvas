<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive } from 'vue'

const myCanvas = ref()
const ctx = ref()
const showCanvas = ref()
const showCtx = ref()
const imgCanvas = ref()
const imgCtx = ref()
const history = ref<any[]>([])
const currentIndex = ref(0)
const isDrawing = ref(false)
const maxHistorySteps = 3
const canRedo = ref(false)
const width = ref(25)
const color = ref('rgba(255,255,255,0.8)')
// 点击位置
const downPoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 })
// 移动方向位置确定
const linePoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 })
const isShiftDown = ref(false)

// Shift键被按下
const handleKeyDown = (e: any) => {
  if (e.key === 'Shift') {
    isShiftDown.value = true
  }
}

// Shift键被释放
const handleKeyUp = (e: any) => {
  if (e.key === 'Shift') {
    isShiftDown.value = false
    downPoint.x = 0
    downPoint.y = 0
    linePoint.x = 0
    linePoint.y = 0
  }
}

const onMousedown = (event: any) => {
  isDrawing.value = true
  if (isShiftDown.value) {
    downPoint.x = event.clientX - myCanvas.value.offsetLeft
    downPoint.y = event.clientY - myCanvas.value.offsetTop
  }

  ctx.value.beginPath()
  ctx.value.lineWidth = width.value // 设置线条宽度
  ctx.value.strokeStyle = color.value // 设置线条宽度
  ctx.value.lineCap = 'round' // 圆角线头
  ctx.value.moveTo(
    event.clientX - myCanvas.value.offsetLeft,
    event.clientY - myCanvas.value.offsetTop
  )
}

// 根据AB两点的直线，获取P点x轴或y轴任一数值相同的，并且在直线AB上的点的坐标信息
const getPosition = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  p: { x: number; y: number }
) => {
  // 获取P点垂直X轴相交AB时Y的位置
  const getY = () => {
    return ((p.x - a.x) / (b.x - a.x)) * (b.y - a.y) + a.y
  }
  // 获取P点垂直Y轴相交AB时X的位置
  const getX = () => {
    return ((p.y - a.y) / (b.y - a.y)) * (b.x - a.x) + a.x
  }
  // 获取斜率
  const getSlope = () => {
    return Math.abs((b.y - a.y) / (b.x - a.x))
  }
  if (b.x === a.x && b.y !== a.y) {
    //垂直于X轴
    return {
      x: a.x,
      y: p.y
    }
  } else if (b.y === a.y && b.x !== a.x) {
    // 垂直于Y轴
    return {
      x: p.x,
      y: a.y
    }
  } else {
    // 没有垂直于任何一个轴，存在斜率
    if (getSlope() < 1) {
      return {
        x: p.x,
        y: getY()
      }
    } else {
      return {
        x: getX(),
        y: p.y
      }
    }
  }
}

const onMousemove = (event: any) => {
  if (!isDrawing.value) return
  const [x, y] = [
    event.clientX - myCanvas.value.offsetLeft,
    event.clientY - myCanvas.value.offsetTop
  ]
  // 按下shift后移动距离超过10，才会确定准确的方向
  if (isShiftDown.value && (!linePoint.x || !linePoint.y)) {
    const xDistance = Math.abs(x - downPoint.x)
    const yDistance = Math.abs(y - downPoint.y)
    if (xDistance >= 5 && yDistance >= 5) {
      linePoint.x = x
      linePoint.y = y
    }
  }
  if (isShiftDown.value) {
    if (linePoint.x && linePoint.y) {
      const position = getPosition(downPoint, linePoint, { x, y })
      ctx.value.lineTo(position.x, position.y)
      ctx.value.clearRect(0, 0, myCanvas.value.width, myCanvas.value.height)
      ctx.value.stroke()
    }
  } else {
    ctx.value.lineTo(x, y)
    ctx.value.clearRect(0, 0, myCanvas.value.width, myCanvas.value.height)
    ctx.value.stroke()
  }
}

const onMouseup = (event: any) => {
  if (isDrawing.value) {
    // showCtx.value.globalCompositeOperation = 'destination-over'
    showCtx.value.drawImage(myCanvas.value, 0, 0, showCanvas.value.width, showCanvas.value.height)
    ctx.value.clearRect(0, 0, myCanvas.value.width, myCanvas.value.height)
    saveCurrent()
    downPoint.x = 0
    downPoint.y = 0
    linePoint.x = 0
    linePoint.y = 0
  }
  isDrawing.value = false
}

const saveCurrent = () => {
  if (currentIndex.value !== history.value.length - 1) {
    history.value.splice(currentIndex.value + 1)
  }
  // 保存的数量比最大值多一个，因为要还原最后一个
  if (history.value.length === maxHistorySteps + 1) {
    history.value.shift()
  }
  const imageData = showCtx.value.getImageData(
    0,
    0,
    showCanvas.value.width,
    showCanvas.value.height
  )
  history.value.push(imageData)
  currentIndex.value = history.value.length - 1
  canRedo.value = false
}

const undo = () => {
  if (currentIndex.value > 0) {
    showCtx.value.putImageData(history.value[currentIndex.value - 1], 0, 0)
    currentIndex.value--
    canRedo.value = true
  } else {
    console.log('无法撤销，已在第一步')
  }
}

const redo = () => {
  if (canRedo.value) {
    showCtx.value.putImageData(history.value[currentIndex.value + 1], 0, 0)
    currentIndex.value++
    canRedo.value = false
  } else {
    console.log('无法重做')
  }
}

const save = () => {
  imgCtx.value.drawImage(showCanvas.value, 0, 0, imgCanvas.value.width, imgCanvas.value.height)
  downloadImg(showCanvas.value)
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
  }
  if (showCanvas.value) {
    showCtx.value = showCanvas.value.getContext('2d')
    saveCurrent()
  }
  if (imgCanvas.value) {
    imgCtx.value = imgCanvas.value.getContext('2d')
    setImg()
  }
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<template>
  <span>-----画笔工具</span>
  <canvas
    id="myCanvas"
    ref="myCanvas"
    width="800"
    height="600"
    @mousedown="onMousedown"
    @mousemove="onMousemove"
    @mouseup="onMouseup"
  ></canvas>
  <canvas id="showCanvas" ref="showCanvas" width="800" height="600"></canvas>
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
  z-index: 3;
}
#showCanvas {
  z-index: 2;
}
#imgCanvas {
  z-index: 1;
}
</style>
