<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive } from 'vue'

const previewCanvas = ref()
const previewCtx = ref()
const imgCanvas = ref()
const imgCtx = ref()
const history = ref<any[]>([])
const currentIndex = ref(0)
const isDrawing = ref(false)
const maxHistorySteps = 3
const canRedo = ref(false)
const lastX = ref<number | null>(null)
const lastY = ref<number | null>(null)
const width = ref(25)
const color = ref('rgba(240, 68, 68, 0.40)')
// 点击位置
const downPoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 })
// 移动方向位置确定
const linePoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 })
const isShiftDown = ref(false)

// Shift键被按下
const handleKeyDown = (e: any) => {
  if (e.key === 'Shift') {
    if (isDrawing.value && !isShiftDown.value) {
      downPoint.x = lastX.value as number
      downPoint.y = lastY.value as number
    }
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

const onPreviewMousedown = (event: any) => {
  isDrawing.value = true
  ;[lastX.value, lastY.value] = [
    event.clientX - previewCanvas.value.offsetLeft,
    event.clientY - previewCanvas.value.offsetTop
  ]
  if (isShiftDown.value) {
    downPoint.x = lastX.value
    downPoint.y = lastY.value
  }
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

const onPreviewMousemove = (event: any) => {
  if (!isDrawing.value) return
  previewCtx.value.beginPath()

  previewCtx.value.lineWidth = width.value // 设置线条宽度
  previewCtx.value.strokeStyle = color.value // 设置线条宽度
  previewCtx.value.lineCap = 'round' // 圆角线头
  previewCtx.value.lineJoin = 'round' // 相交连接处圆角
  const [x, y] = [
    event.clientX - previewCanvas.value.offsetLeft,
    event.clientY - previewCanvas.value.offsetTop
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
      previewCtx.value.moveTo(lastX.value, lastY.value)
      previewCtx.value.lineTo(position.x, position.y)
      previewCtx.value.stroke()
      ;[lastX.value, lastY.value] = [position.x, position.y]
    }
  } else {
    previewCtx.value.moveTo(lastX.value, lastY.value)
    previewCtx.value.lineTo(x, y)
    previewCtx.value.stroke()
    ;[lastX.value, lastY.value] = [x, y]
  }
  filterAllColor(previewCtx.value, previewCanvas.value)
}

const onPreviewMouseup = (event: any) => {
  if (isDrawing.value) {
    saveCurrent()
    downPoint.x = 0
    downPoint.y = 0
    linePoint.x = 0
    linePoint.y = 0
  }
  isDrawing.value = false
}

const filterAllColor = (content: any, canvas: any) => {
  var imageData = content.getImageData(0, 0, canvas.width, canvas.height)
  var data = imageData.data

  // 遍历每个像素
  for (var i = 0, len = data.length; i < len; i += 4) {
    // 检查当前像素是否足够不透明（这里假设大于128作为不透明的标准）
    if (data[i + 3] > 128) {
      // 更改像素颜色为rgba(240, 68, 68, 0.40)
      data[i] = 240 // R分量
      data[i + 1] = 68 // G分量
      data[i + 2] = 68 // B分量
      data[i + 3] = 102 // A分量，0.4 * 255
    }
  }

  // 将修改后的图像数据放回canvas
  content.putImageData(imageData, 0, 0)
}

const saveCurrent = () => {
  if (currentIndex.value !== history.value.length - 1) {
    history.value.splice(currentIndex.value + 1)
  }
  // 保存的数量比最大值多一个，因为要还原最后一个
  if (history.value.length === maxHistorySteps + 1) {
    history.value.shift()
  }
  const imageData = previewCtx.value.getImageData(
    0,
    0,
    previewCanvas.value.width,
    previewCanvas.value.height
  )

  history.value.push(imageData)
  currentIndex.value = history.value.length - 1
  canRedo.value = false
}

const undo = () => {
  if (currentIndex.value > 0) {
    previewCtx.value.putImageData(history.value[currentIndex.value - 1], 0, 0)
    currentIndex.value--
    canRedo.value = true
  } else {
    console.log('无法撤销，已在第一步')
  }
}

const redo = () => {
  if (canRedo.value) {
    previewCtx.value.putImageData(history.value[currentIndex.value + 1], 0, 0)
    currentIndex.value++
    canRedo.value = false
  } else {
    console.log('无法重做')
  }
}

const save = () => {
  imgCtx.value.drawImage(previewCanvas.value, 0, 0, imgCanvas.value.width, imgCanvas.value.height)
  downloadImg(previewCanvas.value)
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
  if (previewCanvas.value) {
    previewCtx.value = previewCanvas.value.getContext('2d')
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
    id="previewCanvas"
    ref="previewCanvas"
    width="800"
    height="600"
    @mousedown="onPreviewMousedown"
    @mousemove="onPreviewMousemove"
    @mouseup="onPreviewMouseup"
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
#previewCanvas {
  z-index: 3;
}
#showCanvas {
  z-index: 2;
}
#imgCanvas {
  z-index: 1;
}
</style>
