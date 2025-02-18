import { Request, Response } from 'express';
import { Order } from '../models/order';
import { AuthenticatedRequest, IOrder, IOrderResult } from '../types/apiTypes';
import logger from '../utils/logger';

export const orderProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authenticatedRequest = req as AuthenticatedRequest;
    const userId = authenticatedRequest.user?.id;

    console.log(req.body);

    if (!userId) {
      logger.error('User not authenticated for order creation');
      res.status(401)
        .json({ message: 'Unauthorized' });
      return;
    }

    const {
      items,
      totalPrice,
      address,
      payment,
      phone,
      email,
    } = req.body as IOrder;

    if (!items || totalPrice === undefined || totalPrice === null || !address || !payment || !phone || !email) {
      logger.error('Missing or invalid required order data in request body');
      res.status(400)
        .json({ message: 'Missing or invalid required order data' });
      return;
    }

    const order = new Order({
      items: items.map((productId: string) => ({ product: productId })),
      totalPrice,
      user: userId,
      address,
      payment,
      phone,
      email,
    });

    const savedOrder = await order.save(); // Save the order to the database

    const response: IOrderResult = { // Format the response
      success: true,
      message: 'Order created successfully',
      orderId: savedOrder._id as string,
    };

    logger.info(`Order created successfully, order ID: ${savedOrder._id} for user ID: ${userId}`);
    res.status(201)
      .json(response);
  } catch (error: any) {
    logger.error(`Error creating order: ${error.message}`);
    res.status(500)
      .json({
        success: false,
        message: error.message || 'Failed to create order.',
      });
  }
};
