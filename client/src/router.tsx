import { createBrowserRouter } from 'react-router';
import { AppBoot } from './components/layout/AppBoot';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { RouteError } from './components/layout/RouteError';
import { requireAuthLoader, requireGuestLoader } from './features/auth/loaders';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { SearchPage } from './features/search/SearchPage';
import { WatchlistPage } from './features/watchlist/WatchlistPage';

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    hydrateFallbackElement: <AppBoot />,
    children: [
      {
        element: <AuthLayout />,
        loader: requireGuestLoader,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <AppLayout />,
        loader: requireAuthLoader,
        children: [
          { path: '/', element: <WatchlistPage /> },
          { path: '/search', element: <SearchPage /> },
        ],
      },
    ],
  },
]);
