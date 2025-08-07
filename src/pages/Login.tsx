import React from 'react';
import AuthSection from '../components/auth/AuthSection';
import LoginForm from '../components/auth/LoginForm';
import VoidLogo from '../components/VoidLogo';
import BackButton from '../components/BackButton';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <BackButton />

      <AuthSection
        title={
          <>
            Return to the <span className="text-lust-violet text-shadow-void-glow">Void</span>
          </>
        }
        subtitle="Sign in to access your premium content"
        icon={<VoidLogo className="h-12 w-12" />}
        footer={
          <>
            <div className="mt-4 text-caption">
              <p>🔒 Secure login • 💎 Premium content • ✨ Exclusive access</p>
            </div>
          </>
        }
      >
        <LoginForm />
      </AuthSection>
    </div>
  );
};

export default Login;
