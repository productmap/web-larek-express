import { BrowserRouter, Route, Routes, To, useLocation, useNavigate } from 'react-router-dom';
import AdminEditProduct from '@components/admin/admin-edit-product';
import AdminNewProduct from '@components/admin/admin-new-product';
import AdminProducts from '@components/admin/admin-products';
import Basket from '@components/basket';
import CardDetails from '@components/card-details';
import Header from '@components/header';
import Modal from '@components/modal';
import Order, { OrderAddress, OrderContacts, OrderSuccess } from '@components/order';
import ProtectedRoute from '@components/protected-route/protected-route';
import { AppRoute } from '@constants';
import AdminPage from '@pages/admin/admin-page';
import LoginPage from '@pages/login/login-page';
import MainPage from '@pages/main/main-page';
import RegisterPage from '@pages/register/register-page';
import { ToastContainer } from 'react-toastify';
import { useGetCSRFTokenQuery, useGetUserQuery } from '@/store/api/weblarekApi';
import 'react-toastify/dist/ReactToastify.css';
import styles from './app.module.scss';
import '../../index.scss';
import { useEffect, useState } from 'react';
import Spinner from '@components/spinner';

const App = () => {
  useGetCSRFTokenQuery();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { refetch } = useGetUserQuery(undefined, { skip: false });

  useEffect(() => {
    const performAuthCheck = async () => {
      setIsCheckingAuth(true);
      await refetch();
      setIsCheckingAuth(false);
    };
    performAuthCheck();
  }, [refetch]);

  if (isCheckingAuth) {
    return <Spinner />;
  }

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Header />
        <RouteComponent />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5e3}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
};

export default App;

const RouteComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state && location.state.background;

  const handleModalClose = (path: To | number) => () => navigate(path as To);

  return (
    <>
      <Routes location={background || location}>
        <Route path={AppRoute.Main} element={<MainPage />} />
        <Route
          path={AppRoute.Login}
          element={
            <ProtectedRoute onlyUnAuth>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={AppRoute.Register}
          element={
            <ProtectedRoute onlyUnAuth>
              <RegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={AppRoute.Admin}
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route path={AppRoute.Admin} element={<AdminProducts />} />
          <Route path={AppRoute.AddProduct} element={<AdminNewProduct />} />
          <Route path={AppRoute.EditProduct} element={<AdminEditProduct />} />
        </Route>

        <Route path={AppRoute.Basket} element={<Basket />} />
        <Route path={AppRoute.Order} element={
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        }>
          <Route path={AppRoute.OrderAddress} element={<OrderAddress />} />
          <Route path={AppRoute.OrderContacts} element={<OrderContacts />} />
          <Route path={AppRoute.OrderSuccess} element={<OrderSuccess />} />
        </Route>
        <Route path={AppRoute.Product} element={<CardDetails />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path={AppRoute.Product}
            element={
              <Modal onClose={handleModalClose(-1)}>
                <CardDetails />
              </Modal>
            }
          />
          <Route
            path={AppRoute.Basket}
            element={
              <Modal onClose={handleModalClose(-1)}>
                <Basket />
              </Modal>
            }
          />
          <Route path={AppRoute.Order} element={<Order />}>
            <Route
              path={AppRoute.OrderAddress}
              element={
                <Modal
                  title="Способ оплаты"
                  onClose={handleModalClose({ pathname: AppRoute.Main })}
                >
                  <OrderAddress />
                </Modal>
              }
            />
            <Route
              path={AppRoute.OrderContacts}
              element={
                <Modal onClose={handleModalClose({ pathname: AppRoute.Main })}>
                  <OrderContacts />
                </Modal>
              }
            />
            <Route
              path={AppRoute.OrderSuccess}
              element={
                <Modal onClose={handleModalClose({ pathname: AppRoute.Main })}>
                  <OrderSuccess />
                </Modal>
              }
            />
          </Route>
          <Route path={AppRoute.Admin} element={<AdminPage />}>
            <Route
              path={AppRoute.AddProduct}
              element={
                <Modal onClose={handleModalClose({ pathname: AppRoute.Admin })}>
                  <AdminNewProduct />
                </Modal>
              }
            />
            <Route
              path={AppRoute.EditProduct}
              element={
                <Modal onClose={handleModalClose({ pathname: AppRoute.Admin })}>
                  <AdminEditProduct />
                </Modal>
              }
            />
          </Route>
        </Routes>
      )}
    </>
  );
};
