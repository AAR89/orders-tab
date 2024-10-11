/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type order = {
    uid1c?: string;
    shipment?: {
        date?: string;
        method?: {
            id?: number;
            title?: string;
        };
    };
    shop?: {
        id?: number;
        title?: string;
    };
    created?: string;
    client?: {
        firstname?: string;
        phone?: string;
        lastname?: string;
    };
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
    id?: number;
    items?: Array<{
        quantity?: number;
        price?: number;
        id?: number;
        title?: string;
        status?: string;
    }>;
    operator?: string;
    status?: {
        id?: number;
        title?: string;
    };
};

