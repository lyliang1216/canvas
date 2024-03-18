<script setup lang="ts">
import {
  useCanvasRefs,
  useCommonState,
  useCommonTool,
  useBrushTool,
  useSelectionTool,
  useStepsTool,
  usehook1,
  usehook2
} from '@/hooks/useDrawBoardHook'
import { onMounted, onUnmounted } from 'vue'

const { clickCanvasRef, previewCanvasRef, imgCanvasRef, clickCtx, previewCtx, imgCtx } =
  useCanvasRefs()
const { a } = usehook1()
const { showA } = usehook2()
const { nowSelect, isArea } = useCommonState()
const { setImg, saveCurrent, getMaskAndOriginImg } = useCommonTool()
const { handleKeyDown, handleKeyUp, onPreviewMousedown, onPreviewMousemove, onPreviewMouseup } =
  useBrushTool()
const { onClick, onDblclick, drawLine } = useSelectionTool()
const { redo, undo } = useStepsTool()

onMounted(() => {
  a.value = 99
  showA()
  // 初始化时获取绘图上下文
  if (clickCanvasRef.value) {
    clickCtx.value = clickCanvasRef.value.getContext('2d')
  }
  if (previewCanvasRef.value) {
    previewCtx.value = previewCanvasRef.value.getContext('2d')
    saveCurrent()
  }
  if (imgCanvasRef.value) {
    imgCtx.value = imgCanvasRef.value.getContext('2d')
    setImg()
  }
  window.addEventListener('keydown', (e) => !isArea && handleKeyDown(e))
  window.addEventListener('keyup', (e) => !isArea && handleKeyUp(e))
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<template>
  <button :class="{ active: !isArea }" @click="nowSelect = 'brush'">画笔</button>
  <button :class="{ active: isArea }" @click="nowSelect = 'area'">选区</button>
  <canvas
    id="clickCanvasRef"
    ref="clickCanvasRef"
    width="800"
    height="600"
    @click="(e) => isArea && onClick(e)"
    @dblclick="(e) => isArea && onDblclick(e)"
    @mousemove="(e) => isArea && drawLine(e)"
    :style="{ zIndex: isArea ? 3 : 2 }"
  ></canvas>
  <canvas
    id="previewCanvasRef"
    ref="previewCanvasRef"
    width="800"
    height="600"
    @mousedown="(e) => !isArea && onPreviewMousedown(e)"
    @mousemove="(e) => !isArea && onPreviewMousemove(e)"
    @mouseup="() => !isArea && onPreviewMouseup()"
    :style="{ zIndex: isArea ? 2 : 3 }"
  ></canvas>
  <canvas id="imgCanvasRef" ref="imgCanvasRef" width="800" height="600"></canvas>
  <button @click="undo">撤销</button>
  <button @click="redo">重做</button>
  <button @click="getMaskAndOriginImg">保存</button>
</template>

<style scoped lang="scss">
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
#clickCanvasRef {
  z-index: 3;
}
#previewCanvasRef {
  z-index: 2;
}
#imgCanvasRef {
  z-index: 1;
}
</style>
