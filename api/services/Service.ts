/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { order } from '../models/order';
import type { orders } from '../models/orders';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class Service {
    /**
     * Список заказов
     * @param token
     * @param dateFrom начало периода, формат YYYY-MM-DD
     * @param dateTo конец периода, формат YYYY-MM-DD
     * @param orderStatus статус(ы) заказа в виде числа, если нужно указать несколько статусов, то надо передать их через запятую, например '4,5,6'... Варианты статусов заказа:  1 - Заказ обрабатывается, 2 - Заказ обработан, 3 - Не хватило товара для резервирования,   4 - Заказ выполнен, 5 - Заказ отменен, 6 - Заказ зарезервирован
     * @returns any successful request
     * @throws ApiError
     */
    public static getOrders(
        token: string,
        dateFrom?: string,
        dateTo?: string,
        orderStatus?: string,
    ): CancelablePromise<Array<{
        orders?: orders;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/orders',
            headers: {
                'Token': token,
            },
            query: {
                'dateFrom': dateFrom,
                'dateTo': dateTo,
                'orderStatus': orderStatus,
            },
            errors: {
                400: `некорректные данные в параметрах запроса`,
                403: `доступ запрещен`,
                500: `.`,
                501: `.`,
                503: `.`,
                504: `.`,
            },
        });
    }
    /**
     * Детали заказа по его номеру
     * @param token
     * @param id идентификатор заказа
     * @returns any successful request
     * @throws ApiError
     */
    public static getOrder(
        token: string,
        id: number,
    ): CancelablePromise<{
        order?: order;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/order/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Token': token,
            },
            errors: {
                400: `некорректные данные в параметрах запроса`,
                403: `доступ запрещен`,
                404: `заказ не найден`,
                500: `.`,
                501: `.`,
                503: `.`,
                504: `.`,
            },
        });
    }
}
