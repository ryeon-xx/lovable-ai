<template>
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(15,23,42,.5)" @click.self="$emit('close')">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">
            <i :class="isEdit ? 'fas fa-edit text-primary' : 'fas fa-plus-circle text-success'" class="me-2"></i>
            {{ isEdit ? '거래 수정' : '거래 추가' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <form @submit.prevent="submit">
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label fw-semibold">유형</label>
                <select v-model="form.type" class="form-select" :class="{'is-invalid':errors.type}">
                  <option value="income">수입</option>
                  <option value="expense">지출</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">날짜</label>
                <input type="date" v-model="form.date" class="form-control" :class="{'is-invalid':errors.date}" />
                <div class="invalid-feedback">{{ errors.date }}</div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">카테고리</label>
                <input v-model="form.category" list="cats" class="form-control" :class="{'is-invalid':errors.category}" placeholder="예: 식비" />
                <datalist id="cats">
                  <option v-for="c in store.categories" :key="c.id" :value="c.name" />
                </datalist>
                <div class="invalid-feedback">{{ errors.category }}</div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">금액 (₩)</label>
                <input type="number" v-model.number="form.amount" min="1" max="100000000" class="form-control" :class="{'is-invalid':errors.amount}" />
                <div class="invalid-feedback">{{ errors.amount }}</div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">내용</label>
                <input v-model="form.description" maxlength="100" class="form-control" :class="{'is-invalid':errors.description}" />
                <div class="invalid-feedback">{{ errors.description }}</div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">결제수단</label>
                <select v-model="form.payment" class="form-select">
                  <option>현금</option><option>카드</option><option>계좌이체</option><option>간편결제</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" @click="$emit('close')">취소</button>
            <button type="submit" class="btn btn-gradient" :disabled="saving">
              <i class="fas fa-save me-1"></i>{{ saving ? '저장중...' : '저장' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useTransactionStore } from '../stores/transactionStore';

const props = defineProps({ transaction: { type: Object, default: null } });
const emit = defineEmits(['close', 'saved']);
const store = useTransactionStore();

const isEdit = computed(() => !!props.transaction);

// 수정 폼 프리필드 - 깊은 복사로 안전하게
const form = reactive({
  type: props.transaction?.type || 'expense',
  date: props.transaction?.date || new Date().toISOString().slice(0,10),
  category: props.transaction?.category || '',
  amount: props.transaction?.amount || 0,
  description: props.transaction?.description || '',
  payment: props.transaction?.payment || '카드'
});

const errors = reactive({});
const saving = ref(false);

const validate = () => {
  Object.keys(errors).forEach(k => delete errors[k]);
  if (!form.date) errors.date = '날짜를 선택하세요';
  if (!form.category || form.category.trim().length < 1) errors.category = '카테고리를 입력하세요';
  if (form.category && form.category.length > 30) errors.category = '카테고리는 30자 이내';
  if (!form.amount || form.amount <= 0) errors.amount = '금액은 0보다 커야 합니다';
  if (form.amount > 100000000) errors.amount = '금액이 너무 큽니다';
  if (!form.description || form.description.trim().length < 1) errors.description = '내용을 입력하세요';
  if (form.description && form.description.length > 100) errors.description = '100자 이내로 입력';
  if (!['income','expense'].includes(form.type)) errors.type = '유형 오류';
  return Object.keys(errors).length === 0;
};

const submit = async () => {
  if (!validate()) return;
  saving.value = true;
  try {
    const payload = {
      type: form.type, date: form.date,
      category: form.category.trim(),
      amount: Number(form.amount),
      description: form.description.trim(),
      payment: form.payment
    };
    if (isEdit.value) await store.updateTransaction(props.transaction.id, { ...props.transaction, ...payload });
    else await store.addTransaction(payload);
    emit('saved');
  } catch (e) {
    alert('저장 실패: ' + e.message);
  } finally {
    saving.value = false;
  }
};
</script>
