import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, ThumbsUp, ThumbsDown, BookOpen,
  ChevronRight, AlertCircle, FileText
} from 'lucide-react';
import ArticleBreadcrumb from '../components/ArticleBreadcrumb';
import {
  getArticleBySlug,
  getRelatedArticles,
  helpCategories
} from '../data/helpContent';
import type { HelpArticle } from '../data/helpContent';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<HelpArticle[]>([]);
  const [helpful, setHelpful] = useState<'yes' | 'no' | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    const foundArticle = getArticleBySlug(slug);
    if (foundArticle) {
      setArticle(foundArticle);
      setRelatedArticles(getRelatedArticles(foundArticle.id));
      // Scroll to top on article change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Article not found, redirect to help center
      navigate('/help');
    }
  }, [slug, navigate]);

  if (!article) {
    return (
      <div className="bg-background-primary min-h-screen py-12 px-4">
        <div className="container-content mx-auto">
          <div className="card text-center py-10 animate-fade-in">
            <AlertCircle className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get category and subcategory info
  const category = helpCategories.find(cat => cat.slug === article.category);
  const subcategory = category?.subcategories?.find(sub => sub.slug === article.subcategory);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Help Center', href: '/help' },
    ...(category ? [{ label: category.name, href: `/help/category/${category.slug}` }] : []),
    ...(subcategory && category ? [{ label: subcategory.name, href: `/help/category/${category.slug}/${subcategory.slug}` }] : []),
    { label: article.title, href: '#', current: true }
  ];

  const handleHelpfulVote = (vote: 'yes' | 'no') => {
    setHelpful(vote);
    setShowThankYou(true);
    
    // TODO: Send vote to backend API
    // For now, just update local state
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
  };

  // Convert markdown-style content to HTML (simple version)
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactElement[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListComponent = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListComponent key={elements.length} className="list-disc list-inside space-y-2 text-text-secondary mb-6 ml-4">
            {currentList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ListComponent>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-text-primary mb-4 font-serif">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-semibold text-text-primary mb-3 mt-6">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-text-primary mb-2 mt-4">
            {line.substring(4)}
          </h3>
        );
      }
      // Lists
      else if (line.match(/^[\-\*]\s/)) {
        listType = 'ul';
        currentList.push(line.substring(2));
      } else if (line.match(/^\d+\.\s/)) {
        listType = 'ol';
        currentList.push(line.replace(/^\d+\.\s/, ''));
      }
      // Paragraphs
      else if (line.trim()) {
        flushList();
        elements.push(
          <p key={index} className="text-text-secondary mb-4 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="bg-background-primary min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border-muted">
        <div className="container-content mx-auto px-4 py-4">
          <ArticleBreadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-content mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-2">
            {/* Back Button */}
            <Link
              to="/help"
              className="inline-flex items-center text-text-secondary hover:text-text-accent transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Link>

            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-4 font-serif">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-text-tertiary">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime} min read
                </div>
                <span>•</span>
                <span>Last updated: {new Date(article.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-invert max-w-none">
              {renderContent(article.content)}
            </div>

            {/* Helpful Section */}
            <div className="mt-12 pt-8 border-t border-border-muted">
              <div className="card-glass p-6 text-center">
                {!showThankYou ? (
                  <>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      Was this article helpful?
                    </h3>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleHelpfulVote('yes')}
                        disabled={helpful !== null}
                        className={`btn-secondary-sm group ${
                          helpful === 'yes' ? 'border-success-500 text-success-500' : ''
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Yes
                      </button>
                      <button
                        onClick={() => handleHelpfulVote('no')}
                        disabled={helpful !== null}
                        className={`btn-secondary-sm group ${
                          helpful === 'no' ? 'border-error-500 text-error-500' : ''
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        No
                      </button>
                    </div>
                    {article.helpful && (
                      <p className="text-sm text-text-tertiary mt-4">
                        {article.helpful.yes} out of {article.helpful.yes + article.helpful.no} found this helpful
                      </p>
                    )}
                  </>
                ) : (
                  <div className="animate-fade-in">
                    <div className="text-success-500 mb-2">✓</div>
                    <p className="text-text-primary font-medium">Thank you for your feedback!</p>
                    <p className="text-text-secondary text-sm mt-2">
                      Your response helps us improve our documentation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-text-accent" />
                  Related Articles
                </h3>
                <div className="space-y-3">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      to={`/help/article/${related.slug}`}
                      className="block p-3 rounded-lg hover:bg-background-tertiary transition-colors group"
                    >
                      <h4 className="text-text-primary font-medium group-hover:text-text-accent transition-colors">
                        {related.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-text-tertiary">
                        <Clock className="h-3 w-3" />
                        {related.readTime} min read
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Need More Help */}
            <div className="card-glass">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Need More Help?
              </h3>
              <p className="text-text-secondary mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Link
                to="/contact"
                className="btn-primary w-full justify-center"
              >
                Contact Support
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </div>

            {/* Browse by Category */}
            {category && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Browse {category.name}
                </h3>
                <div className="space-y-2">
                  {category.subcategories?.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/help/category/${category.slug}/${sub.slug}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-background-tertiary transition-colors group"
                    >
                      <span className="text-text-secondary group-hover:text-text-primary transition-colors">
                        {sub.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-text-accent transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;