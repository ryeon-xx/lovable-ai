<template>
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(15,23,42,.5)" @click.self="$emit('cancel')">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>{{ title }}
          </h5>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" @click="$emit('cancel')">취소</button>
          <button class="btn btn-danger" @click="$emit('confirm')">
            <i class="fas fa-trash me-1"></i>삭제
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '삭제 확인' },
  message: { type: String, default: '정말 삭제하시겠습니까?' }
});
defineEmits(['confirm', 'cancel']);
</script>
