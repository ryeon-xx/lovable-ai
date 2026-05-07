<template>
  <div class="card stat-card p-3">
    <div class="d-flex align-items-center">
      <div :class="['stat-icon', bg]">
        <i :class="icon"></i>
      </div>
      <div class="ms-3">
        <div class="text-muted small">{{ label }}</div>
        <div class="h4 mb-0 fw-bold">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ label: String, value: String, icon: String, bg: String });
</script>
