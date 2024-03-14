<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterLink to="/">画笔工具</RouterLink>
  <span>----</span>
  <RouterLink to="/about">选区工具</RouterLink>
  <span>----</span>
  <RouterLink to="/area">裁剪工具</RouterLink>
  <RouterView />
</template>

<style scoped></style>
