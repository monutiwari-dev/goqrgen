import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Facebook, Linkedin, Twitter } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <Helmet>
        <title>About GOQRGen | Leading QR Code Solution Provider</title>
        <meta name="description" content="Learn about GOQRGen's mission to provide the best QR code solutions. Discover our commitment to innovation, security, and user-friendly QR code generation tools." />
        <link rel="canonical" href="https://goqrgen.com/about" />
      </Helmet>

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        About GOQRGen
      </h1>

      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 dark:text-gray-100 mb-4">
            GOQRGen was founded with a simple yet powerful mission: to make QR code generation accessible, 
            professional, and efficient for everyone. We believe in the power of connecting the physical 
            and digital worlds through innovative technology.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            What Sets Us Apart
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-100 space-y-2">
            <li>Advanced customization options for professional-looking QR codes</li>
            <li>User-friendly interface designed for both beginners and experts</li>
            <li>Robust error correction and validation features</li>
            <li>Secure and reliable QR code generation</li>
            <li>Support for multiple QR code formats and content types</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Our Technology
          </h2>
          <p className="text-gray-700 dark:text-gray-100 mb-4">
            We use cutting-edge technology to ensure our QR codes are fast to generate, 
            reliable to scan, and maintain the highest quality standards. Our platform 
            is built with modern web technologies and follows international QR code standards.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Looking Forward
          </h2>
          <p className="text-gray-700 dark:text-gray-100">
            We're constantly working to improve our service and add new features based on user feedback. 
            Our goal is to remain at the forefront of QR code technology while maintaining the simplicity 
            and reliability our users expect.
          </p>
        </section>

        {/* Author Bio Box */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Meet the Founder
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src="/author.jpg"
                  alt="Monu Tiwari profile"
                  className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700"
                />
              </div>
              {/* Bio Content */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Monu Tiwari
                </h3>
                <p className="text-gray-700 dark:text-gray-100 mb-4 leading-relaxed">
                  Monu Tiwari is a seasoned Digital Marketing expert with over 5 years of experience in SEO, content strategy, and online branding. He is the founder of GOQRGen, a smart QR code generation platform helping businesses simplify digital connectivity. Monu is passionate about building tools and strategies that deliver real value and measurable results.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://www.facebook.com/goqrgen/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Facebook</span>
                  </a>
                  <a 
                    href="https://x.com/goqrgen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-black dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Twitter (X)</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/monukumar/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;