import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyFeed from "../components/feed/MyFeed";
import Explore from "../components/feed/Explore";

const FEED_TABS = [
  { key: "my-feed", label: "My Feed" },
  { key: "explore", label: "Explore" },
];

const Feed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(window.location.pathname === '/' ? FEED_TABS[0].key : FEED_TABS[1].key);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Feed component mounted or path changed:", window.location.pathname);
    if (window.location.pathname === '/') {
      setActiveTab(FEED_TABS[0].key);
    } else if (window.location.pathname === '/explore') {
      setActiveTab(FEED_TABS[1].key);
    }
  }, [window.location.pathname]);

  const onTabChange = (tab: string) => {
    navigate(tab === 'my-feed' ? '/' : '/explore');
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-6">
      {/* Feed Tabs */}
      <div className="border-b border-void-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {FEED_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                tab.key === activeTab
                  ? "border-seductive text-seductive"
                  : "border-transparent text-abyss-light-gray hover:text-white hover:border-void-500"
              }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>

      {/* Feed Content */}
      <>{console.log("Active Tab:", activeTab)}</>
      <div>
        {activeTab === 'my-feed' ? <MyFeed /> : <Explore />}
      </div>
    </div>
  );
}

export default Feed;