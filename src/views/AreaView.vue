<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

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

const areaRef = ref()
const boxRef = ref()
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
const maxMinSize = reactive({
  maxWidth: 0,
  maxHeight: 0,
  minWidth: 10,
  minHeigt: 10
})

const isMove = ref<boolean>(false)
const originPosition = reactive({
  x: 0,
  y: 0
})
const moveStartPosition = reactive({
  x: 0,
  y: 0
})

const onMousedown = (event: any, position: ResizePosition) => {
  event.stopPropagation()
  const rect = areaRef.value.getBoundingClientRect()
  const boxRect = boxRef.value.getBoundingClientRect()
  positionType.value = position
  switch (position) {
    case 'left': {
      maxMinSize.maxWidth = Math.trunc(rect.right - boxRect.left)
      maxMinSize.maxHeight = rect.height
      break
    }
    case 'right': {
      maxMinSize.maxWidth = Math.trunc(boxRect.right - rect.left)
      maxMinSize.maxHeight = rect.height
      break
    }
    case 'top': {
      maxMinSize.maxWidth = rect.width
      maxMinSize.maxHeight = Math.trunc(rect.bottom - boxRect.top)
      break
    }
    case 'bottom': {
      maxMinSize.maxWidth = rect.width
      maxMinSize.maxHeight = Math.trunc(boxRect.bottom - rect.top)
      break
    }
    case 'left-top': {
      maxMinSize.maxWidth = Math.trunc(rect.right - boxRect.left)
      maxMinSize.maxHeight = Math.trunc(rect.bottom - boxRect.top)
      break
    }
    case 'left-bottom': {
      maxMinSize.maxWidth = Math.trunc(rect.right - boxRect.left)
      maxMinSize.maxHeight = Math.trunc(boxRect.bottom - rect.top)
      break
    }
    case 'right-top': {
      maxMinSize.maxWidth = Math.trunc(boxRect.right - rect.left)
      maxMinSize.maxHeight = Math.trunc(rect.bottom - boxRect.top)
      break
    }
    case 'right-bottom': {
      maxMinSize.maxWidth = Math.trunc(boxRect.right - rect.left)
      maxMinSize.maxHeight = Math.trunc(boxRect.bottom - rect.top)
      break
    }
  }
}
const onMousemove = (event: any) => {
  const rect = areaRef.value.getBoundingClientRect()
  const boxRect = boxRef.value.getBoundingClientRect()
  const mouseX = event.clientX
  const mouseY = event.clientY
  if (positionType.value) {
    switch (positionType.value) {
      case 'left': {
        const width = Math.trunc(rect.right - mouseX)
        if (width <= maxMinSize.maxWidth && width >= maxMinSize.minWidth) {
          areaRef.value.style.width = width + 'px'
          areaRef.value.style.left = mouseX - boxRect.left + 'px'
        }
        break
      }
      case 'right': {
        const width = Math.trunc(mouseX - rect.left)
        if (width <= maxMinSize.maxWidth && width >= maxMinSize.minWidth) {
          areaRef.value.style.width = width + 'px'
        }
        break
      }
      case 'top': {
        const height = Math.trunc(rect.bottom - mouseY)
        if (height <= maxMinSize.maxHeight && height >= maxMinSize.minHeigt) {
          areaRef.value.style.height = height + 'px'
          areaRef.value.style.top = mouseY - boxRect.top + 'px'
        }
        break
      }
      case 'bottom': {
        const height = Math.trunc(mouseY - rect.top)
        if (height <= maxMinSize.maxHeight && height >= maxMinSize.minHeigt) {
          areaRef.value.style.height = height + 'px'
        }
        break
      }
      case 'left-top': {
        const width = Math.trunc(rect.right - mouseX)
        const height = Math.trunc(rect.bottom - mouseY)
        if (width <= maxMinSize.maxWidth && width >= maxMinSize.minWidth) {
          areaRef.value.style.width = width + 'px'
          areaRef.value.style.left = mouseX - boxRect.left + 'px'
        }
        if (height <= maxMinSize.maxHeight && height >= maxMinSize.minHeigt) {
          areaRef.value.style.height = height + 'px'
          areaRef.value.style.top = mouseY - boxRect.top + 'px'
        }
        break
      }
      case 'left-bottom': {
        const width = Math.trunc(rect.right - mouseX)
        const height = Math.trunc(mouseY - rect.top)
        if (width <= maxMinSize.maxWidth && width >= maxMinSize.minWidth) {
          areaRef.value.style.width = width + 'px'
          areaRef.value.style.left = mouseX - boxRect.left + 'px'
        }
        if (height <= maxMinSize.maxHeight && height >= maxMinSize.minHeigt) {
          areaRef.value.style.height = height + 'px'
        }
        break
      }
      case 'right-top': {
        const width = Math.trunc(mouseX - rect.left)
        const height = Math.trunc(rect.bottom - mouseY)
        if (width <= maxMinSize.maxWidth && width >= maxMinSize.minWidth) {
          areaRef.value.style.width = width + 'px'
        }
        if (height <= maxMinSize.maxHeight && height >= maxMinSize.minHeigt) {
          areaRef.value.style.height = height + 'px'
          areaRef.value.style.top = mouseY - boxRect.top + 'px'
        }
        break
      }
      case 'right-bottom': {
        const width = Math.trunc(mouseX - rect.left)
        const height = Math.trunc(mouseY - rect.top)
        if (width <= maxMinSize.maxWidth && width >= maxMinSize.minWidth) {
          areaRef.value.style.width = width + 'px'
        }
        if (height <= maxMinSize.maxHeight && height >= maxMinSize.minHeigt) {
          areaRef.value.style.height = height + 'px'
        }
        break
      }
    }
  }
  if (isMove.value) {
    const distanceX = mouseX - moveStartPosition.x
    const distanceY = mouseY - moveStartPosition.y
    areaRef.value.style.left = originPosition.x + distanceX + 'px'
    areaRef.value.style.top = originPosition.y + distanceY + 'px'
  }
}
const onMouseup = () => {
  positionType.value = ''
}

