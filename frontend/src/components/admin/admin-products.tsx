import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useGetMyProductsQuery } from '@api';
import { useAppSelector } from '@store';
import { getUser } from '@slices/userSlice.ts';
import { AppRoute } from '@constants';
import Spinner from '@components/spinner';
import Button from '@components/button';
import CardAdmin from '@components/card-admin';
import styles from './admin.module.scss';

export default function AdminProducts() {
  const location = useLocation();
  const user = useAppSelector(getUser);
  const {
    data: products,
    isLoading,
  } = useGetMyProductsQuery();

  return (
    <main className={clsx(styles.admin__products, styles.admin__container)}>
      {user && <h1 className={styles.admin__title}>Привет, {user.name}</h1>}
      <div className={styles.admin__header}>
        <h2 className={styles.admin__title}>Товары</h2>
        <Button
          extraClass={styles.admin__button}
          component={Link}
          to={{ pathname: AppRoute.AddProduct }}
          state={{ background: location }}
          replace
        >
          Добавить товар
        </Button>
      </div>
      {isLoading && <Spinner />}
      {products && products.map((product) => (
        <CardAdmin key={product._id} dataCard={product} component={Link} />
      ))}
    </main>
  );
}
