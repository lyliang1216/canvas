<script setup lang="ts">
import { useCropState, useCropMethod } from '@/hooks/useCropToolHook'

const {
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
} = useCropState()
const { onMousemove, onMouseup, onAreaMousedown, onAreaMouseup, onMousedown } = useCropMethod({
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
})
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
    <div ref="cropWrapperRef" class="crop-wrapper" @mousemove="onMousemove" @mouseup="onMouseup">
      <div
        class="crop-area"
        :style="{ cursor: isMove ? 'move' : 'auto', ...cropAreaStyles }"
        ref="cropAreaRef"
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
.crop-wrapper {
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
.crop-area {
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
