import ReactDOM from 'react-dom/client';
import { StoreProvider } from './store/store-provider';
import App from './components/app/app';
import '@styles/index.scss';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <StoreProvider>
    <App />
  </StoreProvider>
);
