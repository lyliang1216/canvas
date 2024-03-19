import { reactive, ref, type Ref } from 'vue'

type ResizePosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-bottom'
  | ''

interface SizeUnit {
  width: string
  height: string
}
interface PositionUnit {
  left: string
  top: string
}
interface Size {
  width: number
  height: number
}

interface Point {
  x: number
  y: number
}

export function useCropState() {
  const cropAreaRef = ref<HTMLCanvasElement | null>(null)
  const cropWrapperRef = ref<HTMLCanvasElement | null>(null)
  const cropAreaStyles = reactive<SizeUnit & PositionUnit>({
    width: '300px',
    height: '300px',
    left: '50px',
    top: '50px'
  })
  const confirmBoxStyles = reactive<PositionUnit>({
    left: '50px',
    top: '50px'
  })
  const resizePosition = reactive<ResizePosition[]>([
    'top',
    'bottom',
    'left',
    'right',
    'left-top',
    'left-bottom',
    'right-top',
    'right-bottom'
  ])
  const positionType = ref<ResizePosition>('')
  const maxSize = reactive<Size>({
    width: 0,
    height: 0
  })

  const isMove = ref<boolean>(false)
  const originPosition = reactive<Point>({
    x: 0,
    y: 0
  })
  const moveStartPosition = reactive<Point>({
    x: 0,
    y: 0
  })
  const rectSizePosition = reactive<Point & Size>({
    x: 50,
    y: 50,
    width: 300,
    height: 300
  })
  return {
    cropAreaRef,
    cropWrapperRef,
    cropAreaStyles,
    confirmBoxStyles,
    resizePosition,
    positionType,
    maxSize,
    isMove,
    originPosition,
    moveStartPosition,
    rectSizePosition
  }
}

