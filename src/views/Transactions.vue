<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h2 class="page-title mb-0"><i class="fas fa-list me-2"></i>거래 내역</h2>
      <button class="btn btn-gradient" @click="openAdd"><i class="fas fa-plus me-1"></i>거래 추가</button>
    </div>

    <!-- 필터 바 -->
    <div class="filter-bar">
      <div class="row g-2 align-items-end">
        <div class="col-md-2">
          <label class="form-label small fw-semibold mb-1">유형</label>
          <select v-model="filters.type" class="form-select form-select-sm">
            <option value="">전체</option>
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-semibold mb-1">카테고리</label>
          <select v-model="filters.category" class="form-select form-select-sm">
            <option value="">전체</option>
            <option v-for="c in uniqueCategories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-semibold mb-1">시작일</label>
          <input type="date" v-model="filters.from" class="form-control form-control-sm" />
        </div>
        <div class="col-md-2">
          <label class="form-label small fw-semibold mb-1">종료일</label>
          <input type="date" v-model="filters.to" class="form-control form-control-sm" />
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-semibold mb-1">검색</label>
          <input v-model="filters.search" placeholder="내용/카테고리..." class="form-control form-control-sm" />
        </div>
        <div class="col-md-1">
          <button class="btn btn-sm btn-light w-100" @click="resetFilters" title="초기화">
            <i class="fas fa-rotate"></i>
          </button>
        </div>
      </div>
      <div class="mt-2 small text-muted">
        <i class="fas fa-filter me-1"></i>{{ filtered.length }}건 / 전체 {{ store.transactions.length }}건
        · 수입 <span class="txn-income">₩{{ filteredIncome.toLocaleString() }}</span>
        · 지출 <span class="txn-expense">₩{{ filteredExpense.toLocaleString() }}</span>
      </div>
    </div>

    <div class="card stat-card p-3">
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>날짜</th><th>유형</th><th>카테고리</th><th>내용</th><th>결제수단</th>
              <th class="text-end">금액</th><th class="text-end">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filtered" :key="t.id">
              <td>{{ t.date }}</td>
              <td>
                <span :class="t.type==='income'?'badge bg-success':'badge bg-danger'">
                  {{ t.type==='income'?'수입':'지출' }}
                </span>
              </td>
              <td>{{ t.category }}</td>
              <td>{{ t.description }}</td>
              <td><i class="fas fa-credit-card me-1 text-muted"></i>{{ t.payment }}</td>
              <td class="text-end" :class="t.type==='income'?'txn-income':'txn-expense'">
                {{ t.type==='income'?'+':'-' }}₩{{ Number(t.amount).toLocaleString() }}
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(t)"><i class="fas fa-pen"></i></button>
                <button class="btn btn-sm btn-outline-danger" @click="askDelete(t)"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="text-center text-muted py-4">조건에 맞는 거래가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <TransactionFormModal
      v-if="showForm"
      :transaction="editing"
      @close="closeForm"
      @saved="onSaved"
    />
    <ConfirmModal
      v-if="deleting"
      title="거래 삭제"
      :message="`'${deleting.description}' (₩${Number(deleting.amount).toLocaleString()}) 거래를 삭제할까요?`"
      @confirm="confirmDelete"
      @cancel="deleting = null"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useTransactionStore } from '../stores/transactionStore';
import TransactionFormModal from '../components/TransactionFormModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const store = useTransactionStore();

const filters = reactive({ type: '', category: '', from: '', to: '', search: '' });
const resetFilters = () => { filters.type=''; filters.category=''; filters.from=''; filters.to=''; filters.search=''; };

const uniqueCategories = computed(() => [...new Set(store.transactions.map(t => t.category))].sort());

const filtered = computed(() => {
  const s = filters.search.trim().toLowerCase();
  return store.transactions
    .filter(t => !filters.type || t.type === filters.type)
    .filter(t => !filters.category || t.category === filters.category)
    .filter(t => !filters.from || t.date >= filters.from)
    .filter(t => !filters.to || t.date <= filters.to)
    .filter(t => !s || t.description.toLowerCase().includes(s) || t.category.toLowerCase().includes(s))
    .sort((a,b) => b.date.localeCompare(a.date));
});

const filteredIncome = computed(() => filtered.value.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0));
const filteredExpense = computed(() => filtered.value.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0));

const showForm = ref(false);
const editing = ref(null);
const openAdd = () => { editing.value = null; showForm.value = true; };
const openEdit = (t) => { editing.value = { ...t }; showForm.value = true; };
const closeForm = () => { showForm.value = false; editing.value = null; };
const onSaved = () => closeForm();

const deleting = ref(null);
const askDelete = (t) => { deleting.value = t; };
const confirmDelete = async () => {
  const t = deleting.value;
  deleting.value = null;
  try { await store.deleteTransaction(t.id); }
  catch (e) { alert('삭제 실패: ' + e.message); }
};
</script>
