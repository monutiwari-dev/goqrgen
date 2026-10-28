import React, { useState, ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, QrCode, History, Scan, Layers, Home, Twitter, Linkedin, Mail, Sun, Moon, ArrowUp, Facebook } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/generator', label: 'Generator', icon: QrCode },
    { path: '/history', label: 'History', icon: History },
    { path: '/scanner', label: 'Scanner', icon: Scan },
    { path: '/bulk', label: 'Bulk', icon: Layers },
  ];

  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Contact', path: '/contact' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/goqrgen/', label: 'Facebook' },
    { icon: Twitter, href: 'https://x.com/goqrgen', label: 'Twitter (X)' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/monukumar/', label: 'LinkedIn' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing!');
    setEmail('');
  };

  const isActive = (path: string) => location.pathname === path;
  
  const navLinkClasses = (path: string) => clsx(
    'flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-300',
    {
      'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium': isActive(path),
      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': !isActive(path),
    }
  );

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <QrCode className="h-8 w-8 text-primary-600 dark:text-primary-400 transition-transform group-hover:scale-110" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  GOQRGen
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={navLinkClasses(item.path)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            </nav>

            <div className="flex items-center md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-4 space-y-1 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={navLinkClasses(item.path)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="w-full max-w-7xl mx-auto py-6 px-2 sm:px-6 lg:px-8">
        <div className="px-0 py-6 sm:px-0">
          {children}
        </div>
      </main>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}
        aria-label="Back to top"
        style={{ pointerEvents: showBackToTop ? 'auto' : 'none' }}
      >
        <ArrowUp className="h-6 w-6" />
      </button>

      <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="w-full max-w-7xl mx-auto py-12 px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <QrCode className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  GOQRGen
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Create beautiful, customizable QR codes for your business, events, or personal use.
                Advanced features and professional designs at your fingertips.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Stay Updated
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for the latest features and updates.
              </p>
              <form onSubmit={handleSubscribe} className="flex">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} GOQRGen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;