import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Rocket, User, CreditCard, Star, Settings, Shield,
  ChevronRight, FileText
} from 'lucide-react';
import { HelpCategory } from '../../data/helpContent';

interface HelpCategoryCardProps {
  category: HelpCategory;
  articleCount: number;
}

const iconMap: Record<string, React.ReactNode> = {
  rocket: <Rocket className="h-8 w-8" />,
  user: <User className="h-8 w-8" />,
  'credit-card': <CreditCard className="h-8 w-8" />,
  star: <Star className="h-8 w-8" />,
  settings: <Settings className="h-8 w-8" />,
  shield: <Shield className="h-8 w-8" />,
};

const HelpCategoryCard: React.FC<HelpCategoryCardProps> = ({ category, articleCount }) => {
  const icon = iconMap[category.icon] || <FileText className="h-8 w-8" />;

  return (
    <Link
      to={`/help/category/${category.slug}`}
      className="block bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6 hover:border-seductive/50 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="p-3 bg-seductive/10 rounded-lg text-seductive mr-4 group-hover:bg-seductive/20 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white group-hover:text-seductive transition-colors">
              {category.name}
            </h3>
            <p className="text-abyss-light-gray text-sm mt-1">
              {category.description}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-abyss-light-gray group-hover:text-seductive transition-colors mt-1" />
      </div>
      
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-void-500/20">
          <div className="flex flex-wrap gap-2">
            {category.subcategories.slice(0, 3).map((subcategory) => (
              <span
                key={subcategory.id}
                className="text-xs px-3 py-1 bg-void-500/20 text-abyss-light-gray rounded-full"
              >
                {subcategory.name}
              </span>
            ))}
            {category.subcategories.length > 3 && (
              <span className="text-xs px-3 py-1 text-abyss-light-gray">
                +{category.subcategories.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-abyss-light-gray">
        {articleCount} {articleCount === 1 ? 'article' : 'articles'}
      </div>
    </Link>
  );
};

export default HelpCategoryCard;