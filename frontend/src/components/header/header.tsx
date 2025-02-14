import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppRoute } from '@constants';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@store';
import { useLogoutUserMutation } from '@api';
import { getUser, setUser } from '@slices/userSlice';
import { resetBasket, selectBasketTotalCount } from '@slices/basketSlice';
import styles from './header.module.scss';
import { useErrorHandler } from '@utils/hooks/useErrorHandler.ts';
import { toast } from 'react-toastify';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const basketItemsCount = useAppSelector(selectBasketTotalCount);
  const user = useAppSelector(getUser);
  const [logoutUser] = useLogoutUserMutation();
  const errorHandler = useErrorHandler("Ошибка авторизации");

  const handleLogout = async () => {
    if (!user) return;

    return logoutUser().unwrap().then(() => {
      dispatch(setUser(null));
      dispatch(resetBasket());
      toast.info("Вы вышли из аккаунта");
      navigate('/');
    }).catch((error: unknown) => {
      errorHandler(error);
    });
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__container}>
        <Link className={styles.header__logo} to={AppRoute.Main}>
          <img
            className={styles['header__logo-image']}
            src='/logo.svg'
            alt='Film! logo'
          />
        </Link>
        {!user && (
          <Link
            to={{ pathname: AppRoute.Admin }}
            className={clsx(styles.header__icon, styles.header__login)}
          ></Link>
        )}
        {user && (
          <>
            <Link to={AppRoute.Admin} className={styles.header__user}>
              Админка
            </Link>
            <a
              href='#'
              onClick={handleLogout}
              className={clsx(styles.header__icon, styles.header__logout)}
            >
              Выйти
            </a>
          </>
        )}
        <Link
          to={{ pathname: AppRoute.Basket }}
          state={{
            background: {
              ...location,
              pathname: AppRoute.Main,
              state: null
            }
          }}
          className={clsx(styles.header__icon, styles.header__basket)}
        >
          Корзина
          <span className={styles['header__basket-counter']}>
            {basketItemsCount}
          </span>
        </Link>
      </div>
    </header>
  );
}
