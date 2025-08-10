import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Clock, ChevronRight, Search,
  Rocket, User, CreditCard, Star, Settings, Shield
} from 'lucide-react';
import ArticleBreadcrumb from '../components/ArticleBreadcrumb';
import { 
  helpCategories,
  getArticlesByCategory,
  searchHelpArticles
} from '../data/helpContent';
import type { HelpCategory, HelpArticle } from '../data/helpContent';

const categoryIcons: Record<string, React.ReactNode> = {
  rocket: <Rocket className="h-8 w-8" />,
  user: <User className="h-8 w-8" />,
  'credit-card': <CreditCard className="h-8 w-8" />,
  star: <Star className="h-8 w-8" />,
  settings: <Settings className="h-8 w-8" />,
  shield: <Shield className="h-8 w-8" />,
};

const HelpCategoryPage: React.FC = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug?: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);
  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  useEffect(() => {
    if (!categorySlug) return;

    const foundCategory = helpCategories.find(cat => cat.slug === categorySlug);
    if (!foundCategory) {
      navigate('/help');
      return;
    }

    setCategory(foundCategory);
    setSelectedSubcategory(subcategorySlug || null);
    
    const categoryArticles = getArticlesByCategory(categorySlug, subcategorySlug);
    setArticles(categoryArticles);
    setFilteredArticles(categoryArticles);
  }, [categorySlug, subcategorySlug, navigate]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = searchHelpArticles(searchQuery).filter(
        article => article.category === categorySlug && 
        (!subcategorySlug || article.subcategory === subcategorySlug)
      );
      setFilteredArticles(searchResults);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles, categorySlug, subcategorySlug]);

  if (!category) {
    return (
      <div className="bg-background-primary min-h-screen py-12 px-4">
        <div className="container-content mx-auto">
          <div className="card text-center py-10 animate-fade-in">
            <div className="animate-pulse text-text-secondary">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const subcategory = category.subcategories?.find(sub => sub.slug === subcategorySlug);
  const icon = categoryIcons[category.icon] || <FileText className="h-8 w-8" />;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Help Center', href: '/help' },
    { label: category.name, href: subcategory ? `/help/category/${category.slug}` : '#', current: !subcategory },
    ...(subcategory ? [{ label: subcategory.name, href: '#', current: true }] : [])
  ];

  return (
    <div className="bg-background-primary min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-background-secondary to-background-primary">
        <div className="container-content mx-auto px-4 py-8">
          <ArticleBreadcrumb items={breadcrumbItems} className="mb-6" />
          
          <div className="flex items-start gap-6">
            <div className="p-4 bg-text-accent/10 rounded-xl text-text-accent">
              {icon}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-text-primary mb-2 font-serif">
                {subcategory ? subcategory.name : category.name}
              </h1>
              <p className="text-lg text-text-secondary">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-content mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Back Link */}
            <Link
              to="/help"
              className="inline-flex items-center text-text-secondary hover:text-text-accent transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Link>

            {/* Subcategories */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  {category.name} Topics
                </h3>
                <div className="space-y-1">
                  <Link
                    to={`/help/category/${category.slug}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      !selectedSubcategory 
                        ? 'bg-void-accent/10 text-void-accent border-l-4 border-void-accent' 
                        : 'hover:bg-background-tertiary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    All Articles
                  </Link>
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/help/category/${category.slug}/${sub.slug}`}
                      className={`block p-3 rounded-lg transition-colors ${
                        selectedSubcategory === sub.slug 
                          ? 'bg-void-accent/10 text-void-accent border-l-4 border-void-accent' 
                          : 'hover:bg-background-tertiary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Help Card */}
            <div className="card-glass">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Can't find what you need?
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Our support team is ready to help you.
              </p>
              <Link
                to="/contact"
                className="btn-primary-sm w-full justify-center"
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${subcategory ? subcategory.name : category.name}...`}
                  className="form-input pl-12"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                {searchQuery ? 'Search Results' : 'Articles'} ({filteredArticles.length})
              </h2>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/help/article/${article.slug}`}
                    className="card hover:border-border-primary transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-text-primary font-medium group-hover:text-text-accent transition-colors mb-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                          {article.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-3 text-sm text-text-tertiary">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min read
                          </div>
                          <span>•</span>
                          <span>Updated {new Date(article.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-text-tertiary group-hover:text-text-accent transition-colors ml-4 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card text-center py-10 animate-fade-in">
                <FileText className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-text-secondary mb-2">
                  No articles found
                </h3>
                <p className="text-text-tertiary">
                  {searchQuery 
                    ? `No articles match "${searchQuery}" in this category`
                    : 'No articles available in this category yet'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn-secondary-sm mt-4"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCategoryPage;