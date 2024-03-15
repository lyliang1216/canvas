<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <!-- 定义一个mask -->
    <defs>
      <mask id="cutoutMask">
        <rect x="0" y="0" width="800" height="600" fill="#fff" />
        <rect x="300" y="200" width="200" height="200" fill="#000" />
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
</template>

<script setup></script>

<style scoped>
svg {
  width: 800px;
  height: 600px;
}
</style>
