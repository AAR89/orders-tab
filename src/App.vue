<template>
  <div>
    <OrderTable />
  </div>
</template>

<script setup>
import OrderTable from './components/OrderTable.vue'
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
}

body {
  display: flex;
  place-items: flex-start;
  background-color: #f9f9f9;
  margin-bottom: 20px;
}
</style>
