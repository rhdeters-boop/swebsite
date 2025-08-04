import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Components
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import SubscriptionTiers from './pages/SubscriptionTiers';
import Dashboard from './pages/Dashboard';
import MediaGallery from './pages/MediaGallery';
import BecomeCreator from './pages/BecomeCreator';
import CreatorSearch from './pages/CreatorSearch';
import CreatorProfile from './pages/CreatorProfile';
import CreatorApplicationSuccess from './pages/CreatorApplicationSuccess';
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/tiers" element={<SubscriptionTiers />} />
                  <Route path="/become-creator" element={<BecomeCreator />} />
                  <Route path="/creators" element={<CreatorSearch />} />
                  <Route path="/creator/:creatorId" element={<CreatorProfile />} />
                  
                  {/* Protected Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
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
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/gallery/:tier"
                    element={
                      <ProtectedRoute>
                        <MediaGallery />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/gallery"
                    element={
                      <ProtectedRoute>
                        <MediaGallery />
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
            </div>
          </Router>
        </AuthProvider>
      </Elements>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
