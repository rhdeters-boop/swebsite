import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Twitter, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-abyss-black border-t border-void-500/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="font-serif tracking-wider text-white">
                <span className="text-2xl font-bold">VOID</span>
                <span className="text-lg text-gray-400 mx-1">of</span>
                <span className="text-2xl font-bold">DESIRE</span>
              </div>
            </div>
            <p className="text-abyss-light-gray text-sm mb-4">
              Premium content platform connecting creators and fans in the void of desire.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-abyss-light-gray hover:text-seductive transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-abyss-light-gray hover:text-seductive transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-abyss-light-gray hover:text-seductive transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link 
                  to="/become-creator" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Become a Creator
                </Link>
              </li>
              <li>
                <Link 
                  to="/creators" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Browse Creators
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                >
                  DMCA
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-void-500/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-abyss-light-gray text-sm mb-4 md:mb-0">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-seductive mx-1" />
              <span>in the Void</span>
            </div>
            <div className="text-abyss-light-gray text-sm">
              © 2025 Void of Desire. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
