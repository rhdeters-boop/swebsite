import React from 'react';
import UserCard from './UserCard';
import type { User } from './UserCard';

interface UserRowProps {
  title: string;
  users: User[];
  icon: React.ReactNode;
  onSeeMore?: () => void;
}

const UserRow: React.FC<UserRowProps> = ({ title, users, icon, onSeeMore }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {onSeeMore && (
          <button
            onClick={onSeeMore}
            className="flex items-center gap-2 text-seductive hover:text-seductive-dark transition-colors duration-200 group"
          >
            <span className="text-sm font-medium">See More</span>
            <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="relative">
        {/* Horizontal scroll container */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {users.map((user) => (
            <div key={user.id} className="flex-shrink-0">
              <UserCard user={user} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserRow;