export function useCropMethod(props: {
  cropAreaRef: Ref<HTMLCanvasElement | null>
  cropWrapperRef: Ref<HTMLCanvasElement | null>
  positionType: Ref<ResizePosition>
  maxSize: Size
  cropAreaStyles: SizeUnit & PositionUnit
  isMove: Ref<boolean>
  moveStartPosition: Point
  originPosition: Point
  rectSizePosition: Point & Size
  confirmBoxStyles: PositionUnit
}) {
  const {
    cropAreaRef,
    cropWrapperRef,
    positionType,
    maxSize,
    cropAreaStyles,
    isMove,
    moveStartPosition,
    originPosition,
    rectSizePosition,
    confirmBoxStyles
  } = props
  const onMousedown = (event: MouseEvent, position: ResizePosition) => {
    event.stopPropagation()
    if (!cropAreaRef.value || !cropWrapperRef.value) return
    const rect = cropAreaRef.value.getBoundingClientRect()
    const boxRect = cropWrapperRef.value.getBoundingClientRect()
    positionType.value = position
    switch (position) {
      case 'left': {
        maxSize.width = Math.trunc(rect.right - boxRect.left)
        maxSize.height = rect.height
        break
      }
      case 'right': {
        maxSize.width = Math.trunc(boxRect.right - rect.left)
        maxSize.height = rect.height
        break
      }
      case 'top': {
        maxSize.width = rect.width
        maxSize.height = Math.trunc(rect.bottom - boxRect.top)
        break
      }
      case 'bottom': {
        maxSize.width = rect.width
        maxSize.height = Math.trunc(boxRect.bottom - rect.top)
        break
      }
      case 'left-top': {
        maxSize.width = Math.trunc(rect.right - boxRect.left)
        maxSize.height = Math.trunc(rect.bottom - boxRect.top)
        break
      }
      case 'left-bottom': {
        maxSize.width = Math.trunc(rect.right - boxRect.left)
        maxSize.height = Math.trunc(boxRect.bottom - rect.top)
        break
      }
      case 'right-top': {
        maxSize.width = Math.trunc(boxRect.right - rect.left)
        maxSize.height = Math.trunc(rect.bottom - boxRect.top)
        break
      }
      case 'right-bottom': {
        maxSize.width = Math.trunc(boxRect.right - rect.left)
        maxSize.height = Math.trunc(boxRect.bottom - rect.top)
        break
      }
    }
  }
  const onMousemove = (event: MouseEvent) => {
    if (!cropAreaRef.value || !cropWrapperRef.value) return
    const rect = cropAreaRef.value.getBoundingClientRect()
    const boxRect = cropWrapperRef.value.getBoundingClientRect()
    const mouseX = event.clientX
    const mouseY = event.clientY
    if (positionType.value) {
      switch (positionType.value) {
        case 'left': {
          const width = Math.trunc(rect.right - mouseX)
          if (width <= maxSize.width) {
            cropAreaStyles.width = width + 'px'
            width > 0 && (cropAreaStyles.left = mouseX - boxRect.left + 'px')
          }
          if (width < 0) {
            positionType.value = 'right'
          }
          break
        }
        case 'right': {
          const width = Math.trunc(mouseX - rect.left)
          if (width <= maxSize.width) {
            cropAreaStyles.width = width + 'px'
          }
          if (width < 0) {
            positionType.value = 'left'
          }
          break
        }
        case 'top': {
          const height = Math.trunc(rect.bottom - mouseY)
          if (height <= maxSize.height) {
            cropAreaStyles.height = height + 'px'
            height > 0 && (cropAreaStyles.top = mouseY - boxRect.top + 'px')
          }
          if (height < 0) {
            positionType.value = 'bottom'
          }
          break
        }
        case 'bottom': {
          const height = Math.trunc(mouseY - rect.top)
          if (height <= maxSize.height) {
            cropAreaStyles.height = height + 'px'
          }
          if (height < 0) {
            positionType.value = 'top'
          }
          break
        }
        case 'left-top': {
          const width = Math.trunc(rect.right - mouseX)
          const height = Math.trunc(rect.bottom - mouseY)
          if (width <= maxSize.width) {
            cropAreaStyles.width = width + 'px'
            width > 0 && (cropAreaStyles.left = mouseX - boxRect.left + 'px')
          }
          if (height <= maxSize.height) {
            cropAreaStyles.height = height + 'px'
            height > 0 && (cropAreaStyles.top = mouseY - boxRect.top + 'px')
          }
          if (width < 0 && height > 0) {
            positionType.value = 'right-top'
          }
          if (width < 0 && height < 0) {
            positionType.value = 'right-bottom'
          }
          if (width > 0 && height < 0) {
            positionType.value = 'left-bottom'
          }
          break
        }
        case 'left-bottom': {
          const width = Math.trunc(rect.right - mouseX)
          const height = Math.trunc(mouseY - rect.top)
          if (width <= maxSize.width) {
            cropAreaStyles.width = width + 'px'
            width > 0 && (cropAreaStyles.left = mouseX - boxRect.left + 'px')
          }
          if (height <= maxSize.height) {
            cropAreaStyles.height = height + 'px'
          }
          if (width < 0 && height > 0) {
            positionType.value = 'right-bottom'
          }
          if (width < 0 && height < 0) {
            positionType.value = 'right-top'
          }
          if (width > 0 && height < 0) {
            positionType.value = 'left-top'
          }
          break
        }
        case 'right-top': {
          const width = Math.trunc(mouseX - rect.left)
          const height = Math.trunc(rect.bottom - mouseY)
          if (width <= maxSize.width) {
            cropAreaStyles.width = width + 'px'
          }
          if (height <= maxSize.height) {
            cropAreaStyles.height = height + 'px'
            height > 0 && (cropAreaStyles.top = mouseY - boxRect.top + 'px')
          }
          if (width < 0 && height > 0) {
            positionType.value = 'left-top'
          }
          if (width < 0 && height < 0) {
            positionType.value = 'left-bottom'
          }
          if (width > 0 && height < 0) {
            positionType.value = 'right-bottom'
          }
          break
        }
        case 'right-bottom': {
          const width = Math.trunc(mouseX - rect.left)
          const height = Math.trunc(mouseY - rect.top)
          if (width <= maxSize.width) {
            cropAreaStyles.width = width + 'px'
          }
          if (height <= maxSize.height) {
            cropAreaStyles.height = height + 'px'
          }
          if (width < 0 && height > 0) {
            positionType.value = 'left-bottom'
          }
          if (width < 0 && height < 0) {
            positionType.value = 'left-top'
          }
          if (width > 0 && height < 0) {
            positionType.value = 'right-top'
          }
          break
        }
      }
      onResize()
    }
    if (isMove.value) {
      const distanceX = mouseX - moveStartPosition.x
      const distanceY = mouseY - moveStartPosition.y
      cropAreaStyles.left = originPosition.x + distanceX + 'px'
      cropAreaStyles.top = originPosition.y + distanceY + 'px'
      onResize()
    }
  }
  const onMouseup = () => {
    positionType.value = ''
  }

  const onAreaMousedown = (event: MouseEvent) => {
    if (!cropAreaRef.value || !cropWrapperRef.value) return
    const rect = cropAreaRef.value.getBoundingClientRect()
    const boxRect = cropWrapperRef.value.getBoundingClientRect()
    moveStartPosition.x = event.clientX
    moveStartPosition.y = event.clientY
    originPosition.x = rect.left - boxRect.left
    originPosition.y = rect.top - boxRect.top
    isMove.value = true
  }

  const onResize = () => {
    if (!cropAreaRef.value || !cropWrapperRef.value) return
    const rect = cropAreaRef.value.getBoundingClientRect()
    const boxRect = cropWrapperRef.value.getBoundingClientRect()
    rectSizePosition.width = rect.width
    rectSizePosition.height = rect.height
    rectSizePosition.x = rect.left - boxRect.left
    rectSizePosition.y = rect.top - boxRect.top
    confirmBoxStyles.top = parseInt(cropAreaStyles.top) + parseInt(cropAreaStyles.height) + 2 + 'px'
    confirmBoxStyles.left =
      parseInt(cropAreaStyles.left) + parseInt(cropAreaStyles.width) - 80 + 'px'
  }

  const onAreaMouseup = () => {
    isMove.value = false
  }
  return {
    onMousemove,
    onMouseup,
    onAreaMousedown,
    onAreaMouseup,
    onMousedown
  }
}
