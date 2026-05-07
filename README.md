# 가계부 대시보드 (Vue3 + json-server)

## 실행 방법

```bash
cd vue-app
npm install
npm start          # json-server(3001) + vite(5173) 동시 실행
```

또는 따로:
```bash
npm run server     # json-server :3001
npm run dev        # vite :5173
```

## 스택
- Vue 3 (Composition API, `<script setup>`)
- Pinia (`src/stores/transactionStore.js` — axios로 json-server 연결)
- Vue Router 4
- Bootstrap 5, Font Awesome 6, Google Charts
- json-server (`db.json` — 거래 100건 + 카테고리)

## 구조
- `src/services/api.js` — axios 인스턴스 (baseURL: http://localhost:3001)
- `src/stores/transactionStore.js` — Pinia 스토어, CRUD + 통계 computed
- `src/views/Dashboard.vue` — 대시보드 (요약 카드 + 3종 차트 + 최근 거래)
- `src/views/Transactions.vue` — 전체 거래 테이블
