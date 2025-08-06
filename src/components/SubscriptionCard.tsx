import React from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

interface Creator {
  id: string;
  displayName: string;
  subscriptionPrice: number;
  isSubscribed?: boolean;
  isFollowing?: boolean;
  isFollowed?: boolean;
}

interface SubscriptionCardProps {
  creator: Creator;
  followMutation: UseMutationResult<any, Error, void, unknown>;
  onSubscribe: () => void;
  onFollow: () => void;
  onTip: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  creator,
  followMutation,
  onSubscribe,
  onFollow,
  onTip
}) => {
  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-void-accent mb-2">
          {formatPrice(creator.subscriptionPrice)}
          <span className="text-lg font-normal text-text-secondary">/month</span>
        </div>
        <p className="text-text-secondary">Get exclusive access to all content</p>
      </div>

      <div className="space-y-3">
        {creator.isSubscribed ? (
          <div className="w-full bg-success/10 text-success border border-success/20 rounded-xl py-3 px-4 text-center font-medium">
            ✓ Subscribed
          </div>
        ) : (
          <button
            onClick={onSubscribe}
            className="btn-primary w-full"
          >
            Subscribe Now
          </button>
        )}

        <button
          onClick={(creator.isFollowing || creator.isFollowed) ? undefined : onFollow}
          disabled={(creator.isFollowing || creator.isFollowed) || followMutation.isPending}
          className={`w-full btn ${
            (creator.isFollowing || creator.isFollowed)
              ? 'bg-background-secondary text-text-secondary border border-border-secondary'
              : 'btn-secondary'
          }`}
        >
          {(creator.isFollowing || creator.isFollowed) ? (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              {followMutation.isPending ? 'Following...' : 'Follow'}
            </>
          )}
        </button>

        <button
          onClick={onTip}
          className="btn-outline w-full"
        >
          💝 Send a Tip
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCard;
