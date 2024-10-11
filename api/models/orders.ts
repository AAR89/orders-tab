/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type orders = Array<{
    /**
     * сумма заказа
     */
    amount?: number;
    /**
     * номер заказа в учетной системе
     */
    uid1c?: string;
    /**
     * способ и дата отгрузки заказа клиенту
     */
    shipment?: {
        /**
         * дата когда заказ будет готов к выдаче клиенту
         */
        date?: string;
        method?: {
            id?: number;
            title?: string;
        };
    };
    /**
     * кол-во товара в заказе
     */
    quantity?: number;
    /**
     * точка выдачи (магазин)
     */
    shop?: {
        id?: number;
        title?: string;
    };
    /**
     * дата-время создания заказа
     */
    created?: string;
    client?: {
        firstname?: string;
        phone?: string;
        lastname?: string;
    };
    /**
     * статус и выбранный способ оплаты заказа
     */
    payment?: {
        method?: {
            id?: number;
            title?: string;
        };
        status?: {
            id?: number;
            title?: string;
        };
    };
    /**
     * уникальный id заказа
     */
    id?: number;
    /**
     * uid оператора который создал заказ
     */
    operator?: string;
    /**
     * статус заказа
     */
    status?: {
        /**
         * 0 - Неизвестный статус заказа, 1 - Заказ обрабатывается, 2 - Заказ обработан, 3 - Не хватило товара для резервирования, 4 - Заказ выполнен, 5 - Заказ отменен, 6 - Заказ зарезервирован
         */
        id?: number;
        title?: string;
    };
}>;
