import { Request } from 'express';

export interface IFile {
  _id: string;
  fileName: string;
  alt?: string;
}

export interface IImage {
  fileName: string;
  alt: string;
}

export interface IOrder {
  payment: string;
  email: string;
  phone: string;
  address: string;
  items: string[];
  totalPrice: number;
}

export interface IOrderResult {
  success: boolean;
  message: string;
  orderId: string;
}

export interface UserLoginBodyDto {
  email: string;
  password: string;
}

export interface UserRegisterBodyDto {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
}

export interface UserResponseToken {
  success: boolean;
  user: {
    name: string;
    email: string;
  };
}

export interface ServerResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiListResponse<T> {
  total: number;
  items: T[];
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
