import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import Layout from './components/layout/Layout';
import React, { Suspense } from 'react';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const GeneratorPage = React.lazy(() => import('./pages/GeneratorPage'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const ScannerPage = React.lazy(() => import('./pages/ScannerPage'));
const BulkPage = React.lazy(() => import('./pages/BulkPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

function App() {
  const helmetContext = {};

  return (
    <HelmetProvider context={helmetContext}>
      <ThemeProvider>
        <HistoryProvider>
          <Router>
            <Layout>
              <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-xl">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/generator" element={<GeneratorPage />} />
                  <Route path="/generator/:type" element={<GeneratorPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/scanner" element={<ScannerPage />} />
                  <Route path="/bulk" element={<BulkPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </HistoryProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;