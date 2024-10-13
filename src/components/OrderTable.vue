<template>
  <div class="content">
    <h1>Список заказов</h1>
    <div class="main-block">
      <p class="orders-count" v-if="num_word(filteredOrders.length, words) !== words[0]">
        Найдено {{ filteredOrders.length }} {{ num_word(filteredOrders.length, words) }}
      </p>
      <p class="orders-count" v-else>
        Найден {{ filteredOrders.length }} {{ num_word(filteredOrders.length, words) }}
      </p>

      <div class="search-and-sort">
        <input
          class="search-order-number"
          v-model="searchOrderId"
          placeholder="Введите номер заказа"
        />
        <button @click="searchOrder">Искать</button>
        <input v-model="startDate" type="date" />
        <input v-model="endDate" type="date" />
        <select v-model="selectedStatuses">
          <option disabled value="">Выберите статус заказа</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
        <button @click="filterOrders">Искать</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Сумма заказа</th>
            <th>Номер заказа в учетной системе</th>
            <th>Способ и дата отгрузки заказа клиенту</th>
            <th>Количество товара в заказе</th>
            <th>Точка выдачи (магазин)</th>
            <th>Дата-время создания заказа</th>
            <th>ФИО клиента, телефон</th>
            <th>Способ оплаты</th>
            <th>Номер заказа</th>
            <th>Оператор</th>
            <th>Статус заказа</th>
          </tr>
        </thead>
        <td class="loading" colspan="11" v-if="isLoading">Загрузка...</td>
        <tbody v-else>
          <tr
            v-if="paginatedOrders.length > 0"
            v-for="order in paginatedOrders"
            :key="order.id"
            @click="openOrderDetail(order)"
          >
            <td>{{ order.amount }}</td>
            <td>{{ order.uid1c }}</td>
            <td>
              {{ order.shipment.method.title }}
              {{ order.shipment.date }}
            </td>
            <td>{{ order.quantity }}</td>
            <td>{{ order.shop.title }}</td>
            <td>{{ order.created }}</td>
            <td>
              {{ order.client.lastname }}
              {{ order.client.firstname }} <br />
              {{ order.client.phone }}
            </td>
            <td>{{ order.payment.method.title }}</td>
            <td>{{ order.id }}</td>
            <td>{{ order.operator }}</td>
            <td :style="{ color: getStatusColor(order.status.title) }">
              {{ order.status.title }}
            </td>
          </tr>
          <tr v-else>
            <td class="not-found" colspan="11">Заказы не найдены</td>
          </tr>
        </tbody>
      </table>
      <section class="table-footer" colspan="11">
        <div v-if="totalPages > 0" class="pagination-container">
          <div class="pagination">
            <img
              v-if="currentPage > 1"
              class="pagination-arrow"
              src="./icons/left-arrow.png"
              @click="prevPage"
              :disabled="currentPage === 1"
            />
            <p class="pagination-text">{{ currentPage }} из {{ totalPages }}</p>
            <img
              v-if="currentPage !== totalPages"
              src="./icons/right-arrow.png"
              class="pagination-arrow"
              @click="nextPage"
              :disabled="currentPage === totalPages"
            />
          </div>
        </div>
      </section>

      <Modal v-if="selectedOrder" @close="selectedOrder = null">
        <template #header>
          <h2 class="order-title">Детали заказа {{ selectedOrder.id }}</h2>
        </template>
        <template #body>
          <div>
            <h3 class="order-detail">Данные по заказу</h3>
            <p class="order-number">
              Номер заказа: <span> {{ selectedOrder.id }}</span>
            </p>
            <p class="order-date">
              Дата создания: <span>{{ selectedOrder.created }}</span>
            </p>
            <p class="order-status">
              Статус:
              <span :style="{ color: getStatusColor(selectedOrder.status.title) }">{{
                selectedOrder.status.title
              }}</span>
            </p>

            <h3 class="order-client">Данные по клиенту</h3>
            <p class="order-client-name">
              ФИО:
              <span>{{ selectedOrder.client.lastname }} {{ selectedOrder.client.firstname }}</span>
            </p>

            <p class="order-client-phone">
              Телефон: <span>{{ selectedOrder.client.phone }}</span>
            </p>

            <h3 class="order-address">Данные по магазину:</h3>
            <p class="order-address">
              Адрес: <span> {{ selectedOrder.shop.title }}</span>
            </p>

            <h3 class="order-payment">Данные по способу оплаты:</h3>
            <p>{{ selectedOrder.payment.method.title }}</p>
            <p class="order-payment-status" v-if="selectedOrder.payment.status">
              Статус оплаты: <span>{{ selectedOrder.payment.status.title }}</span>
            </p>
            <p class="order-payment-status" v-else>Статус оплаты: <span>Не оплачено</span></p>

            <h3 class="order-contents">Состав заказа:</h3>

            Товар - {{ selectedOrder.quantity }} шт. - {{ selectedOrder.amount }} ({{
              selectedOrder.status.title
            }})
          </div>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import axios from 'axios'
import Modal from './Modal.vue'

