import { computed, reactive, ref, type Ref } from 'vue'

export interface Point {
  x: number
  y: number
}

export function useCanvasRefs() {
  const clickCanvasRef = ref<HTMLCanvasElement | null>(null)
  const previewCanvasRef = ref<HTMLCanvasElement | null>(null)
  const imgCanvasRef = ref<HTMLCanvasElement | null>(null)
  const clickCtx = ref<CanvasRenderingContext2D | null>(null)
  const previewCtx = ref<CanvasRenderingContext2D | null>(null)
  const imgCtx = ref<CanvasRenderingContext2D | null>(null)

  return {
    clickCanvasRef,
    previewCanvasRef,
    imgCanvasRef,
    clickCtx,
    previewCtx,
    imgCtx
  }
}

export function useCommonState() {
  const nowSelect = ref<'brush' | 'area'>('brush')
  const isArea = computed(() => nowSelect.value === 'area')
  const lineWidth = 25
  const maskColor = 'rgba(240, 68, 68, 0.40)'

  return {
    nowSelect,
    isArea,
    lineWidth,
    maskColor
  }
}

export function useCommonTool(props: {
  previewCanvasRef: Ref<HTMLCanvasElement | null>
  previewCtx: Ref<CanvasRenderingContext2D | null>
  imgCanvasRef: Ref<HTMLCanvasElement | null>
  imgCtx: Ref<CanvasRenderingContext2D | null>
  history: ImageData[]
  currentIndex: Ref<number>
  canRedo: Ref<boolean>
  maxHistorySteps: number
}) {
  const {
    previewCanvasRef,
    previewCtx,
    imgCanvasRef,
    imgCtx,
    history,
    currentIndex,
    canRedo,
    maxHistorySteps
  } = props

  const filterAllColor = (content: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = content.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    // 遍历每个像素
    for (let i = 0, len = data.length; i < len; i += 4) {
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
    if (!previewCtx.value || !previewCanvasRef.value) return
    if (currentIndex.value !== history.length - 1) {
      history.splice(currentIndex.value + 1)
    }
    // 保存的数量比最大值多一个，因为要还原最后一个
    if (history.length === maxHistorySteps + 1) {
      history.shift()
    }
    const imageData = previewCtx.value.getImageData(
      0,
      0,
      previewCanvasRef.value.width,
      previewCanvasRef.value.height
    )

    history.push(imageData)
    currentIndex.value = history.length - 1
    canRedo.value = false
  }

  const getMaskAndOriginImg = () => {
    if (!previewCanvasRef.value || !imgCanvasRef.value || !imgCtx.value) return
    imgCtx.value.drawImage(
      previewCanvasRef.value,
      0,
      0,
      imgCanvasRef.value.width,
      imgCanvasRef.value.height
    )
    downloadImg(previewCanvasRef.value)
    downloadImg(imgCanvasRef.value)
    setImg()
  }

  const downloadImg = (canvas: HTMLCanvasElement) => {
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
      if (!imgCanvasRef.value || !imgCtx.value) return
      imgCtx.value.drawImage(img, 0, 0, imgCanvasRef.value.width, imgCanvasRef.value.height)
    }
  }

  return {
    filterAllColor,
    saveCurrent,
    getMaskAndOriginImg,
    setImg
  }
}

export function useBrushState() {
  const isDrawing = ref<boolean>(false)
  const lastX = ref<number | null>(null)
  const lastY = ref<number | null>(null)
  // 点击位置
  const downPoint = reactive<Point>({ x: 0, y: 0 })
  // 移动方向位置确定
  const linePoint = reactive<Point>({ x: 0, y: 0 })
  const isShiftDown = ref<boolean>(false)

  return {
    isDrawing,
    lastX,
    lastY,
    downPoint,
    linePoint,
    isShiftDown
  }
}