const onAreaMousedown = (event: any) => {
  const rect = areaRef.value.getBoundingClientRect()
  const boxRect = boxRef.value.getBoundingClientRect()
  moveStartPosition.x = event.clientX
  moveStartPosition.y = event.clientY
  originPosition.x = rect.left - boxRect.left
  originPosition.y = rect.top - boxRect.top
  isMove.value = true
}

const onAreaMouseup = () => {
  isMove.value = false
}

onMounted(() => {})
</script>

<template>
  <span>-----裁剪工具</span>
  <div ref="boxRef" class="box" @mousemove="onMousemove" @mouseup="onMouseup">
    <img
      class="img"
      src="https://file.ccmapp.cn/group1/M00/16/64/rApntl7CSdeAbpYqABArOjGaasg001.jpg"
      alt=""
    />
    <div
      class="area"
      :style="{ cursor: isMove ? 'move' : 'auto' }"
      ref="areaRef"
      @mousedown="onAreaMousedown"
      @mouseup="onAreaMouseup"
    >
      <div
        class="resize"
        @mousedown="(e) => onMousedown(e, item)"
        :class="item"
        v-for="item in resizePosition"
        :key="item"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.box {
  width: 800px;
  height: 600px;
  position: fixed;
  top: 100px;
  left: 100px;
  user-select: none;
  .img {
    width: 100%;
    height: 100%;
  }
  .area {
    width: 300px;
    height: 300px;
    border: 1px dashed rgba(79, 175, 252, 1);
    box-sizing: border-box;
    position: absolute;
    left: 50px;
    top: 50px;
    .resize {
      width: 6px;
      height: 6px;
      background: #f6f6f6;
      border-radius: 50%;
      position: absolute;
      &.top {
        left: 50%;
        top: -3px;
        transform: translateX(-50%);
        cursor: n-resize;
      }
      &.bottom {
        left: 50%;
        bottom: -3px;
        transform: translateX(-50%);
        cursor: n-resize;
      }
      &.left {
        left: -3px;
        top: 50%;
        transform: translateY(-50%);
        cursor: e-resize;
      }
      &.right {
        right: -3px;
        top: 50%;
        transform: translateY(-50%);
        cursor: e-resize;
      }
      &.left-top {
        left: -3px;
        top: -3px;
        cursor: se-resize;
      }
      &.left-bottom {
        left: -3px;
        bottom: -3px;
        cursor: sw-resize;
      }
      &.right-top {
        right: -3px;
        top: -3px;
        cursor: sw-resize;
      }
      &.right-bottom {
        right: -3px;
        bottom: -3px;
        cursor: se-resize;
      }
    }
  }
}
</style>
