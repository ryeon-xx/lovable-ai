import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref([]);
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchTransactions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get('/transactions');
      transactions.value = res.data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      categories.value = res.data;
    } catch (e) { /* ignore */ }
  };

  // CRUD - 모든 작업 후 transactions 배열을 갱신하므로 computed가 자동 재계산됨
  const addTransaction = async (txn) => {
    const res = await api.post('/transactions', txn);
    transactions.value = [...transactions.value, res.data];
    return res.data;
  };

  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`);
    transactions.value = transactions.value.filter(t => t.id !== id);
  };

  const updateTransaction = async (id, txn) => {
    const res = await api.put(`/transactions/${id}`, txn);
    transactions.value = transactions.value.map(t => t.id === id ? res.data : t);
    return res.data;
  };

  const totalIncome = computed(() =>
    transactions.value.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  );
  const totalExpense = computed(() =>
    transactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  );
  const balance = computed(() => totalIncome.value - totalExpense.value);

  const expenseByCategory = computed(() => {
    const map = {};
    transactions.value.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return map;
  });

  const monthlyStats = computed(() => {
    const map = {};
    transactions.value.forEach(t => {
      const m = (t.date || '').substring(0, 7);
      if (!m) return;
      if (!map[m]) map[m] = { income: 0, expense: 0 };
      map[m][t.type] += Number(t.amount);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  });

  return {
    transactions, categories, loading, error,
    fetchTransactions, fetchCategories,
    addTransaction, deleteTransaction, updateTransaction,
    totalIncome, totalExpense, balance,
    expenseByCategory, monthlyStats
  };
});
