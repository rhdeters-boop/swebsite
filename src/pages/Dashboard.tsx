import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, CreditCard, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen py-2 sm:py-4 px-4 sm:px-6 lg:px-8 bg-main text-body">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent1 to-accent2 bg-clip-text text-transparent">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="text-body mt-2">Manage your subscription and account settings</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card text-center">
            <User className="h-12 w-12 text-accent1 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
            <p className="text-body text-sm mb-4">Update your personal information</p>
            <Link to="/profile" className="bg-accent1 text-body w-full py-2 rounded-lg block">Manage Profile</Link>
          </div>

          <div className="card text-center">
            <CreditCard className="h-12 w-12 text-accent1 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Subscription</h3>
            <p className="text-body text-sm mb-4">View and manage your subscription</p>
            <button className="bg-accent1 text-body w-full py-2 rounded-lg">View Subscription</button>
          </div>

          <div className="card text-center">
            <Settings className="h-12 w-12 text-accent1 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
            <p className="text-body text-sm mb-4">Security and privacy settings</p>
            <Link to="/account-settings" className="bg-accent1 text-body w-full py-2 rounded-lg block">Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