export function useBrushTool(props: {
  previewCanvasRef: Ref<HTMLCanvasElement | null>
  previewCtx: Ref<CanvasRenderingContext2D | null>
  maskColor: string
  lineWidth: number
  filterAllColor: (content: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
  saveCurrent: () => void
  isDrawing: Ref<boolean>
  isShiftDown: Ref<boolean>
  downPoint: Point
  lastX: Ref<number | null>
  lastY: Ref<number | null>
  linePoint: Point
}) {
  const {
    previewCanvasRef,
    previewCtx,
    maskColor,
    lineWidth,
    filterAllColor,
    saveCurrent,
    isDrawing,
    isShiftDown,
    downPoint,
    lastX,
    lastY,
    linePoint
  } = props
  // Shift键被按下
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      if (isDrawing.value && !isShiftDown.value) {
        downPoint.x = lastX.value || 0
        downPoint.y = lastY.value || 0
      }
      isShiftDown.value = true
    }
  }

  // Shift键被释放
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      isShiftDown.value = false
      downPoint.x = 0
      downPoint.y = 0
      linePoint.x = 0
      linePoint.y = 0
    }
  }

  const onPreviewMousedown = (event: MouseEvent) => {
    isDrawing.value = true
    if (!previewCanvasRef.value) return
    ;[lastX.value, lastY.value] = [
      event.clientX - previewCanvasRef.value.offsetLeft,
      event.clientY - previewCanvasRef.value.offsetTop
    ]
    if (isShiftDown) {
      downPoint.x = lastX.value || 0
      downPoint.y = lastY.value || 0
    }
  }

  const onPreviewMousemove = (event: MouseEvent) => {
    if (
      !isDrawing.value ||
      !previewCanvasRef.value ||
      !previewCtx.value ||
      !lastX.value ||
      !lastY.value
    )
      return
    previewCtx.value.beginPath()
    previewCtx.value.lineWidth = lineWidth // 设置线条宽度
    previewCtx.value.strokeStyle = maskColor // 设置线条宽度
    previewCtx.value.lineCap = 'round' // 圆角线头
    previewCtx.value.lineJoin = 'round' // 相交连接处圆角
    const [x, y] = [
      event.clientX - previewCanvasRef.value.offsetLeft,
      event.clientY - previewCanvasRef.value.offsetTop
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
    filterAllColor(previewCtx.value, previewCanvasRef.value)
  }

  const onPreviewMouseup = () => {
    if (isDrawing.value) {
      saveCurrent()
      downPoint.x = 0
      downPoint.y = 0
      linePoint.x = 0
      linePoint.y = 0
    }
    isDrawing.value = false
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
  return {
    handleKeyDown,
    handleKeyUp,
    onPreviewMousedown,
    onPreviewMousemove,
    onPreviewMouseup
  }
}

export function useSelectionState() {
  const pointArr = reactive<Point[]>([])
  // 连线鼠标的点位
  const originX = ref<number | null>(null)
  const originY = ref<number | null>(null)
  const pointGroup = reactive<Point[][]>([])
  const pointAll = computed<Point[]>(() => pointGroup.flat())
  const pointIndex = ref<number>(0)

  return {
    pointArr,
    originX,
    originY,
    pointGroup,
    pointAll,
    pointIndex
  }
}

export function useSelectionTool(props: {
  clickCanvasRef: Ref<HTMLCanvasElement | null>
  previewCtx: Ref<CanvasRenderingContext2D | null>
  clickCtx: Ref<CanvasRenderingContext2D | null>
  previewCanvasRef: Ref<HTMLCanvasElement | null>
  saveCurrent: () => void
  filterAllColor: (content: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
  pointArr: Point[]
  pointGroup: Point[][]
  pointAll: Ref<Point[]>
  originX: Ref<number | null>
  originY: Ref<number | null>
  pointIndex: Ref<number>
}) {
  const {
    clickCanvasRef,
    previewCtx,
    clickCtx,
    previewCanvasRef,
    saveCurrent,
    filterAllColor,
    pointArr,
    pointGroup,
    pointAll,
    originX,
    originY,
    pointIndex
  } = props

  // 获取数组指定位置元素
  const getPointArrElement = (position: 'first' | 'last' | 'beforeLast') => {
    switch (position) {
      case 'first':
        return pointArr[0] || {}
      case 'last':
        return pointArr[pointArr.length - 1] || {}
      case 'beforeLast':
        return pointArr[pointArr.length - 2] || {}
    }
  }

  // 校验坐标是否在指定点位范围内
  const checkRangeWithPostion = (x1: number, y1: number, x2: number, y2: number, range: number) => {
    const dx = Math.abs(x1 - x2)
    const dy = Math.abs(y1 - y2)
    return dx <= range && dy <= range
  }

  const toDrawLine = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    toX: number,
    toY: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(toX, toY)
    ctx.strokeStyle = 'rgba(255,255,255,1)'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const onClick = (event: MouseEvent) => {
    if (!clickCanvasRef.value || !previewCtx.value) return
    event.stopPropagation()
    // 获取鼠标点击相对于canvas的位置
    const rect = clickCanvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    // 排除同一位置重复点击
    if (x !== getPointArrElement('last').x && y !== getPointArrElement('last').y) {
      originX.value = x
      originY.value = y
      // 最后点击了第一个点，就可以结束了
      if (
        checkRangeWithPostion(
          originX.value,
          originY.value,
          getPointArrElement('first').x,
          getPointArrElement('first').y,
          10
        )
      ) {
        toDrawLine(
          previewCtx.value,
          getPointArrElement('last').x,
          getPointArrElement('last').y,
          getPointArrElement('first').x,
          getPointArrElement('first').y
        )
        fillArea(pointArr)
        pointArr.length = 0
        originX.value = null
        originY.value = null
      } else {
        pointArr.push({ x: originX.value, y: originY.value })
        if (pointArr.length === 1) {
          pointGroup.push(Array.from(pointArr))
        } else {
          pointGroup[pointGroup.length - 1] = Array.from(pointArr)
        }
        pointIndex.value = pointAll.value.length - 1

        if (pointArr.length > 1) {
          toDrawLine(
            previewCtx.value,
            getPointArrElement('last').x,
            getPointArrElement('last').y,
            getPointArrElement('beforeLast').x,
            getPointArrElement('beforeLast').y
          )
        }
        // 绘制一个蓝色的点
        previewCtx.value.lineWidth = 1
        previewCtx.value.fillStyle = '#fff'
        previewCtx.value.strokeStyle = '#4FAFFC'
        previewCtx.value.beginPath()
        previewCtx.value.arc(
          getPointArrElement('last').x,
          getPointArrElement('last').y,
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

  const fillArea = (points: Point[]) => {
    if (!previewCtx.value || !clickCtx.value || !clickCanvasRef.value || !previewCanvasRef.value)
      return
    // 填充闭合路径
    if (points.length > 2) {
      const firstPoint = points[0]
      points.push(firstPoint) // 将第一个点添加到最后，形成闭合区域
      previewCtx.value.beginPath()
      previewCtx.value.moveTo(firstPoint.x, firstPoint.y)
      for (let i = 1; i < points.length; i++) {
        previewCtx.value.lineTo(points[i].x, points[i].y)
      }
      previewCtx.value.closePath()
      previewCtx.value.fillStyle = 'rgba(240, 68, 68, 0.40)' // 颜色自定义
      previewCtx.value.fill()
      filterAllColor(previewCtx.value, previewCanvasRef.value)
      clickCtx.value.clearRect(0, 0, clickCanvasRef.value.width, clickCanvasRef.value.height)
    }
  }

  const onDblclick = (event: MouseEvent) => {
    event.stopPropagation()
    if (!clickCanvasRef.value || !previewCtx.value) return
    // 获取鼠标双击相对于canvas的位置
    const rect = clickCanvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if (pointArr.length > 2) {
      toDrawLine(
        previewCtx.value,
        x,
        y,
        getPointArrElement('first').x,
        getPointArrElement('first').y
      )
      fillArea(pointArr)
      pointArr.length = 0
      originX.value = null
      originY.value = null
    }
  }

  // 清除线条函数（可选，用于在鼠标抬起后清除线条）
  const clearLine = () => {
    if (!clickCtx.value || !clickCanvasRef.value) return
    clickCtx.value.clearRect(0, 0, clickCanvasRef.value.width, clickCanvasRef.value.height)
  }

  // 绘制线条函数
  const drawLine = (e: MouseEvent) => {
    if (!clickCanvasRef.value || !clickCtx.value) return
    if (!e) e = window.event as MouseEvent // 兼容IE
    const mouseX = e.clientX - clickCanvasRef.value.offsetLeft
    const mouseY = e.clientY - clickCanvasRef.value.offsetTop

    // 处理吸附到起点
    const isNearStart = checkRangeWithPostion(
      mouseX,
      mouseY,
      getPointArrElement('first').x,
      getPointArrElement('first').y,
      10
    )

    // 清除上一次的线条
    clearLine()
    if (pointAll.value.length && originX.value && originY.value) {
      toDrawLine(
        clickCtx.value,
        originX.value,
        originY.value,
        isNearStart ? getPointArrElement('first').x : mouseX,
        isNearStart ? getPointArrElement('first').y : mouseY
      )
    }
  }

  return {
    onClick,
    onDblclick,
    drawLine
  }
}

export function useStepsState() {
  const history = reactive<ImageData[]>([])
  const currentIndex = ref<number>(0)
  const canRedo = ref<boolean>(false)
  const maxHistorySteps = 15

  return {
    history,
    currentIndex,
    canRedo,
    maxHistorySteps
  }
}

export function useStepsTool(props: {
  previewCtx: Ref<CanvasRenderingContext2D | null>
  clickCtx: Ref<CanvasRenderingContext2D | null>
  clickCanvasRef: Ref<HTMLCanvasElement | null>
  isArea: Ref<boolean>
  pointGroup: Point[][]
  originX: Ref<number | null>
  originY: Ref<number | null>
  pointAll: Ref<Point[]>
  pointIndex: Ref<number>
  pointArr: Point[]
  history: ImageData[]
  currentIndex: Ref<number>
  canRedo: Ref<boolean>
}) {
  const {
    previewCtx,
    clickCtx,
    clickCanvasRef,
    isArea,
    pointGroup,
    originX,
    originY,
    pointAll,
    pointIndex,
    pointArr,
    history,
    currentIndex,
    canRedo
  } = props

  const findOriginArr = (index: number) => {
    let i = 0
    for (const group of pointGroup) {
      if (i + group.length >= index + 1) {
        return group.slice(0, index - i + 1)
      }
      i += group.length
    }
  }

  const brushUndo = () => {
    if (!previewCtx.value) return
    if (currentIndex.value > 0) {
      previewCtx.value.putImageData(history[currentIndex.value - 1], 0, 0)
      currentIndex.value--
      canRedo.value = true
    } else {
      console.log('无法撤销，已在第一步')
    }
  }

  const brushRedo = () => {
    if (!previewCtx.value) return
    if (canRedo.value) {
      previewCtx.value.putImageData(history[currentIndex.value + 1], 0, 0)
      currentIndex.value++
      canRedo.value = false
    } else {
      console.log('无法重做')
    }
  }

  const areaUndo = () => {
    if (!previewCtx.value || !clickCtx.value || !clickCanvasRef.value) return
    if (currentIndex.value > 0) {
      previewCtx.value.putImageData(history[currentIndex.value - 1], 0, 0)
      clickCtx.value.clearRect(0, 0, clickCanvasRef.value.width, clickCanvasRef.value.height)
      currentIndex.value--
      canRedo.value = true
      originX.value = pointAll.value[pointIndex.value - 1]?.x
      originY.value = pointAll.value[pointIndex.value - 1]?.y
      pointIndex.value--
      pointArr.splice(0, pointArr.length, ...Array.from(findOriginArr(pointIndex.value) || []))
    } else {
      console.log('无法撤销，已在第一步')
    }
  }
  const areaRedo = () => {
    if (!previewCtx.value) return
    if (canRedo.value) {
      previewCtx.value.putImageData(history[currentIndex.value + 1], 0, 0)
      currentIndex.value++
      canRedo.value = false
      originX.value = pointAll.value[pointIndex.value + 1]?.x
      originY.value = pointAll.value[pointIndex.value + 1]?.y
      pointIndex.value++
      pointArr.splice(0, pointArr.length, ...Array.from(findOriginArr(pointIndex.value) || []))
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

  return {
    undo,
    redo
  }
}
