import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppRoute } from '@constants';
import { addSpacesToNumber } from '@utils/product-utils';
import BasketItem from '../basket-item/basket-item';
import { Button } from '@/components';
import { useAppDispatch, useAppSelector } from '@store';
import { removeProductCart, selectBasketItems } from '@slices/basketSlice';
import { setItems } from '@slices/orderSlice';
import { IProduct } from '@types';
import styles from './basket.module.scss';

export default function Basket() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectBasketItems);
  const itemsIds = useMemo(() => items.map((item) => item._id), [items]);

  const handleDeleteProduct = (id: string) => {
    dispatch(removeProductCart(id));
  };

  const amount = useMemo(
    () => items.reduce((s: number, v: IProduct) => s + v.price!, 0),
    [items]
  );

  if (items.length === 0) {
    return <h2 className={styles.basket__title}>Корзина пуста</h2>;
  }

  return (
    <div className={styles.basket}>
      <h2 className={styles.basket__title}>Корзина</h2>
      <ul className={styles.basket__list}>
        {items.map((product, index) => (
          <BasketItem
            deleteProductInBasket={handleDeleteProduct}
            key={product._id}
            dataProduct={product}
            index={index + 1}
            component='li'
          />
        ))}
      </ul>
      <div className={styles.modal__actions}>
        <Button
          extraClass={styles.button}
          onClick={() => dispatch(setItems({ items: itemsIds, totalPrice: amount }))}
          component={Link}
          to={{ pathname: AppRoute.OrderAddress }}
          state={{ background: { ...location, pathname: '/', state: null } }}
          replace
        >
          Оформить
        </Button>
        <span className={styles.basket__amount}>
          {addSpacesToNumber(amount)} синапсов
        </span>
      </div>
    </div>
  );
}
