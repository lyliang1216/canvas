<script setup lang="ts"></script>

<template>
  <span>-----裁剪工具</span>
  <div class="box">
    <img
      class="img"
      src="https://file.ccmapp.cn/group1/M00/16/64/rApntl7CSdeAbpYqABArOjGaasg001.jpg"
      alt=""
    />
    <div class="area"></div>
  </div>
</template>

<style scoped>
.box {
  width: 800px;
  height: 600px;
  position: fixed;
  top: 100px;
  left: 100px;
}
.img {
  width: 100%;
  height: 100%;
}
.area {
  width: 300px;
  height: 300px;
  border: 1px solid #000;
}
</style>
