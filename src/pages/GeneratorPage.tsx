import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Square, Shapes, X, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { QRCodeData, QRCodeType, QRCodeCustomization } from '../types/qrTypes';
import { useHistory } from '../contexts/HistoryContext';
import QRCodeCustomizer from '../components/generator/QRCodeCustomizer';
import QRCodeStylingWrapper from '../components/generator/QRCodeStylingWrapper';
import QRCodeContentEditor from '../components/generator/QRCodeContentEditor';
import { validateQR, QRType } from "../utils/qrValidation";
import { useNavigate, useLocation } from 'react-router-dom';

const frameOptions = [
  { id: 'none', label: 'None', icon: X },
  { id: 'frame1', label: 'Frame 1', icon: Square },
  { id: 'frame2', label: 'Frame 2', icon: Shapes },
  { id: 'frame3', label: 'Frame 3', icon: Square },
  { id: 'frame4', label: 'Frame 4', icon: Shapes },
  { id: 'frame5', label: 'Frame 5', icon: Square },
  { id: 'frame6', label: 'Frame 6', icon: Shapes },
];

const designTabs = [
  { id: 'frame', label: 'Frame' },
  { id: 'logo', label: 'Logo' },
];

// Map QRCodeType to QRType for validation
function mapToQRType(type: QRCodeType): QRType {
  if (type === 'geolocation') return 'location';
  if (type === 'images') return 'image';
  return type as QRType;
}

