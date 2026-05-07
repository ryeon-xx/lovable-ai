<template>
  <div class="container-fluid">
    <div class="row">
      <aside class="col-md-2 sidebar p-3">
        <h4 class="text-white mb-4"><i class="fas fa-wallet me-2"></i>가계부</h4>
        <router-link to="/"><i class="fas fa-chart-line me-2"></i>대시보드</router-link>
        <router-link to="/transactions"><i class="fas fa-list me-2"></i>거래 내역</router-link>
      </aside>
      <main class="col-md-10 p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTransactionStore } from './stores/transactionStore';

const store = useTransactionStore();
onMounted(() => {
  store.fetchTransactions();
  store.fetchCategories();
});
</script>
