<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive } from 'vue'

const myCanvas = ref()
const ctx = ref()
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
const color = ref('blue')
// 点击位置
const downPoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 })
// 移动方向位置确定
const linePoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 })
// x横向移动，后续位置以横向为准；y纵向移动，后续位置以纵向为准；c正中间(45°角)，后续位置以长的为准
const linePosition = ref<'x' | 'y' | 'c'>('x')
const isShiftDown = ref(false)

// Shift键被按下
const handleKeyDown = (e: any) => {
  if (e.key === 'Shift') {
    if (isDrawing.value && !isShiftDown.value) {
      console.log('按下了')
      downPoint.x = lastX.value as number
      downPoint.y = lastY.value as number
    }
    isShiftDown.value = true
  }
}

// Shift键被释放
const handleKeyUp = (e: any) => {
  if (e.key === 'Shift') {
    console.log('松开了')
    isShiftDown.value = false
    downPoint.x = 0
    downPoint.y = 0
    linePoint.x = 0
    linePoint.y = 0
  }
}

const onMousedown = (event: any) => {
  isDrawing.value = true
  ;[lastX.value, lastY.value] = [
    event.clientX - myCanvas.value.offsetLeft,
    event.clientY - myCanvas.value.offsetTop
  ]
  if (isShiftDown.value) {
    console.log('按下并且鼠标开始了')
    downPoint.x = lastX.value
    downPoint.y = lastY.value
  }
}

/**
 * 计算与已知两点共线的第三点坐标。
 * @param {Object} point1 - 第一个已知点的坐标对象，包含属性{x, y}。
 * @param {Object} point2 - 第二个已知点的坐标对象，包含属性{x, y}。
 * @param {Number} knownCoordinate - 第三个点的已知坐标值，可能是横坐标（x）或纵坐标（y），具体取决于isHorizontal参数。
 * @param {Boolean} isHorizontal - 标记已知坐标是横坐标还是纵坐标。
 *   如果为true，表示knownCoordinate是横坐标x，函数将计算对应的纵坐标y；
 *   如果为false，表示knownCoordinate是纵坐标y，函数将计算对应的横坐标x。
 * @return {Number} 返回计算出的未知坐标值。
 */
const calculateCoordinate = (
  point1: { x: number; y: number },
  point2: { x: number; y: number },
  knownCoordinate: number,
  isHorizontal: boolean
) => {
  // 计算斜率
  var slope = (point2.y - point1.y) / (point2.x - point1.x)
  // 根据斜率计算位置
  if (isHorizontal) {
    return point1.y - (point1.x - knownCoordinate) * slope
  } else {
    return point1.x - (point1.y - knownCoordinate) / slope
  }
}

const getPosition = (x: number, y: number) => {
  // console.log(downPoint, linePoint, { x, y })
  switch (linePosition.value) {
    case 'c': {
      const xDistance = Math.abs(x - (linePoint.x || 0))
      const yDistance = Math.abs(y - (linePoint.y || 0))
      const params = xDistance > yDistance ? x : y
      const otherParams = calculateCoordinate(downPoint, linePoint, params, false)
      return {
        x: xDistance > yDistance ? params : otherParams,
        y: xDistance > yDistance ? otherParams : params
      }
    }
    case 'x': {
      const otherParams = calculateCoordinate(downPoint, linePoint, x, false)
      return {
        x,
        y: otherParams
      }
    }
    case 'y': {
      const otherParams = calculateCoordinate(downPoint, linePoint, y, true)
      return {
        x: otherParams,
        y
      }
    }
  }
}

const onMousemove = (event: any) => {
  if (!isDrawing.value) return
  ctx.value.beginPath()
  ctx.value.lineWidth = width.value // 设置线条宽度
  ctx.value.strokeStyle = color.value // 设置线条宽度
  ctx.value.lineCap = 'round' // 圆角线头
  const [x, y] = [
    event.clientX - myCanvas.value.offsetLeft,
    event.clientY - myCanvas.value.offsetTop
  ]
  // 按下shift后移动距离超过10，才会确定准确的方向
  if (isShiftDown.value && !linePoint.x && !linePoint.y) {
    console.log('进来了')

    const xDistance = Math.abs(x - downPoint.x)
    const yDistance = Math.abs(y - downPoint.y)
    if (xDistance >= 1 && yDistance >= 1) {
      linePoint.x = x
      linePoint.y = y
      linePosition.value = xDistance === yDistance ? 'c' : xDistance > yDistance ? 'x' : 'y'
      console.log('方向结果是' + linePosition.value)
    }
  }
  if (isShiftDown.value && linePoint.x && linePoint.y) {
    const position = getPosition(x, y)
    console.log('开始画')
    console.log(position, x, y, '基准点位', downPoint, linePoint)
    console.log('结束了')
    ctx.value.moveTo(lastX.value, lastY.value)
    ctx.value.lineTo(position.x, position.y)
    ctx.value.stroke()
    ;[lastX.value, lastY.value] = [position.x, position.y]
  } else {
    ctx.value.moveTo(lastX.value, lastY.value)
    ctx.value.lineTo(x, y)
    ctx.value.stroke()
    ;[lastX.value, lastY.value] = [x, y]
  }
}

// 在mousemove事件内部添加保存历史记录的逻辑，需要保存的数量比最大值多一个，因为要还原最后一个
const onMouseup = (event: any) => {
  if (isDrawing.value) {
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
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
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
