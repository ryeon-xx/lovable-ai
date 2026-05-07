<template>
  <div ref="chartEl" :style="{ width: '100%', height: height + 'px' }"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps({
  type: { type: String, required: true },
  data: { type: Array, required: true },
  options: { type: Object, default: () => ({}) },
  height: { type: Number, default: 320 }
});

const chartEl = ref(null);
let chartInstance = null;
let loaded = false;
let resizeObserver = null;

const draw = () => {
  if (!window.google || !window.google.visualization || !chartEl.value) return;
  if (!props.data || props.data.length < 2) return;
  const dt = window.google.visualization.arrayToDataTable(props.data);
  if (!chartInstance) {
    chartInstance = new window.google.visualization[props.type](chartEl.value);
  }
  chartInstance.draw(dt, { ...props.options, animation: { duration: 600, easing: 'out', startup: true } });
};

const ensureLoaded = () => {
  if (loaded) { draw(); return; }
  window.google.charts.load('current', { packages: ['corechart'] });
  window.google.charts.setOnLoadCallback(() => { loaded = true; draw(); });
};

onMounted(() => {
  nextTick(ensureLoaded);
  resizeObserver = new ResizeObserver(() => draw());
  if (chartEl.value) resizeObserver.observe(chartEl.value);
  window.addEventListener('resize', draw);
});

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect();
  window.removeEventListener('resize', draw);
  if (chartInstance) chartInstance.clearChart();
});

watch(() => [props.data, props.options, props.type], () => draw(), { deep: true });
</script>
