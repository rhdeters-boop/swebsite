import React, { useState } from 'react';
import { CreditCard, History, Layers } from 'lucide-react';
import SubscriptionTab from '../components/billing/SubscriptionTab';
import BillingHistoryTab from '../components/billing/BillingHistoryTab';
import PaymentMethodsTab from '../components/billing/PaymentMethodsTab';

type BillingTab = 'subscriptions' | 'history' | 'methods';

const tabs: { key: BillingTab; label: string; icon: React.ReactNode }[] = [
  { key: 'subscriptions', label: 'Subscriptions', icon: <Layers className="h-4 w-4" /> },
  { key: 'history', label: 'History', icon: <History className="h-4 w-4" /> },
  { key: 'methods', label: 'Payment Methods', icon: <CreditCard className="h-4 w-4" /> },
];

const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BillingTab>('subscriptions');

  return (
    <section className="page-section min-h-screen py-6">
      <div className="container-app">
        <div className="mb-6">
          <h1 className="text-heading text-3xl">Billing</h1>
          <p className="text-text-secondary mt-1">Manage subscriptions, view history, and update payment methods.</p>
        </div>

        <div className="card">
          <div className="border-b border-border-secondary mb-6">
            <nav className="flex flex-wrap gap-2">
              {tabs.map((t) => {
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2
                      ${isActive ? 'bg-void-accent/20 text-void-accent-light border border-border-primary' : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-6">
            {activeTab === 'subscriptions' && <SubscriptionTab />}
            {activeTab === 'history' && <BillingHistoryTab />}
            {activeTab === 'methods' && <PaymentMethodsTab />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Billing;