const orders = ref([])
const isLoading = ref(true)

const searchOrderId = ref('')
const startDate = ref('')
const endDate = ref('')
const selectedStatuses = ref([])
const selectedOrder = ref(null)

const statuses = ['Заказ выполнен', 'Заказ зарезервирован', 'Заказ отменен', 'Заказ в процессе']

const itemsPerPage = 10
const currentPage = ref(1)

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesId = String(order.id).includes(searchOrderId.value)

    const matchesDateRange =
      (!startDate.value || new Date(order.created) >= new Date(startDate.value)) &&
      (!endDate.value || new Date(order.created) <= new Date(endDate.value))
    const matchesStatus =
      selectedStatuses.value.length === 0 || selectedStatuses.value.includes(order.status.title)

    return matchesId && matchesDateRange && matchesStatus
  })
})

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredOrders.value.slice(start, start + itemsPerPage)
})

function getStatusColor(status) {
  switch (status) {
    case 'Заказ выполнен':
      return 'darkgreen'
    case 'Заказ зарезервирован':
      return 'green'
    case 'Заказ отменен':
      return 'red'
    default:
      return 'black'
  }
}

function searchOrder() {
  const order = orders.value.find((o) => o.orderNumber === searchOrderId.value)
  if (order) {
    selectedOrder.value = order
  }
}

function openOrderDetail(order) {
  selectedOrder.value = order
}

async function fetchOrders() {
  const token = '516daf6336c2d6d682fca954ad603ebc' // Токен
  const dateFrom = '2024-05-01'
  const dateTo = '2024-06-30'
  const orderStatus = '1,2,3,4,5,6'

  try {
    const response = await axios.get('https://msk.ivanor.ru/front/service/test-api/v1/orders', {
      headers: {
        Token: token
      },
      params: {
        dateFrom: dateFrom,
        dateTo: dateTo,
        orderStatus: orderStatus
      }
    })
    orders.value = response.data.orders

    console.log(orders.value)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}

const words = ['заказ', 'заказа', 'заказов']

function num_word(value, words) {
  value = Math.abs(value) % 100
  var num = value % 10
  if (value > 10 && value < 20) return words[2]
  if (num > 1 && num < 5) return words[1]
  if (num === 1) return words[0]
  return words[2]
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

onBeforeMount(fetchOrders)
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  color: #333;
  background-color: #f9f9f9 !important;
  padding: 10px;
}

.content {
  margin: 0 auto;
  max-width: 90%;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 20px;
}

.orders-count {
  color: #333;
  margin-bottom: 2px;
  font-weight: 500;
}

.search-and-sort {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  gap: 5px;
  align-items: center;
}

input[type='text'],
input[type='date'],
select,
.search-order-number,
button {
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  background-color: #fff;
  line-height: normal;
  box-sizing: border-box;
  flex: 1;
}

input[type='text']:focus,
input[type='date']:focus,
select:focus,
.search-order-number:focus {
  border-color: #3498db;
}

.search-order-number:focus {
  border: 1px solid #3498db;
}

button {
  padding: 0 16px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  background-color: #2980b9;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  table-layout: auto;
}

th,
td,
.loading {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  font-size: 14px;
  color: #555;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.loading {
  text-align: center;
}

th {
  background-color: #f0f4f7;
  color: #2c3e50;
}

td {
  background-color: #fcfcfc;
}

td:hover {
  background-color: #f2f9ff;
}

td[style] {
  font-weight: bold;
}

.modal-header {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
  font-size: 16px;
  color: #333;
}

.modal-body h3 {
  margin-top: 20px;
  font-size: 18px;
  color: #3498db;
}

.order-title,
.order-detail,
.order-number,
.order-date,
.order-status,
.order-client,
.order-client-name,
.order-client-phone,
.order-address,
.order-payment,
.order-payment-status,
.order-contents {
  font-weight: bold;
}

.not-found {
  text-align: center;
  font-weight: bold;
  color: #e74c3c;
}

.main-block {
  width: 100%;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.pagination-text {
  display: flex;
  justify-content: center;
  font-size: 15px;
  color: #555;
  width: 70px;
}

.pagination-arrow {
  width: 20px;
}

button {
  margin: 0 10px;
  padding: 5px 10px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .content {
    width: 90%;
  }

  table {
    display: block;
    overflow-x: auto;
  }

  th,
  td {
    white-space: nowrap;
  }
}
@media (max-width: 768px) {
  .search-and-sort {
    flex-direction: column;
    gap: 10px;
  }

  input[type='text'],
  input[type='date'],
  select {
    width: 100%;
  }

  button {
    width: 100%;
    margin-top: 10px;
  }

  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  th,
  td {
    white-space: nowrap;
    font-size: 12px;
    padding: 8px;
  }

  .table-footer {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .search-and-sort {
    gap: 8px;
  }

  th,
  td {
    font-size: 10px;
    padding: 6px;
  }

  h1 {
    font-size: 18px;
  }

  .orders-count {
    font-size: 14px;
  }

  .pagination-text {
    font-size: 12px;
  }
}
</style>
