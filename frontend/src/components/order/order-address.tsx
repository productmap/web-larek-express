import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Radio } from '@/components';
import useFormWithValidation from '@utils/hooks/useFormWithValidation';
import { AppRoute } from '@constants';
import { PaymentFormValues, PaymentType } from './helpers/types';
import { useAppDispatch, useAppSelector } from '@store';
import { selectOrderInfo, setInfo } from '@slices/orderSlice';
import styles from './order.module.scss';

export function OrderAddress() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const orderPersistData = useAppSelector(selectOrderInfo);

  const formRef = useRef<HTMLFormElement | null>(null);
  const {
    values,
    handleChange,
    errors,
    isValid,
    setValuesForm,
  } =
    useFormWithValidation<PaymentFormValues>(
      {
        address: '',
        payment: PaymentType.Online,
      },
      formRef.current,
    );

  useEffect(() => {
    setValuesForm({
      address: orderPersistData.address,
      payment: PaymentType.Online,
    });
  }, [orderPersistData]);

  const nextStep = () => {
    dispatch(setInfo(values));
    navigate(
      { pathname: AppRoute.OrderContacts },
      {
        state: {
          background: {
            ...location,
            pathname: '/',
            state: null,
          },
        },
      },
    );
  };

  return (
    <Form formRef={formRef}>
      <div className={styles.order__field}>
        <div className={styles.order__buttons}>
          <Radio
            type="radio"
            name="payment"
            label="Онлайн"
            value={PaymentType.Online}
            onChange={handleChange}
            checked={values.payment === PaymentType.Online}
            extraClass={styles.order__button_alt}
            required
          />
          <Radio
            type="radio"
            name="payment"
            label="При получении"
            onChange={handleChange}
            checked={values.payment === PaymentType.Card}
            value={PaymentType.Card}
            extraClass={styles.order__button_alt}
            required
          />
        </div>
      </div>
      <Input
        type="text"
        name="address"
        label="Адрес доставки"
        placeholder="Введите адрес"
        value={values.address || ''}
        minLength={1}
        onChange={handleChange}
        error={errors.address}
        required
      />
      <div className={styles.order__buttons}>
        <Button type="submit" onClick={nextStep} disabled={!isValid}>
          Далее
        </Button>
      </div>
    </Form>
  );
}
