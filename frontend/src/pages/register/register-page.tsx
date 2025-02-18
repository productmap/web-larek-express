import { SyntheticEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button } from '@/components';
import useFormWithValidation from '@utils/hooks/useFormWithValidation';
import { toast } from 'react-toastify';
import { useRegisterUserMutation } from '@api';
import { AppRoute } from '@constants';
import { RegisterFormValues } from './helpers/types';
import styles from './register-page.module.scss';

export default function RegisterPage() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const {
    values,
    handleChange,
    errors,
    isValid
  } =
    useFormWithValidation<RegisterFormValues>(
      {
        name: '',
        password: '',
        email: ''
      },
      formRef.current
    );

  const handleFormSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await registerUser(values)
        .unwrap();

      if (response.success) {
        navigate(AppRoute.Main);
        toast.success('Регистрация успешна!');
      }

      return;

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Ошибка регистрации');
      }
    }
  };

  return (
    <div className={styles.register}>
      <Form
        formRef={formRef}
        handleFormSubmit={handleFormSubmit}
        extraClass={styles.register__container}
      >
        <h1 className={styles.register__title}>Вход</h1>
        <Input
          value={values.name || ''}
          onChange={handleChange}
          name="name"
          type="text"
          placeholder="Введите имя"
          label="Имя"
          required
          error={errors.name}
        />
        <Input
          value={values.email || ''}
          onChange={handleChange}
          name="email"
          type="email"
          placeholder="Введите email"
          label="Email"
          required
          error={errors.email}
        />
        <Input
          value={values.password || ''}
          onChange={handleChange}
          name="password"
          type="password"
          placeholder="Введите пароль"
          label="Пароль"
          required
          error={errors.password}
        />

        <Button
          type="submit"
          extraClass={styles.register__button}
          disabled={!isValid || isLoading}
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
        <Link to={AppRoute.Login} className={styles.register__link}>
          Войти
        </Link>
      </Form>
    </div>
  );
}
