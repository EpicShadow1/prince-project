import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CasesProvider } from './contexts/CasesContext';
import { StaffProvider } from './contexts/StaffContext';
import { SystemProvider } from './contexts/SystemContext';
import { ChatProvider } from './contexts/ChatContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatWidget } from './components/ChatWidget';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
import { queryClient } from './queryClient';
import { initPerformanceMonitoring } from './utils/performance';


// Eagerly load critical pages
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { WelcomePage } from './pages/WelcomePage';

// Lazy load dashboard components (heavy)
const JudgeDashboard = lazy(() => import('./pages/dashboards/JudgeDashboard'));
const RegistrarDashboard = lazy(() => import('./pages/dashboards/RegistrarDashboard'));
const ClerkDashboard = lazy(() => import('./pages/dashboards/ClerkDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const LawyerDashboard = lazy(() => import('./pages/dashboards/LawyerDashboard'));
const PartnerDashboard = lazy(() => import('./pages/dashboards/PartnerDashboard'));
const CourtAdminDashboard = lazy(() => import('./pages/dashboards/CourtAdminDashboard'));
const ITAdminDashboard = lazy(() => import('./pages/dashboards/ITAdminDashboard'));
const AuditorDashboard = lazy(() => import('./pages/dashboards/AuditorDashboard'));

// Lazy load functional pages
const CaseManagementPage = lazy(() => import('./pages/CaseManagementPage'));
const DocumentRepositoryPage = lazy(() => import('./pages/DocumentRepositoryPage'));
const StaffRegistrationPage = lazy(() => import('./pages/StaffRegistrationPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const PartnerInteroperabilityPage = lazy(() => import('./pages/PartnerInteroperabilityPage'));
const CaseDetailPage = lazy(() => import('./pages/CaseDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const WriteJudgmentPage = lazy(() => import('./pages/WriteJudgmentPage'));
const ReviewMotionsPage = lazy(() => import('./pages/ReviewMotionsPage'));
const SignOrdersPage = lazy(() => import('./pages/SignOrdersPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));

// Initialize performance monitoring
initPerformanceMonitoring();


// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-secondary text-sm">Loading...</p>
    </div>
  </div>
);

function DashboardRouter() {

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Store current route for refresh persistence
  useEffect(() => {
    if (user && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/') {
      localStorage.setItem('court_last_route', location.pathname + location.search);
    }
  }, [location, user]);

  // Redirect to stored route on refresh if authenticated
  useEffect(() => {
    if (user) {
      const lastRoute = localStorage.getItem('court_last_route');
      if (lastRoute && location.pathname === '/dashboard') {
        navigate(lastRoute, { replace: true });
      }
    }
  }, [user, navigate, location.pathname]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case 'judge':
      return (
        <Suspense fallback={<PageLoader />}>
          <JudgeDashboard />
        </Suspense>
      );
    case 'registrar':
      return (
        <Suspense fallback={<PageLoader />}>
          <RegistrarDashboard />
        </Suspense>
      );
    case 'clerk':
      return (
        <Suspense fallback={<PageLoader />}>
          <ClerkDashboard />
        </Suspense>
      );
    case 'admin':
      return (
        <Suspense fallback={<PageLoader />}>
          <AdminDashboard />
        </Suspense>
      );
    case 'it_admin':
      return (
        <Suspense fallback={<PageLoader />}>
          <ITAdminDashboard />
        </Suspense>
      );
    case 'court_admin':
      return (
        <Suspense fallback={<PageLoader />}>
          <CourtAdminDashboard />
        </Suspense>
      );
    case 'auditor':
      return (
        <Suspense fallback={<PageLoader />}>
          <AuditorDashboard />
        </Suspense>
      );
    case 'lawyer':
      return (
        <Suspense fallback={<PageLoader />}>
          <LawyerDashboard />
        </Suspense>
      );
    case 'partner':
      return (
        <Suspense fallback={<PageLoader />}>
          <PartnerDashboard />
        </Suspense>
      );

    default:
      return <Navigate to="/login" replace />;
  }
}
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const { toasts, removeToast } = useToast();
  
  // Only show chat widget if user is logged in and not on public pages
  const showChat =
  user && !['/', '/login', '/signup'].includes(location.pathname);
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Routes>


        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
          <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } />

        <Route
          path="/cases"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <CaseManagementPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/cases/:id"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <CaseDetailPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/documents"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <DocumentRepositoryPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/staff"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <StaffRegistrationPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/reports"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <ReportsPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/audit"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <AuditLogPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/interoperability"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <PartnerInteroperabilityPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/settings"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/write-judgment"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <WriteJudgmentPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/review-motions"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <ReviewMotionsPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/sign-orders"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <SignOrdersPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route
          path="/calendar"
          element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <CalendarPage />
              </Suspense>
            </ErrorBoundary>
            </ProtectedRoute>
          } />


        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {showChat && <ChatWidget />}
    </>);


}
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <SystemProvider>
            <StaffProvider>
              <CasesProvider>
                <ChatProvider>
                  <Router
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true,
                    }}
                  >
                    <AppContent />
                  </Router>
                </ChatProvider>
              </CasesProvider>
            </StaffProvider>
          </SystemProvider>
        </SocketProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
