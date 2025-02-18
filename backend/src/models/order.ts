import mongoose, { Document, Model, Schema } from 'mongoose';
import { IProduct } from './product';
import { IUser } from './user';

interface IOrderItem {
  product: IProduct['_id'];
}

interface IOrder extends Document {
  items: IOrderItem[];
  totalPrice: number;
  user: IUser['_id'];
  address: string;
  payment: string;
  phone: string;
  email: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>({
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      }
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  payment: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order: Model<IOrder> = mongoose.model<IOrder>(
  'Order',
  OrderSchema,
);
