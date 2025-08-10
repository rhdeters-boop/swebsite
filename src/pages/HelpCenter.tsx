import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Search, X, FileText, Clock } from 'lucide-react';
import { helpCategories, helpArticles, searchHelpArticles, getArticlesByCategory } from '../data/helpContent';
import HelpCategoryCard from '../components/help/HelpCategoryCard';
import { debounce } from '../utils/debounce';

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof helpArticles>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const performSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      
      // Simulate async search (in real app, this would be an API call)
      setTimeout(() => {
        const results = searchHelpArticles(query);
        setSearchResults(results);
        setShowResults(true);
        setIsSearching(false);
      }, 300);
    }, 500),
    []
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getCategoryArticleCount = (categorySlug: string) => {
    return getArticlesByCategory(categorySlug).length;
  };

  return (
    <div className="bg-abyss-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="h-16 w-16 text-seductive mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4 font-serif">
            Help Center
          </h1>
          <p className="text-xl text-abyss-light-gray">
            Find answers to your questions and get the help you need
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-abyss-light-gray" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-12 py-4 bg-abyss-dark-900 border border-void-500/30 rounded-xl text-white placeholder-abyss-light-gray focus:ring-2 focus:ring-seductive focus:border-seductive text-lg"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-abyss-light-gray hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {showResults && (
            <div className="mt-4 max-w-2xl mx-auto">
              <div className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse text-abyss-light-gray">
                      Searching...
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                    </h3>
                    <div className="space-y-3">
                      {searchResults.slice(0, 5).map((article) => (
                        <Link
                          key={article.id}
                          to={`/help/article/${article.slug}`}
                          className="block p-3 bg-void-500/10 hover:bg-void-500/20 rounded-lg transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium group-hover:text-seductive transition-colors">
                                {article.title}
                              </h4>
                              <p className="text-sm text-abyss-light-gray mt-1 line-clamp-2">
                                {article.content.substring(0, 150)}...
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-abyss-light-gray capitalize">
                                  {article.category.replace('-', ' ')}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-abyss-light-gray">
                                  <Clock className="h-3 w-3" />
                                  {article.readTime} min read
                                </div>
                              </div>
                            </div>
                            <FileText className="h-5 w-5 text-abyss-light-gray group-hover:text-seductive transition-colors ml-4 flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                      {searchResults.length > 5 && (
                        <div className="text-center pt-3">
                          <Link
                            to={`/help/search?q=${encodeURIComponent(searchQuery)}`}
                            className="text-seductive hover:text-lust-violet transition-colors text-sm font-medium"
                          >
                            View all {searchResults.length} results →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-abyss-light-gray">
                      No articles found for "{searchQuery}"
                    </p>
                    <p className="text-sm text-abyss-light-gray mt-2">
                      Try searching with different keywords
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Categories - Only show when not searching */}
        {!showResults && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {helpCategories.map((category) => (
                <HelpCategoryCard
                  key={category.id}
                  category={category}
                  articleCount={getCategoryArticleCount(category.slug)}
                />
              ))}
            </div>

            {/* Popular Articles */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Popular Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {helpArticles.slice(0, 4).map((article) => (
                  <Link
                    key={article.id}
                    to={`/help/article/${article.slug}`}
                    className="bg-abyss-dark-900 border border-void-500/30 rounded-lg p-4 hover:border-seductive/50 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium group-hover:text-seductive transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-sm text-abyss-light-gray">
                          <span className="capitalize">
                            {article.category.replace('-', ' ')}
                          </span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min
                          </div>
                        </div>
                      </div>
                      <FileText className="h-5 w-5 text-abyss-light-gray group-hover:text-seductive transition-colors ml-4 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-seductive/10 to-lust-violet/10 border border-seductive/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-abyss-light-gray mb-6">
            Our support team is here to help you with any questions or issues.
          </p>
          <Link
            to="/contact"
            className="bg-gradient-to-r from-lust-violet to-seductive text-white px-8 py-3 rounded-lg font-semibold hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] inline-block"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;