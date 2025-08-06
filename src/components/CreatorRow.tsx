import React from 'react';
import CreatorCarousel from './CreatorCarousel';
import CreatorCard from './CreatorCard';
import type { Creator } from './CreatorCarousel';

interface CreatorRowProps {
  title: string;
  creators: Creator[];
  icon: React.ReactNode;
}

const CreatorRow: React.FC<CreatorRowProps> = ({ title, creators, icon }) => {
  const handleSeeMore = () => {
    // TODO: Navigate to category page or show more creators
    console.log(`See more ${title}`);
  };

  return (
    <CreatorCarousel
      title={title}
      creators={creators}
      icon={icon}
      onSeeMore={handleSeeMore}
      CreatorCardComponent={CreatorCard}
    />
  );
};

export default CreatorRow;
