import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Shield, FileText, Users, AlertCircle, ChevronRight } from 'lucide-react';
import { getLegalDocument } from '../data/legalContent';
import type { LegalDocument } from '../data/legalContent';

const LegalPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [document, setDocument] = useState<LegalDocument | undefined>();
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (slug) {
      const doc = getLegalDocument(slug);
      setDocument(doc);
      if (doc && doc.sections.length > 0) {
        setActiveSection(doc.sections[0].id);
      }
    }
  }, [slug]);

  if (!slug || !document) {
    return <Navigate to="/help" replace />;
  }

  const getIcon = () => {
    switch (document.category) {
      case 'legal':
        return <FileText className="h-16 w-16" />;
      case 'safety':
        return <Shield className="h-16 w-16" />;
      case 'community':
        return <Users className="h-16 w-16" />;
      default:
        return <AlertCircle className="h-16 w-16" />;
    }
  };

  const getCategoryColor = () => {
    switch (document.category) {
      case 'legal':
        return 'text-seductive';
      case 'safety':
        return 'text-pink-500';
      case 'community':
        return 'text-lust-violet';
      default:
        return 'text-abyss-light-gray';
    }
  };

  const getCategoryBgColor = () => {
    switch (document.category) {
      case 'legal':
        return 'bg-seductive/10 border-seductive/20';
      case 'safety':
        return 'bg-pink-500/10 border-pink-500/20';
      case 'community':
        return 'bg-lust-violet/10 border-lust-violet/20';
      default:
        return 'bg-abyss-dark-900 border-void-500/30';
    }
  };

  return (
    <div className="bg-abyss-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`${getCategoryColor()} mx-auto mb-6`}>
            {getIcon()}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-serif">
            {document.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-abyss-light-gray mb-6">
            <span>Version {document.version}</span>
            <span>•</span>
            <span>Last Updated: {new Date(document.lastUpdated).toLocaleDateString()}</span>
          </div>
          <div className={`${getCategoryBgColor()} border rounded-lg p-4 max-w-2xl mx-auto`}>
            <p className="text-sm text-abyss-light-gray">
              Please read this document carefully. It contains important information about your rights and obligations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Contents</h2>
              <nav className="space-y-2">
                {document.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      window.document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-seductive/20 text-seductive border-l-2 border-seductive'
                        : 'text-abyss-light-gray hover:bg-abyss-dark-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{section.title}</span>
                      {activeSection === section.id && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {document.sections.map((section, index) => (
              <div
                key={section.id}
                id={section.id}
                className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4">
                  {section.title}
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-abyss-light-gray leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 bg-gradient-to-r from-seductive/10 to-lust-violet/10 border border-seductive/20 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Questions about this {document.category === 'legal' ? 'document' : 'policy'}?
            </h3>
            <p className="text-abyss-light-gray mb-6">
              If you have any questions or concerns, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/support/submit"
                className="bg-gradient-to-r from-lust-violet to-seductive text-white px-8 py-3 rounded-lg font-semibold hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] inline-block"
              >
                Contact Support
              </a>
              <a
                href="/help"
                className="border border-seductive text-seductive px-8 py-3 rounded-lg font-semibold hover:bg-seductive hover:text-white transition-all duration-300 inline-block"
              >
                Visit Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;