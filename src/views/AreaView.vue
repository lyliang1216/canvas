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
const areaStyles = reactive({
  width: '300px',
  height: '300px',
  left: '50px',
  top: '50px'
})
const confirmBoxStyles = reactive({
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
const maxSize = reactive({
  width: 0,
  height: 0
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
const onMousemove = (event: any) => {
  const rect = areaRef.value.getBoundingClientRect()
  const boxRect = boxRef.value.getBoundingClientRect()
  const mouseX = event.clientX
  const mouseY = event.clientY
  if (positionType.value) {
    switch (positionType.value) {
      case 'left': {
        const width = Math.trunc(rect.right - mouseX)
        if (width <= maxSize.width) {
          areaStyles.width = width + 'px'
          width > 0 && (areaStyles.left = mouseX - boxRect.left + 'px')
        }
        if (width < 0) {
          positionType.value = 'right'
        }
        break
      }
      case 'right': {
        const width = Math.trunc(mouseX - rect.left)
        if (width <= maxSize.width) {
          areaStyles.width = width + 'px'
        }
        if (width < 0) {
          positionType.value = 'left'
        }
        break
      }
      case 'top': {
        const height = Math.trunc(rect.bottom - mouseY)
        if (height <= maxSize.height) {
          areaStyles.height = height + 'px'
          height > 0 && (areaStyles.top = mouseY - boxRect.top + 'px')
        }
        if (height < 0) {
          positionType.value = 'bottom'
        }
        break
      }
      case 'bottom': {
        const height = Math.trunc(mouseY - rect.top)
        if (height <= maxSize.height) {
          areaStyles.height = height + 'px'
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
          areaStyles.width = width + 'px'
          width > 0 && (areaStyles.left = mouseX - boxRect.left + 'px')
        }
        if (height <= maxSize.height) {
          areaStyles.height = height + 'px'
          height > 0 && (areaStyles.top = mouseY - boxRect.top + 'px')
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
          areaStyles.width = width + 'px'
          width > 0 && (areaStyles.left = mouseX - boxRect.left + 'px')
        }
        if (height <= maxSize.height) {
          areaStyles.height = height + 'px'
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
          areaStyles.width = width + 'px'
        }
        if (height <= maxSize.height) {
          areaStyles.height = height + 'px'
          height > 0 && (areaStyles.top = mouseY - boxRect.top + 'px')
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
          areaStyles.width = width + 'px'
        }
        if (height <= maxSize.height) {
          areaStyles.height = height + 'px'
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
    areaStyles.left = originPosition.x + distanceX + 'px'
    areaStyles.top = originPosition.y + distanceY + 'px'
    onResize()
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

const rectSizePosition = reactive({
  x: 50,
  y: 50,
  width: 300,
  height: 300
})

const onResize = () => {
  const rect = areaRef.value.getBoundingClientRect()
  const boxRect = boxRef.value.getBoundingClientRect()
  rectSizePosition.width = rect.width
  rectSizePosition.height = rect.height
  rectSizePosition.x = rect.left - boxRect.left
  rectSizePosition.y = rect.top - boxRect.top
  confirmBoxStyles.top = parseInt(areaStyles.top) + parseInt(areaStyles.height) + 2 + 'px'
  confirmBoxStyles.left = parseInt(areaStyles.left) + parseInt(areaStyles.width) - 80 + 'px'
}

const onAreaMouseup = () => {
  isMove.value = false
}

onMounted(() => {})
</script>

<template>
  <span>-----裁剪工具</span>
  <div class="wrapper">
    <img
      class="img"
      src="https://file.ccmapp.cn/group1/M00/16/64/rApntl7CSdeAbpYqABArOjGaasg001.jpg"
      alt=""
    />
    <svg xmlns="http://www.w3.org/2000/svg" class="mask-svg" ref="svgRef" viewBox="0 0 800 600">
      <!-- 定义一个mask -->
      <defs>
        <mask id="cutoutMask">
          <rect x="0" y="0" width="800" height="600" fill="#fff" />
          <rect
            :x="rectSizePosition.x"
            :y="rectSizePosition.y"
            :width="rectSizePosition.width"
            :height="rectSizePosition.height"
            fill="#000"
          />
        </mask>
      </defs>

      <!-- 半透明背景 -->
      <rect
        x="0"
        y="0"
        width="800"
        height="600"
        fill="#000000"
        opacity="0.38"
        mask="url(#cutoutMask)"
      />
    </svg>
    <div ref="boxRef" class="box" @mousemove="onMousemove" @mouseup="onMouseup">
      <div
        class="area"
        :style="{ cursor: isMove ? 'move' : 'auto', ...areaStyles }"
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
      <div class="confirm-box" :style="confirmBoxStyles">
        <img src="@/assets/cancel.png" />
        <img src="@/assets/confirm.png" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  width: 800px;
  height: 600px;
  position: fixed;
  top: 100px;
  left: 100px;
  user-select: none;
  .img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
.mask-svg {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  width: 800px;
  height: 600px;
}
.box {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
  .confirm-box {
    position: absolute;
    width: 80px;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 1px;
    img {
      width: 40px;
      height: 30px;
    }
  }
}
.area {
  border: 1px dashed rgba(79, 175, 252, 1);
  box-sizing: border-box;
  position: absolute;
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
</style>
