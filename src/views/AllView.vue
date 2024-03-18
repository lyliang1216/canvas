<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive, computed } from 'vue'

const nowSelect = ref('brush')
const previewCanvas = ref()
const previewCtx = ref()
const imgCanvas = ref()
const imgCtx = ref()
const history = ref<any[]>([])
const currentIndex = ref(0)
const isDrawing = ref(false)
const maxHistorySteps = 15
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
const isArea = computed(() => nowSelect.value === 'area')

// Shift键被按下
const handleKeyDown = (e: any) => {
  if (e.key === 'Shift' && !isArea.value) {
    if (isDrawing.value && !isShiftDown.value) {
      downPoint.x = lastX.value as number
      downPoint.y = lastY.value as number
    }
    isShiftDown.value = true
  }
}

// Shift键被释放
const handleKeyUp = (e: any) => {
  if (e.key === 'Shift' && !isArea.value) {
    isShiftDown.value = false
    downPoint.x = 0
    downPoint.y = 0
    linePoint.x = 0
    linePoint.y = 0
  }
}

const onPreviewMousedown = (event: any) => {
  if (isArea.value) return
  isDrawing.value = true
  if (!isArea.value) {
    ;[lastX.value, lastY.value] = [
      event.clientX - previewCanvas.value.offsetLeft,
      event.clientY - previewCanvas.value.offsetTop
    ]
    if (isShiftDown.value) {
      downPoint.x = lastX.value
      downPoint.y = lastY.value
    }
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
  if (isArea.value) return
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
  if (isArea.value) return
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

const brushUndo = () => {
  if (currentIndex.value > 0) {
    previewCtx.value.putImageData(history.value[currentIndex.value - 1], 0, 0)
    currentIndex.value--
    canRedo.value = true
  } else {
    console.log('无法撤销，已在第一步')
  }
}

const brushRedo = () => {
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

/**
 * 以下是选区工具内容
 */
// 点击的画布
var clickCanvas = ref()
var clickCtx = ref()

const pointArr = ref<{ x: number; y: number }[]>([])
// 连线鼠标的点位
const originX = ref()
const originY = ref()

const pointGroup = reactive<{ x: number; y: number }[][]>([])
const pointAll = computed(() => pointGroup.flat())

const pointIndex = ref(0)

const getLastXY = (arr: any) => {
  return arr[arr.length - 1] || {}
}

const getFirstXY = (arr: any) => {
  return arr[0] || {}
}

const getSecondFromEndXY = (arr: any) => {
  return arr[arr.length - 2] || {}
}

const checkRangeWithError = (x1: any, y1: any, x2: any, y2: any, range: any) => {
  const dx = Math.abs(x1 - x2)
  const dy = Math.abs(y1 - y2)
  return dx <= range && dy <= range
}

const toDrawLine = (ctx: any, x: any, y: any, toX: any, toY: any) => {
  // 绘制新的线条
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(toX, toY)
  ctx.strokeStyle = 'rgba(255,255,255,1)'
  ctx.lineWidth = 2
  ctx.stroke()
}

const onClick = (event: any) => {
  event.stopPropagation()
  if (!isArea.value) return
  // 获取鼠标点击相对于canvas的位置
  var rect = clickCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  // 排除同一位置重复点击
  if (x !== getLastXY(pointArr.value).x && y !== getLastXY(pointArr.value).y) {
    originX.value = x
    originY.value = y
    // 最后点击了第一个点，就可以结束了
    if (
      checkRangeWithError(
        originX.value,
        originY.value,
        getFirstXY(pointArr.value).x,
        getFirstXY(pointArr.value).y,
        10
      )
    ) {
      toDrawLine(
        previewCtx.value,
        getLastXY(pointArr.value).x,
        getLastXY(pointArr.value).y,
        getFirstXY(pointArr.value).x,
        getFirstXY(pointArr.value).y
      )
      fillArea(pointArr.value)
      pointArr.value = []
      originX.value = undefined
      originY.value = undefined
    } else {
      pointArr.value.push({ x: originX.value, y: originY.value })
      if (pointArr.value.length === 1) {
        pointGroup.push(Array.from(pointArr.value))
      } else {
        pointGroup[pointGroup.length - 1] = Array.from(pointArr.value)
      }
      pointIndex.value = pointAll.value.length - 1

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
      previewCtx.value.lineWidth = 1
      previewCtx.value.fillStyle = '#fff'
      previewCtx.value.strokeStyle = '#4FAFFC'
      previewCtx.value.beginPath()
      previewCtx.value.arc(
        getLastXY(pointArr.value).x,
        getLastXY(pointArr.value).y,
        2,
        0,
        Math.PI * 2
      )
      previewCtx.value.fill()
      previewCtx.value.stroke()
      saveCurrent()
    }
  }
}

const fillArea = (points: any) => {
  if (!isArea.value) return false
  // 填充闭合路径
  if (points.length > 2) {
    let firstPoint = points[0]
    points.push(firstPoint) // 将第一个点添加到最后，形成闭合区域
    previewCtx.value.beginPath()
    previewCtx.value.moveTo(firstPoint.x, firstPoint.y)
    for (let i = 1; i < points.length; i++) {
      previewCtx.value.lineTo(points[i].x, points[i].y)
    }
    previewCtx.value.closePath()
    previewCtx.value.fillStyle = 'rgba(240, 68, 68, 0.40)' // 颜色自定义
    previewCtx.value.fill()
    filterAllColor(previewCtx.value, previewCanvas.value)
    clickCtx.value.clearRect(0, 0, clickCanvas.value.width, clickCanvas.value.height)
  }
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

const onDblclick = (event: any) => {
  event.stopPropagation()
  if (!isArea.value) return
  // 获取鼠标双击相对于canvas的位置
  var rect = clickCanvas.value.getBoundingClientRect()
  var x = event.clientX - rect.left
  var y = event.clientY - rect.top
  if (pointArr.value.length > 2) {
    toDrawLine(previewCtx.value, x, y, getFirstXY(pointArr.value).x, getFirstXY(pointArr.value).y)
    fillArea(pointArr.value)
    pointArr.value = []
    originX.value = undefined
    originY.value = undefined
  }
}

// 清除线条函数（可选，用于在鼠标抬起后清除线条）
const clearLine = () => {
  clickCtx.value.clearRect(0, 0, clickCanvas.value.width, clickCanvas.value.height)
}

// 绘制线条函数
const drawLine = (e: any) => {
  if (!isArea.value) return
  if (!e) e = window.event // 兼容IE
  var mouseX = e.clientX - clickCanvas.value.offsetLeft
  var mouseY = e.clientY - clickCanvas.value.offsetTop

  // 处理吸附到起点
  const isNearStart = checkRangeWithError(
    mouseX,
    mouseY,
    getFirstXY(pointArr.value).x,
    getFirstXY(pointArr.value).y,
    10
  )

  // 清除上一次的线条
  clearLine()
  if (pointAll.value.length) {
    toDrawLine(
      clickCtx.value,
      originX.value,
      originY.value,
      isNearStart ? getFirstXY(pointArr.value).x : mouseX,
      isNearStart ? getFirstXY(pointArr.value).y : mouseY
    )
  }
}

const findOriginArr = (index: number) => {
  let i = 0
  for (const group of pointGroup) {
    if (i + group.length >= index + 1) {
      return group.slice(0, index - i + 1)
    }
    i += group.length
  }
}

//撤销
const areaUndo = () => {
  if (currentIndex.value > 0) {
    previewCtx.value.putImageData(history.value[currentIndex.value - 1], 0, 0)
    clickCtx.value.clearRect(0, 0, clickCanvas.value.width, clickCanvas.value.height)
    currentIndex.value--
    canRedo.value = true
    originX.value = pointAll.value[pointIndex.value - 1]?.x
    originY.value = pointAll.value[pointIndex.value - 1]?.y
    pointIndex.value--
    pointArr.value = Array.from(findOriginArr(pointIndex.value) || [])
  } else {
    console.log('无法撤销，已在第一步')
  }
}
const areaRedo = () => {
  if (canRedo.value) {
    previewCtx.value.putImageData(history.value[currentIndex.value + 1], 0, 0)
    currentIndex.value++
    canRedo.value = false
    originX.value = pointAll.value[pointIndex.value + 1]?.x
    originY.value = pointAll.value[pointIndex.value + 1]?.y
    pointIndex.value++
    pointArr.value = Array.from(findOriginArr(pointIndex.value) || [])
  }
}

const undo = () => {
  if (!isArea.value) {
    brushUndo()
  } else {
    areaUndo()
  }
}
const redo = () => {
  if (!isArea.value) {
    brushRedo()
  } else {
    areaRedo()
  }
}

/**
 * 以上是选区工具内容
 */

onMounted(() => {
  // 初始化时获取绘图上下文
  if (clickCanvas.value) {
    clickCtx.value = clickCanvas.value.getContext('2d')
  }
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

const checkType = (type: string) => {
  nowSelect.value = type
}
</script>

<template>
  <button :class="{ active: nowSelect === 'brush' }" @click="checkType('brush')">画笔</button>
  <button :class="{ active: nowSelect === 'area' }" @click="checkType('area')">选区</button>
  <canvas
    id="clickCanvas"
    ref="clickCanvas"
    width="800"
    height="600"
    @click="onClick"
    @dblclick="onDblclick"
    @mousemove="drawLine"
    :style="{ zIndex: nowSelect === 'area' ? 3 : 2 }"
  ></canvas>
  <canvas
    id="previewCanvas"
    ref="previewCanvas"
    width="800"
    height="600"
    @mousedown="onPreviewMousedown"
    @mousemove="onPreviewMousemove"
    @mouseup="onPreviewMouseup"
    :style="{ zIndex: nowSelect === 'area' ? 2 : 3 }"
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
.active {
  color: blue;
  background: #fff;
  border: 1px solid #000;
}
#clickCanvas {
  z-index: 3;
}
#previewCanvas {
  z-index: 2;
}
#imgCanvas {
  z-index: 1;
}
</style>
