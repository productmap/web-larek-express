import { SyntheticEvent, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppRoute } from '@constants';
import InputMask from '@mona-health/react-input-mask';
import { Button, Form, Input } from '@/components';
import useFormWithValidation from '@utils/hooks/useFormWithValidation';
import { ContactsFormValues } from './helpers/types';
import { useAppDispatch, useAppSelector } from '@store';
import { weblarekApi } from '@api';
import { selectOrderInfo, setInfo } from '@slices/orderSlice';
import { resetBasket } from '@slices/basketSlice';
import { toast } from 'react-toastify';
import styles from './order.module.scss';
import { IOrder } from '@types';

export function OrderContacts() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const orderPersistData = useAppSelector(selectOrderInfo);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [createOrder, { isLoading }] = weblarekApi.useOrderProductsMutation();
  const {
    values,
    handleChange,
    errors,
    isValid,
    setValuesForm,
  } =
    useFormWithValidation<ContactsFormValues>(
      {
        email: '',
        phone: '',
      },
      formRef.current,
    );

  useEffect(() => {
    setValuesForm({
      email: orderPersistData.email,
      phone: orderPersistData.phone,
    });
  }, [orderPersistData, setValuesForm]);

  const handleFormSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setInfo(values));

    const orderPayload: IOrder = {
      ...orderPersistData,
      ...values,
      totalPrice: 0,
    };

    try {
      const dataResponse = await createOrder(orderPayload)
        .unwrap();

      dispatch(resetBasket());
      navigate(
        { pathname: AppRoute.OrderSuccess },
        {
          state: {
            orderResponse: dataResponse,
            background: {
              ...location,
              pathname: '/',
              state: null,
            },
          },
          replace: true,
        },
      );
      toast.success('Заказ успешно оформлен!');
    } catch (error) {
      toast.error('Ошибка оформления заказа!');
    }
  };

  return (
    <Form handleFormSubmit={handleFormSubmit} formRef={formRef}>
      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="Введите Email"
        value={values.email || ''}
        onChange={handleChange}
        error={errors.email}
        required
      />
      <Input
        type="tel"
        name="phone"
        label="Телефон"
        placeholder="+7 (999) 999-99-99"
        mask="+7 (999) 999 99 99"
        value={values.phone || ''}
        onChange={handleChange}
        error={errors.phone}
        component={InputMask}
        required
      />

      <div className={styles.order__buttons}>
        <Button
          type="button"
          component={Link}
          extraClass={styles.order__button_secondary}
          to={{ pathname: AppRoute.OrderAddress }}
          state={{
            background: {
              ...location,
              pathname: '/',
              state: null,
            },
          }}
          replace
        >
          Назад
        </Button>
        <Button type="submit" disabled={!isValid || isLoading}>
          {isLoading ? 'Оформление...' : 'Оплатить'}
        </Button>
      </div>
    </Form>
  );
}
