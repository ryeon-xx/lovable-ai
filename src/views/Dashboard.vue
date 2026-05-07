<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h2 class="page-title mb-0"><i class="fas fa-chart-pie me-2"></i>대시보드</h2>
      <div class="d-flex align-items-center gap-3">
        <span class="text-muted"><i class="far fa-calendar me-1"></i>{{ today }}</span>
        <router-link to="/transactions" class="btn btn-gradient btn-sm"><i class="fas fa-plus me-1"></i>거래 관리</router-link>
      </div>
    </div>

    <div v-if="store.loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>
    <div v-else-if="store.error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ store.error }} (json-server 실행 확인: npm run server)
    </div>
    <template v-else>
      <div class="row g-3 mb-4">
        <div class="col-md-3"><StatCard label="총 수입" :value="fmt(store.totalIncome)" icon="fas fa-arrow-up" bg="bg-income" /></div>
        <div class="col-md-3"><StatCard label="총 지출" :value="fmt(store.totalExpense)" icon="fas fa-arrow-down" bg="bg-expense" /></div>
        <div class="col-md-3"><StatCard label="잔액" :value="fmt(store.balance)" icon="fas fa-wallet" bg="bg-balance" /></div>
        <div class="col-md-3"><StatCard label="거래 건수" :value="store.transactions.length + '건'" icon="fas fa-receipt" bg="bg-count" /></div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-7">
          <div class="card p-3 stat-card">
            <h5 class="fw-bold"><i class="fas fa-chart-bar me-2 text-primary"></i>월별 수입/지출</h5>
            <GoogleChart type="ColumnChart" :data="monthlyData" :options="monthlyOpts" :height="320" />
          </div>
        </div>
        <div class="col-md-5">
          <div class="card p-3 stat-card">
            <h5 class="fw-bold"><i class="fas fa-chart-pie me-2 text-danger"></i>카테고리별 지출</h5>
            <GoogleChart type="PieChart" :data="pieData" :options="pieOpts" :height="320" />
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-7">
          <div class="card p-3 stat-card">
            <h5 class="fw-bold"><i class="fas fa-chart-line me-2 text-success"></i>월별 잔액 추이</h5>
            <GoogleChart type="LineChart" :data="lineData" :options="lineOpts" :height="280" />
          </div>
        </div>
        <div class="col-md-5">
          <div class="card p-3 stat-card">
            <h5 class="fw-bold"><i class="fas fa-clock me-2 text-warning"></i>최근 거래</h5>
            <ul class="list-group list-group-flush">
              <li v-for="t in recent" :key="t.id" class="list-group-item d-flex justify-content-between px-0">
                <div>
                  <i :class="t.type==='income'?'fas fa-plus-circle text-success':'fas fa-minus-circle text-danger'" class="me-2"></i>
                  <span class="fw-semibold">{{ t.description }}</span>
                  <small class="text-muted ms-2">{{ t.date }}</small>
                </div>
                <span :class="t.type==='income'?'txn-income':'txn-expense'">
                  {{ t.type==='income'?'+':'-' }}{{ fmt(t.amount) }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTransactionStore } from '../stores/transactionStore';
import StatCard from '../components/StatCard.vue';
import GoogleChart from '../components/GoogleChart.vue';

const store = useTransactionStore();
const today = new Date().toLocaleDateString('ko-KR');
const fmt = (n) => '₩' + Number(n).toLocaleString();

const monthlyData = computed(() => {
  const rows = [['월', '수입', '지출']];
  store.monthlyStats.forEach(([m, v]) => rows.push([m, v.income, v.expense]));
  return rows;
});
const monthlyOpts = { legend: { position: 'top' }, colors: ['#22c55e', '#ef4444'], chartArea: { width: '85%', height: '70%' } };

const pieData = computed(() => {
  const rows = [['카테고리', '금액']];
  Object.entries(store.expenseByCategory).forEach(([k, v]) => rows.push([k, v]));
  return rows;
});
const pieOpts = { pieHole: 0.4, chartArea: { width: '90%', height: '85%' } };

const lineData = computed(() => {
  const rows = [['월', '잔액']];
  let bal = 0;
  store.monthlyStats.forEach(([m, v]) => { bal += v.income - v.expense; rows.push([m, bal]); });
  return rows;
});
const lineOpts = { legend: { position: 'none' }, colors: ['#3b82f6'], chartArea: { width: '85%', height: '70%' } };

const recent = computed(() => [...store.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6));
</script>