const GeneratorPage: React.FC = () => {
  const [qrType, setQrType] = useState<QRCodeType>('url');
  const [qrValue, setQrValue] = useState('');
  const [qrName, setQrName] = useState('My QR Code');
  const [customization, setCustomization] = useState<QRCodeCustomization>({
    fgColor: '#6366F1',
    bgColor: '#FFFFFF',
    size: 256,
    includeMargin: true,
    level: 'M',
    cornerRadius: 0,
    style: 'squares',
  });
  const [activeDesignTab, setActiveDesignTab] = useState<'frame' | 'logo'>('frame');
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [showRequiredError, setShowRequiredError] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { addToHistory } = useHistory();
  const [showDropdown, setShowDropdown] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    {
      q: 'Is this QR code generator free?',
      a: 'Yes! All features are 100% free, with no hidden costs or watermarks.'
    },
    {
      q: 'Are my files and data safe?',
      a: 'Absolutely. Files are only used to generate your QR code and are never shared or tracked.'
    },
    {
      q: 'What is the maximum file size I can upload?',
      a: 'You can upload files up to 20MB, including images, PDFs, and videos.'
    },
    {
      q: 'Can I customize the look of my QR code?',
      a: 'Yes! You can change colors, add frames, logos, and more.'
    },
    {
      q: 'Do QR codes expire?',
      a: 'No, your QR codes do not expire and can be scanned unlimited times.'
    },
    {
      q: 'Can I use these QR codes for commercial purposes?',
      a: 'Yes, you can use them for business, marketing, education, and more.'
    }
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const mainToolRef = useRef<HTMLDivElement>(null);
  const [autoDetected, setAutoDetected] = useState<null | QRCodeType>(null);
  const [userSelectedType, setUserSelectedType] = useState(false);

  useEffect(() => {
    const typeToDefaultName: Record<QRCodeType, string> = {
      url: 'Website QR Code',
      text: 'Text QR Code',
      email: 'Email QR Code',
      phone: 'Phone QR Code',
      sms: 'SMS QR Code',
      wifi: 'WiFi QR Code',
      vcard: 'Contact QR Code',
      event: 'Event QR Code',
      geolocation: 'Location QR Code',
      pdf: 'PDF QR Code',
      app: 'App QR Code',
      images: 'Image QR Code',
      video: 'Video QR Code',
      social: 'Social Media QR Code',
      maps: 'Google Maps QR Code',
      menu: 'Restaurant Menu QR Code',
      snapseed: 'Snapseed Looks QR Code',
    };
    setQrName(typeToDefaultName[qrType] || 'My QR Code');
  }, [qrType]);

  // On mount, set QR type from slug if present
  useEffect(() => {
    const match = location.pathname.match(/\/generator\/(\w+)/);
    if (match) {
      const slug = match[1];
      // Only set if valid QR type
      const validTypes = [
        'url','text','email','phone','sms','wifi','vcard','event','geolocation','pdf','app','images','video','social','maps','menu','snapseed','whatsapp'
      ];
      if (validTypes.includes(slug)) setQrType(slug as QRCodeType);
    }
  }, [location.pathname]);

  // Auto-detect content type
  useEffect(() => {
    if (userSelectedType) return;
    if (!qrValue) return;
    // Only auto-detect for these types
    if (!["url", "text", "email", "phone"].includes(qrType)) return;
    let detected: QRCodeType | null = null;
    if (/^https?:\/\//i.test(qrValue)) detected = "url";
    else if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(qrValue)) detected = "email";
    else if (/^\+?\d{7,}$/.test(qrValue.replace(/\s+/g, ""))) detected = "phone";
    else detected = "text";
    if (detected && detected !== qrType) {
      setQrType(detected);
      setAutoDetected(detected);
    }
  }, [qrValue, qrType, userSelectedType]);

  // When user manually selects a type, stop auto-detecting
  const handleTypeTabClick = (type: QRCodeType) => {
    setQrType(type);
    setUserSelectedType(true);
    navigate(`/generator/${type}`);
  };

  const isRequiredFieldEmpty = qrType === 'url' ? !qrValue.trim() : !qrValue.trim();

  const handleDownload = async (format: 'png' | 'jpeg' | 'svg') => {
    if (!qrRef.current || isRequiredFieldEmpty) {
      setShowRequiredError(true);
      return;
    }
    try {
      let dataUrl;
      const fileName = `${qrName.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      // Dynamically import only when needed
      const { saveAs } = await import('file-saver');
      const htmlToImage = await import('html-to-image');
      switch (format) {
        case 'png':
          dataUrl = await htmlToImage.toPng(qrRef.current);
          saveAs(dataUrl, fileName);
          break;
        case 'jpeg':
          dataUrl = await htmlToImage.toJpeg(qrRef.current);
          saveAs(dataUrl, fileName);
          break;
        case 'svg':
          dataUrl = await htmlToImage.toSvg(qrRef.current);
          saveAs(dataUrl, fileName);
          break;
      }
      const qrData: QRCodeData = {
        id: Date.now().toString(),
        type: qrType,
        value: qrValue,
        name: qrName,
        created: new Date().toISOString(),
        customization,
        preview: dataUrl,
      };
      addToHistory(qrData);
    } catch (error) {
      alert('Failed to download. Please try again or use a smaller file.');
    }
  };

  // --- UI ---
  return (
    <div className="animate-fadeIn">
      <Helmet>
        <title>QR Code Generator | Create QR Codes for Free</title>
        <meta name="description" content="Generate custom QR codes for URLs, text, Wi-Fi, vCards, and more with GOQRGen's free QR Code Generator. Fast, easy, and no signup required!" />
        <link rel="canonical" href="https://goqrgen.com/generator" />
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          QR Code Generator
        </h1>
        {/* (Optional: Add Import/Export/History/Help buttons here if needed) */}
      </div>
      {/* Main QR Tool UI */}
      <div ref={mainToolRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
            {/* Step 1: Content */}
            <div className="flex items-center mb-3 sm:mb-4">
              <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold mr-2 sm:mr-3 text-base sm:text-lg">1</span>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Complete the content</h2>
            </div>
            {/* QR Type Tabs */}
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {[
                  { type: 'url', label: 'Link' },
                  { type: 'text', label: 'Text' },
                  { type: 'email', label: 'E-mail' },
                  { type: 'phone', label: 'Call' },
                  { type: 'sms', label: 'SMS' },
                  { type: 'vcard', label: 'V-card' },
                  { type: 'wifi', label: 'WI-FI' },
                  { type: 'pdf', label: 'PDF' },
                  { type: 'app', label: 'App' },
                  { type: 'images', label: 'Images' },
                  { type: 'video', label: 'Video' },
                  { type: 'social', label: 'Social Media' },
                  { type: 'event', label: 'Event' },
                  { type: 'maps', label: 'Google Maps' },
                  { type: 'menu', label: 'Menu' },
                  { type: 'snapseed', label: 'Snapseed' },
                ].map(({ type, label }) => (
                  <button
                    key={type}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium border transition-colors ${qrType === type ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    onClick={() => handleTypeTabClick(type as QRCodeType)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Content Input */}
            <div className="mb-6 sm:mb-8">
              <QRCodeContentEditor
                type={qrType}
                value={qrValue}
                onChange={(v: string) => {
                  setQrValue(v);
                  setShowRequiredError(false);
                  setValidationError(validateQR(mapToQRType(qrType), v));
                }}
              />
              {validationError && (
                <div className="text-red-600 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  {validationError}
                </div>
              )}
              {isRequiredFieldEmpty && showRequiredError && (
                <p className="text-red-500 text-sm mt-1">This field is required.</p>
              )}
              {/* Warning for large data URLs */}
              {(qrType === 'pdf' || qrType === 'images' || qrType === 'video') && qrValue.startsWith('data:') && qrValue.length > 50000 && (
                <div className="text-yellow-600 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Large file detected ({(qrValue.length / 1024).toFixed(1)}KB). QR code may be complex and harder to scan. Consider using a smaller file or URL.
                </div>
              )}
              {autoDetected && (
                <div className="text-xs text-blue-500 mt-1 mb-2">Auto-detected content type: <b>{autoDetected.charAt(0).toUpperCase() + autoDetected.slice(1)}</b></div>
              )}
            </div>
            {/* Step 2: Design */}
            <div className="flex items-center mb-3 sm:mb-4 mt-6 sm:mt-8">
              <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold mr-2 sm:mr-3 text-base sm:text-lg">2</span>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Customize your QR code</h2>
            </div>
            {/* Design Tabs */}
            <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b dark:border-gray-700 text-sm sm:text-base">
              {designTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium border-b-2 transition-colors ${activeDesignTab === tab.id ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                  onClick={() => setActiveDesignTab(tab.id as 'frame' | 'logo')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Design Tab Content */}
            {activeDesignTab === 'frame' && (
              <div>
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                  {frameOptions.map(option => (
                    <button
                      key={option.id}
                      className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border min-w-[60px] sm:min-w-[70px] ${selectedFrame === option.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      onClick={() => setSelectedFrame(option.id)}
                    >
                      <option.icon className="w-7 h-7 mb-1" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Select a frame for your QR code (visual only, not functional yet).</p>
              </div>
            )}
            {activeDesignTab === 'logo' && (
              <div>
                <QRCodeCustomizer customization={customization} onChange={setCustomization} />
                {/* Optionally, you can show only the logo upload part here */}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-6 mt-4 lg:mt-0">
            <div className="mb-3 sm:mb-4 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100 tracking-tight">Live QR Preview</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your QR code updates instantly as you type or customize.</p>
            </div>
            {qrType === 'snapseed' ? (
              <div className="flex flex-col items-center justify-center">
                {qrValue ? (
                  <>
                    <img src={qrValue} alt="Snapseed QR Preview" width="256" height="256" style={{ maxWidth: 256, maxHeight: 256, borderRadius: 8, border: '1px solid #ccc' }} />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-center">Scan this image in the <b>Snapseed</b> app to apply the look.</p>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center">Upload a Snapseed QR code image to preview it here.</p>
                )}
              </div>
            ) : (
              <div ref={qrRef} className="mx-auto p-3 sm:p-6 rounded-lg bg-white flex items-center justify-center border border-gray-200 dark:border-gray-700 mb-3 sm:mb-4 max-w-full w-full overflow-x-auto">
                <QRCodeStylingWrapper
                  value={qrValue || ' '}
                  size={customization.size}
                  fgColor={customization.fgColor}
                  bgColor={customization.bgColor}
                  level={customization.level}
                  includeMargin={customization.includeMargin}
                  style={customization.style}
                  cornerRadius={customization.cornerRadius}
                  logoImage={customization.logoImage}
                  logoSize={customization.logoSize}
                  frame={selectedFrame}
                  ref={qrRef}
                />
              </div>
            )}
            {isRequiredFieldEmpty && showRequiredError && (
              <p className="text-red-500 text-sm mb-2">Please fill the required fields.</p>
            )}
            {/* Download Dropdown */}
            <div className="relative w-full">
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-3 sm:mt-4 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                onClick={() => setShowDropdown((prev) => !prev)}
                type="button"
                disabled={isRequiredFieldEmpty || !!validationError}
              >
                <Download className="w-5 h-5" />
                Download QR Code
              </button>
              {/* Dropdown menu */}
              {showDropdown && !isRequiredFieldEmpty && !validationError && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {['png', 'jpeg', 'svg'].map((format) => (
                    <button
                      key={format}
                      onClick={() => { setShowDropdown(false); handleDownload(format as 'png' | 'jpeg' | 'svg'); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* --- Info Sections: Full Width Below Main Grid --- */}
      <section className="w-full max-w-full mt-10 flex flex-col gap-6">
        {/* About This Tool */}
        <div className="bg-gradient-to-r from-green-100 via-green-50 to-white dark:from-green-900 dark:via-green-800 dark:to-gray-900 border border-green-200 dark:border-green-700 rounded-2xl p-4 sm:p-6 flex items-center gap-4 shadow-lg w-full">
          <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-green-200 dark:bg-green-700">
            <svg className="w-8 h-8 text-green-700 dark:text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          </div>
          <div>
            <div className="font-bold text-green-900 dark:text-green-100 text-xl mb-1">Free QR Code Generator</div>
            <div className="text-green-800 dark:text-green-200 text-base">Create, customize, and download QR codes for websites, files, social media, locations, menus, and more. <span className='font-semibold'>No signup required.</span> Fast, secure, and free!</div>
          </div>
        </div>
        {/* Supported QR Code Types - Card Grid */}
        <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 shadow-lg">
          <div className="font-bold text-blue-900 dark:text-blue-100 text-xl mb-6 flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx='12' cy='12' r='10' strokeWidth='2'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01' /></svg>
            Supported QR Code Types
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full">
            {/* Card for each QR type */}
            {[
              { type: 'url', label: 'Link', icon: <svg className="w-8 h-8 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 010 5.656l-3.535 3.535a4 4 0 01-5.657-5.657l1.414-1.414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.172 13.828a4 4 0 010-5.656l3.535-3.535a4 4 0 015.657 5.657l-1.414 1.414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Link to any Website URL' },
              { type: 'email', label: 'E-mail', icon: <svg className="w-8 h-8 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Send an email' },
              { type: 'text', label: 'Text', icon: <svg className="w-8 h-8 text-orange-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Share Text' },
              { type: 'phone', label: 'Call', icon: <svg className="w-8 h-8 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 01-2.18 2A19.72 19.72 0 013 5.18 2 2 0 015 3h2.09a2 2 0 012 1.72c.13.81.36 1.6.68 2.34a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0121 16.91z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Make a call' },
              { type: 'sms', label: 'SMS', icon: <svg className="w-8 h-8 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Send message' },
              { type: 'whatsapp', label: 'WhatsApp', icon: <svg className="w-8 h-8 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16.72 11.06a6.5 6.5 0 10-11.44 6.09L3 21l3.95-1.29a6.5 6.5 0 009.77-8.65z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.29 13.29a4.5 4.5 0 006.36 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Send WhatsApp message' },
              { type: 'wifi', label: 'WiFi', icon: <svg className="w-8 h-8 text-blue-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13a10 10 0 0114 0M8.53 16.11a6 6 0 016.94 0M12 20h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Connect to WiFi' },
              { type: 'vcard', label: 'vCard', icon: <svg className="w-8 h-8 text-orange-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Share contact info' },
              { type: 'event', label: 'Event', icon: <svg className="w-8 h-8 text-pink-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Add calendar event' },
              { type: 'geolocation', label: 'Location', icon: <svg className="w-8 h-8 text-teal-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Share a location' },
              { type: 'pdf', label: 'PDF', icon: <svg className="w-8 h-8 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 2v4M16 2v4M4 10h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Upload and share PDF' },
              { type: 'app', label: 'App', icon: <svg className="w-8 h-8 text-indigo-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Link to an app' },
              { type: 'images', label: 'Images', icon: <svg className="w-8 h-8 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Upload and share images' },
              { type: 'video', label: 'Video', icon: <svg className="w-8 h-8 text-pink-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polygon points="10 8 16 12 10 16 10 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Upload and share video' },
              { type: 'social', label: 'Social', icon: <svg className="w-8 h-8 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="10" r="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="16" cy="10" r="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 16c1.333-1.333 4.667-1.333 6 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Share social profile' },
              { type: 'maps', label: 'Google Maps', icon: <svg className="w-8 h-8 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A2 2 0 013 15.382V5a2 2 0 012-2h14a2 2 0 012 2v10.382a2 2 0 01-1.553 1.894L15 20V7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Share Google Maps location' },
              { type: 'menu', label: 'Menu', icon: <svg className="w-8 h-8 text-yellow-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 8h10M7 12h10M7 16h10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Restaurant digital menu' },
              { type: 'snapseed', label: 'Snapseed', icon: <svg className="w-8 h-8 text-green-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, desc: 'Upload Snapseed QR image' },
            ].map(({ type, label, icon, desc }) => (
              <button
                key={type}
                type="button"
                role="button"
                tabIndex={0}
                aria-label={`Select ${label} QR type`}
                onClick={() => {
                  setQrType(type as QRCodeType);
                  navigate(`/generator/${type}`);
                  setTimeout(() => {
                    mainToolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 0);
                }}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow p-4 sm:p-6 md:p-8 flex flex-col items-center text-center transition hover:shadow-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${qrType === type ? 'ring-2 ring-blue-400' : ''}`}
              >
                {icon}
                <div className="mt-3 mb-1 text-lg font-semibold text-gray-900 dark:text-white">{label}</div>
                <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">{desc}</div>
              </button>
            ))}
          </div>
        </div>
        {/* How to Use - Stylish Stepper */}
        <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-white dark:from-yellow-900 dark:via-yellow-800 dark:to-gray-900 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 shadow-lg">
          <div className="font-bold text-yellow-900 dark:text-yellow-100 text-xl mb-3 flex items-center gap-2">
            <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            How to Use
          </div>
          <ol className="list-decimal pl-6 text-yellow-900 dark:text-yellow-100 text-base space-y-1">
            <li><b>Select</b> a QR code type above.</li>
            <li><b>Enter</b> your content or <b>upload</b> a file.</li>
            <li><b>Customize</b> the design and style.</li>
            <li><b>Download</b> your QR code instantly.</li>
            <li className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">For Snapseed, upload a QR code image from the Snapseed app. For large files, use the provided upload link.</li>
          </ol>
        </div>
      </section>
      {/* --- Additional SEO & Information Sections --- */}
      <section className="w-full max-w-full mt-10 flex flex-col gap-10">
        {/* Benefits Section */}
        <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-700 rounded-2xl p-4 sm:p-8 shadow-lg py-10 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100 mb-10">Benefits of Using Our QR Code Generator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-3xl mb-2">⚡</span>
              <h3 className="font-semibold text-lg mb-1">Instant Generation</h3>
              <p className="text-gray-700 dark:text-gray-200">Create QR codes in seconds with real-time preview and download.</p>
            </div>
            <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-3xl mb-2">🔒</span>
              <h3 className="font-semibold text-lg mb-1">Privacy First</h3>
              <p className="text-gray-700 dark:text-gray-200">No sign-up required. Your data and files are never shared or tracked.</p>
            </div>
            <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-3xl mb-2">🎨</span>
              <h3 className="font-semibold text-lg mb-1">Fully Customizable</h3>
              <p className="text-gray-700 dark:text-gray-200">Personalize colors, frames, logos, and more for your brand or project.</p>
            </div>
            <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-3xl mb-2">📱</span>
              <h3 className="font-semibold text-lg mb-1">Mobile Friendly</h3>
              <p className="text-gray-700 dark:text-gray-200">Works perfectly on all devices—generate and scan on the go.</p>
            </div>
            <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-3xl mb-2">💾</span>
              <h3 className="font-semibold text-lg mb-1">Multiple Formats</h3>
              <p className="text-gray-700 dark:text-gray-200">Download as PNG, JPEG, or SVG for any use case.</p>
            </div>
            <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-3xl mb-2">🌍</span>
              <h3 className="font-semibold text-lg mb-1">No Limits</h3>
              <p className="text-gray-700 dark:text-gray-200">Unlimited scans, unlimited codes, always free.</p>
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div className="w-full bg-transparent py-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mb-10 text-center">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full">
            {/* Card 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2"/><path d="M8 9h8M8 13h6" strokeWidth="2"/></svg>
              </div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">Multiple QR Types</div>
              <div className="text-gray-600 dark:text-gray-300">Supports URL, text, email, phone, WiFi, vCard, PDF, images, video, and more.</div>
            </div>
            {/* Card 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 20h9" strokeWidth="2"/><circle cx="6" cy="6" r="3" strokeWidth="2"/><circle cx="6" cy="18" r="3" strokeWidth="2"/><path d="M6 9v6" strokeWidth="2"/></svg>
              </div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">Large File Uploads</div>
              <div className="text-gray-600 dark:text-gray-300">Upload images, PDFs, and videos up to 20MB for instant QR linking.</div>
            </div>
            {/* Card 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M12 8v4l3 3" strokeWidth="2"/></svg>
              </div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">Custom Design</div>
              <div className="text-gray-600 dark:text-gray-300">Personalize colors, frames, corners, and logos for your brand or project.</div>
            </div>
            {/* Card 4 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2"/></svg>
              </div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">Instant Download</div>
              <div className="text-gray-600 dark:text-gray-300">Download QR codes as PNG, JPEG, or SVG in high resolution.</div>
            </div>
            {/* Card 5 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 20h.01" strokeWidth="2"/><path d="M5 13a10 10 0 0114 0" strokeWidth="2"/><path d="M8.53 16.11a6 6 0 016.94 0" strokeWidth="2"/></svg>
              </div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">Mobile Friendly</div>
              <div className="text-gray-600 dark:text-gray-300">Works perfectly on all devices—generate and scan on the go.</div>
            </div>
            {/* Card 6 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" strokeWidth="2"/></svg>
              </div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">No Watermarks</div>
              <div className="text-gray-600 dark:text-gray-300">All QR codes are clean, ad-free, and watermark-free for professional use.</div>
            </div>
            {/* Card 7 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 17l4-4-4-4m8 8l-4-4 4-4" strokeWidth="2"/></svg>
              </div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">Unlimited Use</div>
              <div className="text-gray-600 dark:text-gray-300">Generate and scan unlimited QR codes—no limits, always free.</div>
            </div>
            {/* Card 8 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 mb-5">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/><path d="M7 8h10M7 12h10M7 16h10" strokeWidth="2"/></svg>
              </div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-1">History Tracking</div>
              <div className="text-gray-600 dark:text-gray-300">Access your generated QR codes anytime with local history tracking.</div>
            </div>
          </div>
        </div>
        {/* Use Cases Section */}
        <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-700 rounded-2xl p-8 shadow-lg py-10">
          <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-10">Popular Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-purple-50 dark:bg-purple-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-2xl mb-2">🏪</span>
              <h3 className="font-semibold text-lg mb-1">Business & Marketing</h3>
              <p className="text-gray-700 dark:text-gray-200">Share websites, promotions, or contact info on flyers, posters, and business cards.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-2xl mb-2">🍽️</span>
              <h3 className="font-semibold text-lg mb-1">Restaurants & Cafes</h3>
              <p className="text-gray-700 dark:text-gray-200">Create digital menus, WiFi access, or feedback forms for your guests.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-2xl mb-2">🎓</span>
              <h3 className="font-semibold text-lg mb-1">Education</h3>
              <p className="text-gray-700 dark:text-gray-200">Share resources, assignments, or event details with students and parents.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-2xl mb-2">🏠</span>
              <h3 className="font-semibold text-lg mb-1">Home & Personal</h3>
              <p className="text-gray-700 dark:text-gray-200">Connect smart devices, share WiFi, or store emergency contacts.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-2xl mb-2">🎤</span>
              <h3 className="font-semibold text-lg mb-1">Events & Conferences</h3>
              <p className="text-gray-700 dark:text-gray-200">Distribute schedules, tickets, or speaker info with a scan.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-800 rounded-xl p-6 flex flex-col items-start shadow">
              <span className="text-2xl mb-2">🛡️</span>
              <h3 className="font-semibold text-lg mb-1">Security & Access</h3>
              <p className="text-gray-700 dark:text-gray-200">Generate secure codes for WiFi, doors, or private files.</p>
            </div>
          </div>
        </div>
        {/* Security & Privacy Section */}
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-700 rounded-2xl p-8 shadow-lg py-10">
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-10">Security & Privacy</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 space-y-2">
            <li>No personal data is stored or sold. All QR code generation is processed instantly and securely.</li>
            <li>Uploaded files are stored only for QR code access and are not indexed or shared.</li>
            <li>HTTPS encryption for all uploads and downloads.</li>
            <li>No tracking, analytics, or third-party cookies.</li>
          </ul>
        </div>
        {/* FAQs Section */}
        <div className="w-full py-10">
          <div className="rounded-2xl p-4 sm:p-8 mb-6 bg-white shadow-xl border border-gray-200">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-200">
                <HelpCircle className="w-7 h-7 text-black" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="flex flex-col gap-4 w-full">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl transition-all duration-200 bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow flex flex-col ${openFaq === idx ? 'ring-2 ring-gray-300/60' : ''}`}
                >
                  <button
                    className="flex items-center justify-between w-full px-5 py-4 text-left focus:outline-none"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span className="font-semibold text-lg text-black drop-shadow-sm">{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-6 h-6 text-gray-700" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 px-5 ${openFaq === idx ? 'max-h-40 py-2' : 'max-h-0 py-0'}`}
                    style={{ color: 'black' }}
                  >
                    <p className="text-base leading-relaxed text-black">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-purple-100 via-blue-50 to-white dark:from-purple-900 dark:via-blue-900 dark:to-gray-900 border border-purple-200 dark:border-purple-700 rounded-2xl p-8 shadow-lg text-center py-10">
          <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-10">Ready to Create Your QR Code?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">Start generating, customizing, and sharing QR codes instantly no signup, no limits, always free.</p>
          <a href="#" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">Get Started Now</a>
        </div>
      </section>
    </div>
  );
};

export default GeneratorPage;