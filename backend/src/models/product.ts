import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: {
    fileName: string;
    alt: string;
  };
  category: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Определение схемы Mongoose
const productSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      fileName: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        required: true,
      },
    },
    category: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Создание и экспорт модели
const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
