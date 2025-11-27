import { MemberProvider } from '@/integrations';
import { AuthProvider } from '@/contexts/AuthContext';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';
import { AuthProtectedRoute } from '@/components/ui/auth-protected-route';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';

// Pages
import HomePage from '@/components/pages/HomePage';
import LoginPage from '@/components/pages/LoginPage';
import SignupPage from '@/components/pages/SignupPage';
import DashboardPage from '@/components/pages/DashboardPage';
import TransactionsPage from '@/components/pages/TransactionsPage';
import GoalsPage from '@/components/pages/GoalsPage';
import InvestmentsPage from '@/components/pages/InvestmentsPage';
import ReportsPage from '@/components/pages/ReportsPage';
import FAQPage from '@/components/pages/FAQPage';
import ProfilePage from '@/components/pages/ProfilePage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },
      {
        path: "dashboard",
        element: (
          <AuthProtectedRoute>
            <DashboardPage />
          </AuthProtectedRoute>
        ),
      },
      {
        path: "transactions",
        element: (
          <AuthProtectedRoute>
            <TransactionsPage />
          </AuthProtectedRoute>
        ),
      },
      {
        path: "goals",
        element: (
          <AuthProtectedRoute>
            <GoalsPage />
          </AuthProtectedRoute>
        ),
      },
      {
        path: "investments",
        element: (
          <AuthProtectedRoute>
            <InvestmentsPage />
          </AuthProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <AuthProtectedRoute>
            <ReportsPage />
          </AuthProtectedRoute>
        ),
      },
      {
        path: "faq",
        element: <FAQPage />,
      },
      {
        path: "profile",
        element: (
          <AuthProtectedRoute>
            <ProfilePage />
          </AuthProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default function AppRouter() {
  return (
    <MemberProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MemberProvider>
  );
}
