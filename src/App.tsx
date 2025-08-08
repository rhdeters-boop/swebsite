import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import MyFeed from './pages/MyFeed';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AccountSettings from './pages/AccountSettings';
import Security from './pages/Security';
import Dashboard from './pages/Dashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import BecomeCreator from './pages/BecomeCreator';
import CreatorSearch from './pages/CreatorSearch';
import CreatorProfile from './pages/CreatorProfile';
import UnifiedProfile from './pages/UnifiedProfile';
import CreatorApplicationSuccess from './pages/CreatorApplicationSuccess';
import HelpCenter from './pages/HelpCenter';
import Contact from './pages/Contact';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ProtectedRoute from './components/ProtectedRoute';
import Notifications from './pages/Notifications';
import Billing from './pages/Billing';

// Context
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import CreateProfile from './pages/CreateProfile';
import RegisterAsCreator from './pages/RegisterAsCreator';
import CreateCreatorProfile from './pages/CreateCreatorProfile';

// Hooks
import { useNavigationTracking } from './hooks/useNavigationTracking';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Create a component that conditionally renders navbar
const AppContent = () => {
  const location = useLocation();
  
  // Track navigation for login redirect
  useNavigationTracking();
  
  // Routes where navbar should be hidden
  const authRoutes = ['/login', '/register', '/register-creator', '/forgot-password', '/reset-password'];
  const hideNavbar = authRoutes.includes(location.pathname);

  return (
    <div className="bg-abyss-black flex flex-col min-h-screen">
      <ScrollToTop />
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/my-feed" element={<MyFeed />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-creator" element={<RegisterAsCreator />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/create-creator-profile" element={<CreateCreatorProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/become-creator" element={<BecomeCreator />} />
          <Route path="/creators" element={<CreatorSearch />} />
          <Route path="/creator/:creatorId" element={<CreatorProfile />} />
          <Route path="/user/:username" element={<UnifiedProfile />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />

          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator-dashboard"
            element={
              <ProtectedRoute>
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account-settings"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <Security />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/application-success"
            element={
              <ProtectedRoute>
                <CreatorApplicationSuccess />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!hideNavbar && <Footer />}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <AlertProvider>
            <Router>
              <AppContent />
            </Router>
          </AlertProvider>
        </AuthProvider>
      </Elements>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
