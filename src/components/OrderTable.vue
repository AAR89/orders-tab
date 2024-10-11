<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
  <div>
    <h1>Список заказов</h1>
    <div>
      <p>Найдено {{ orders.length }} заказов</p>
      <div>
        <input v-model="searchOrderId" placeholder="Введите номер заказа" />
        <button @click="searchOrder">Искать</button>
      </div>
      <div>
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
      <tr v-if="isLoading">
        Загрузка...
      </tr>
      <tbody v-else>
        <tr
          v-if="orders.length > 0"
          v-for="order in orders"
          :key="order.id"
          @click="openOrderDetail(order)"
        >
          <td>{{ order.amount }}</td>
          <td>{{ order.uid1c }}</td>
          <td>
            {{ order.shipment.method.id }} {{ order.shipment.method.title }}
            {{ order.shipment.date }}
          </td>
          <td>{{ order.quantity }}</td>
          <td>{{ order.shop.title }}</td>
          <td>{{ order.created }}</td>
          <td>{{ order.client.firstname }} {{ order.client.lastname }} {{ order.client.phone }}</td>
          <td>{{ order.payment.method.id }} {{ order.payment.method.title }}</td>
          <td>{{ order.id }}</td>
          <td>{{ order.operator }}</td>
          <td :style="{ color: getStatusColor(order.status.title) }">
            {{ order.status.id }} {{ order.status.title }}
          </td>
        </tr>
        <tr v-else>
          <td colspan="10">Заказы не найдены</td>
        </tr>
      </tbody>
    </table>

    <!-- Модальное окно с деталями заказа -->
    <Modal v-if="selectedOrder" @close="selectedOrder = null">
      <template #header>
        <h2>Детали заказа {{ selectedOrder.orderNumber }}</h2>
      </template>
      <template #body>
        <div>
          <h3>Данные по заказу</h3>
          <p>ID: {{ selectedOrder.id }}</p>
          <p>Дата создания: {{ selectedOrder.creationDate }}</p>
          <p>Статус: {{ selectedOrder.status }}</p>

          <h3>Данные по клиенту</h3>
          <p>ФИО: {{ selectedOrder.customerName }}</p>

          <h3>Данные по магазину</h3>
          <p>Адрес: {{ selectedOrder.storeAddress }}</p>

          <h3>Данные по способу оплаты</h3>
          <p>Способ: {{ selectedOrder.paymentMethod }}</p>
          <p v-if="selectedOrder.paymentStatus">Статус оплаты: {{ selectedOrder.paymentStatus }}</p>

          <h3>Состав заказа</h3>
          <ul>
            <li v-for="item in selectedOrder.items" :key="item.id">
              {{ item.name }} - {{ item.quantity }} шт. - {{ item.price }} ({{
                item.reservationStatus
              }})
            </li>
          </ul>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import axios from 'axios'
import Modal from './Modal.vue'

const orders = ref([]) // Теперь это будет пустой массив, в который будут записываться данные с API
const isLoading = ref(true) // Флаг загрузки

const searchOrderId = ref('')
const startDate = ref('')
const endDate = ref('')
const selectedStatuses = ref([])
const selectedOrder = ref(null)

const statuses = ['Заказ выполнен', 'Заказ зарезервирован', 'Заказ отменен']

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesId = order.orderNumber.includes(searchOrderId.value)
    const matchesDateRange =
      (!startDate.value || new Date(order.creationDate) >= new Date(startDate.value)) &&
      (!endDate.value || new Date(order.creationDate) <= new Date(endDate.value))
    const matchesStatus =
      selectedStatuses.value.length === 0 || selectedStatuses.value.includes(order.status)

    return matchesId && matchesDateRange && matchesStatus
  })
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

function filterOrders() {
  // Здесь может быть код для выполнения запроса к API с фильтрацией
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
    console.log(orders.value) // Записываем полученные заказы в orders
    const specificOrderId = 793024
    const specificOrder = orders.value.find((order) => order.id === specificOrderId)

    if (specificOrder) {
      console.log('Найденный заказ:', specificOrder)
    } else {
      console.log('Заказ с таким ID не найден')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false // Устанавливаем флаг загрузки в false после завершения
  }
}

onBeforeMount(() => fetchOrders())
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  background-color: #f4f4f4;
  color: #000000;
}
th {
  background-color: #f4f4f4;
  color: #000000;
}
</style>
