import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@store';
import { getIsAuthChecked } from '@slices/userSlice.ts';
import { useGetUserQuery } from '@api';
import Spinner from '@components/spinner';

type TProtectedRouteProps = {
  children: ReactNode;
  redirectPath?: string;
  onlyUnAuth?: boolean;
};

export default function ProtectedRoute({
  children,
  redirectPath = '/login',
  onlyUnAuth = false,
}: TProtectedRouteProps) {
  const location = useLocation();
  const isAuthChecked = useAppSelector(getIsAuthChecked);
  const { isFetching } = useGetUserQuery(undefined, { skip: isAuthChecked });

  if (isFetching) {
    return <Spinner />;
  }

  // Авторизованный пользователь на маршруте для неавторизованных пользователей
  if (onlyUnAuth && isAuthChecked) {
    return <Navigate to={redirectPath} replace
                     state={{ background: location.state?.from?.background }} />;
  }

  // Неавторизованный пользователь на защищенном маршруте
  if (!onlyUnAuth && !isAuthChecked) {
    return <Navigate to={redirectPath} state={{ from: location }} />;
  }

  return children;
}
