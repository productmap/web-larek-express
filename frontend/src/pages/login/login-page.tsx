import { SyntheticEvent, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Spinner } from '@/components';
import { AppRoute } from '@constants';
import { LoginFormValues } from './helpers/types';
import { useGetCSRFTokenQuery, useLoginUserMutation } from '@api';
import useFormWithValidation from '@utils/hooks/useFormWithValidation';
import { useErrorHandler } from '@utils/hooks/useErrorHandler';
import { toast } from 'react-toastify';
import styles from './login-page.module.scss';

export default function LoginPage() {
  // получаем CSRF токен
  const {
    data: csrfToken,
    isLoading: csrfIsLoading
  } = useGetCSRFTokenQuery();

  const location = useLocation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    values,
    handleChange,
    errors,
    isValid
  } =
    useFormWithValidation<LoginFormValues>(
      {
        email: '',
        password: ''
      },
      formRef.current
    );

  const [loginUser, { isLoading }] = useLoginUserMutation();
  const errorHandler = useErrorHandler('Ошибка авторизации');

  // Обработчик отправки формы
  const handleFormSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await loginUser(values)
        .unwrap();
      if (response.user) {
        toast.info(`Привет, ${response.user.name}!`);
        navigate(location.state?.from || '/admin');
      }
    } catch (error: unknown) {
      errorHandler(error);
    }
  };

  // Отображаем спиннер, пока загружается CSRF токен или если произошла ошибка при его получении
  if (csrfIsLoading || !csrfToken?.success) {
    return <Spinner />;
  }

  return (
    <div className={styles.login}>
      <Form
        formRef={formRef}
        handleFormSubmit={handleFormSubmit}
        extraClass={styles.container}
      >
        <h1 className={styles.title}>Вход</h1>
        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="Введите email"
          value={values.email || ''}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <Input
          type="password"
          name="password"
          label="Пароль"
          placeholder="Введите пароль"
          value={values.password || ''}
          onChange={handleChange}
          error={errors.password}
          required
        />
        <Button
          type="submit"
          extraClass={styles.submitButton}
          disabled={!isValid || isLoading}
        >
          Войти {isLoading && <Spinner />}
        </Button>
        <Link to={AppRoute.Register} className={styles.link}>
          Зарегистрироваться
        </Link>
      </Form>
    </div>
  );
}
