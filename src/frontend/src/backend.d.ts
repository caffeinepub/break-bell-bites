import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MenuItem {
    name: string;
    price: bigint;
}
export interface Order {
    customerName: string;
    mobileNumber: string;
    orderId: bigint;
    deliveryPlace: string;
    totalAmount: bigint;
    timestamp: bigint;
    items: Array<OrderItem>;
}
export interface OrderItem {
    itemName: string;
    quantity: bigint;
}
export interface backendInterface {
    getAllOrders(): Promise<Array<Order>>;
    getMenu(): Promise<Array<MenuItem>>;
    submitOrder(customerName: string, deliveryPlace: string, mobileNumber: string, items: Array<OrderItem>, totalAmount: bigint): Promise<bigint>;
}
