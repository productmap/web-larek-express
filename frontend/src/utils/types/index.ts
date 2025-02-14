import { CATEGORY_CLASSES } from '@constants';

export interface IProduct {
  _id: string;
  title: string;
  price: number | null;
  description: string;
  category: keyof typeof CATEGORY_CLASSES;
  image: {
    fileName: string;
    alt: string;
  };
}

export interface IFile {
  _id: string;
  fileName: string;
  originalName: string;
  alt?: string;
}

export interface IBasket {
  items: IProduct[];
  totalCount: number;
}

export interface IOrderItem {
  product: string;
}

export enum PaymentType {
  Card = 'card',
  Online = 'online'
}

export interface IOrder {
  payment: PaymentType;
  email: string;
  phone: string;
  address: string;
  items: string[];
  totalPrice: number;
}

export interface IOrderResult {
  id: string;
  total: number;
}

export interface IUser {
  email: string;
  name: string;
}

export type ServerResponse<T> = {
  success: boolean;
} & T;

export type UserResponse = ServerResponse<{
  user: IUser;
}>;

export type UserLoginBodyDto = {
  email: string;
  password: string;
};

export type UserRegisterBodyDto = {
  password: string;
} & IUser;

export type OrderForm = Omit<IOrder, 'total' | 'items'>;

export interface IOrderResult {
  id: string;
  total: number;
}

export interface PaymentFormValues {
  address: string;
  payment: PaymentType;
}

export interface ContactsFormValues {
  email: string;
  phone: string;
}


export const enum RequestStatus {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Failed = 'failed'
}

export type ApiListResponse<Type> = {
  total: number;
  items: Type[];
};
