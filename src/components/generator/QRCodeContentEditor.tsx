import React, { useRef } from 'react';
import { QRCodeType } from '../../types/qrTypes';
import axios from 'axios';

interface QRCodeContentEditorProps {
  type: QRCodeType;
  value: string;
  onChange: (value: string) => void;
}

const socialPlatforms = [
  { id: 'facebook', label: 'Facebook', url: 'https://facebook.com/' },
  { id: 'instagram', label: 'Instagram', url: 'https://instagram.com/' },
  { id: 'twitter', label: 'Twitter', url: 'https://twitter.com/' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/' },
  { id: 'youtube', label: 'YouTube', url: 'https://youtube.com/' },
];

const QRCodeContentEditor: React.FC<QRCodeContentEditorProps> = ({ type, value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPlatform, setSelectedPlatform] = React.useState(socialPlatforms[0].id);
  const [username, setUsername] = React.useState('');
  const [uploadedFileName, setUploadedFileName] = React.useState<string>('');
  const [useUrlInput, setUseUrlInput] = React.useState<boolean>(false);
  const [uploadError, setUploadError] = React.useState<string>('');
  const [isCompressing, setIsCompressing] = React.useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = React.useState<string>('');
  const [previewDataUrlSize, setPreviewDataUrlSize] = React.useState<number>(0);
  const [snapseedImage, setSnapseedImage] = React.useState<string | null>(null);
  const QR_DATA_LIMIT = 3500;

  const getPlaceholder = () => {
    switch (type) {
      case 'url':
        return 'https://example.com';
      case 'email':
        return 'email@example.com';
      case 'phone':
        return '+1234567890';
      case 'sms':
        return '+1234567890';
      case 'wifi':
        return 'SSID:MyWiFi\nPassword:MyPassword\nEncryption:WPA';
      case 'vcard':
        return 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD';
      case 'event':
        return 'Event details...';
      case 'geolocation':
        return 'Latitude: 0.000000\nLongitude: 0.000000';
      case 'pdf':
        return 'Upload a PDF file';
      case 'app':
        return 'https://apps.apple.com/app/id123456789 or https://play.google.com/store/apps/details?id=com.example';
      case 'images':
        return 'Upload an image file';
      case 'video':
        return 'Upload a video file';
      case 'social':
        return 'Enter your username or profile link';
      case 'menu':
        return 'https://yourrestaurant.com/menu.pdf or menu image/page URL';
      case 'maps':
        return 'Enter latitude,longitude or Google Maps URL';
      case 'snapseed':
        return 'Upload a Snapseed Looks QR code image';
      default:
        return 'Enter your content here...';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'url':
        return 'Website URL';
      case 'email':
        return 'Email Address';
      case 'phone':
        return 'Phone Number';
      case 'sms':
        return 'SMS Number and Message';
      case 'wifi':
        return 'WiFi Network Details';
      case 'vcard':
        return 'Contact Information';
      case 'event':
        return 'Event Details';
      case 'geolocation':
        return 'Location Coordinates';
      case 'pdf':
        return 'PDF File';
      case 'app':
        return 'App Store or Play Store Link';
      case 'images':
        return 'Image File';
      case 'video':
        return 'Video File';
      case 'social':
        return 'Social Media Profile';
      case 'menu':
        return 'Menu URL (PDF, image, or webpage)';
      case 'maps':
        return 'Google Maps Location or URL';
      case 'snapseed':
        return 'Snapseed Looks QR Code Image';
      default:
        return 'Content';
    }
  };

  // Helper function to compress images aggressively in a loop
  const compressImageToFitQR = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        let quality = 0.5;
        let maxSize = 300;
        const minSize = 50;
        const minQuality = 0.1;
        let dataUrl = '';
        let fits = false;
        for (let i = 0; i < 10; i++) {
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = Math.max(Math.round(width), minSize);
          canvas.height = Math.max(Math.round(height), minSize);
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          if (dataUrl.length <= QR_DATA_LIMIT) {
            fits = true;
            break;
          }
          maxSize = Math.max(minSize, Math.round(maxSize * 0.7));
          quality = Math.max(minQuality, quality * 0.7);
        }
        setPreviewDataUrl(dataUrl);
        setPreviewDataUrlSize(dataUrl.length);
        if (fits) {
          resolve(dataUrl);
        } else {
          resolve(null);
        }
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setPreviewDataUrl(dataUrl);
        setPreviewDataUrlSize(dataUrl.length);
        if (dataUrl.length > QR_DATA_LIMIT) {
          let reason = '';
          if (file.size <= 2048) {
            reason = ' (Note: Even small files can become large when encoded as a data URL due to base64 and prefix overhead.)';
          }
          setUploadError(`❌ The encoded data is too large for a QR code.\nFile size: ${file.size} bytes. Data URL size: ${dataUrl.length} chars. Limit: ${QR_DATA_LIMIT}.${reason}`);
          setUploadedFileName('');
          setIsCompressing(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
        setUploadError('');
        setIsCompressing(false);
        onChange(dataUrl);
      }
    };
    reader.onerror = (error) => {
      setIsCompressing(false);
      console.error('FileReader error:', error);
      alert('Error reading file. Please try again.');
      setUploadedFileName('');
    };
    reader.readAsDataURL(file);
  };

  // Handle file upload for PDF, Images, Video
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      setUploadError('');
      setUploadedFileName(file.name);
      // Accept up to 20MB for all types
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        setUploadError('❌ File size must be less than 20MB.');
        setUploadedFileName('');
        setIsCompressing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      // Upload to backend for pdf, images, video
      if (['pdf', 'images', 'video'].includes(type)) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await axios.post('/upload.php', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (response.data && response.data.url) {
            setUploadError('');
            setIsCompressing(false);
            onChange(response.data.url);
          } else {
            setUploadError('❌ Upload failed.');
            setUploadedFileName('');
            setIsCompressing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        } catch (error: unknown) {
          setUploadError('❌ Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
          setUploadedFileName('');
          setIsCompressing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
        return;
      }
      // For images, compress aggressively in a loop
      if (type === 'images' && file.type.startsWith('image/')) {
        compressImageToFitQR(file)
          .then(compressedDataUrl => {
            if (!compressedDataUrl) {
              setUploadError('❌ Even after aggressive compression, the image is too large for a QR code. Try a smaller image or use the URL option.');
              setUploadedFileName('');
              setIsCompressing(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
              return;
            }
            setUploadError('');
            setIsCompressing(false);
            onChange(compressedDataUrl);
          })
          .catch(() => {
            setIsCompressing(false);
            setUploadError('❌ Image compression failed. Please try another image.');
            setUploadedFileName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
          });
      } else if (type === 'pdf' && file.type === 'application/pdf') {
        // For PDFs, just try to read as data URL
        readFileAsDataURL(file);
      } else if (type === 'video' && file.type.startsWith('video/')) {
        // For videos, just try to read as data URL
        readFileAsDataURL(file);
      } else {
        setIsCompressing(false);
        setUploadError('❌ Unsupported file type.');
        setUploadedFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  // Clear uploaded file when type changes
  React.useEffect(() => {
    if (!(type === 'pdf' || type === 'images' || type === 'video')) {
      setUploadedFileName('');
      setUseUrlInput(false);
    }
  }, [type]);

  // Handle social media
  React.useEffect(() => {
    if (type === 'social') {
      const platform = socialPlatforms.find((p) => p.id === selectedPlatform);
      if (platform && username) {
        onChange(platform.url + username);
      }
    }
    // eslint-disable-next-line
  }, [selectedPlatform, username, type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label htmlFor="qr-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {getLabel()}
        </label>
        {/* PDF, Images, Video: File upload */}
        {(type === 'pdf' || type === 'images' || type === 'video') ? (
          <div className="space-y-2">
            {/* Toggle between file upload and URL input */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setUseUrlInput(false);
                  if (value && !value.startsWith('data:')) {
                    onChange('');
                  }
                  setUploadError('');
                }}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  !useUrlInput 
                    ? 'bg-purple-100 border-purple-500 text-purple-700' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseUrlInput(true);
                  if (value && value.startsWith('data:')) {
                    onChange('');
                    setUploadedFileName('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }
                  setUploadError('');
                }}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  useUrlInput 
                    ? 'bg-purple-100 border-purple-500 text-purple-700' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                Use URL
              </button>
            </div>
            
            {!useUrlInput ? (
              <>
                <input
                  type="file"
                  accept={type === 'pdf' ? 'application/pdf' : type === 'images' ? 'image/*' : 'video/*'}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                {isCompressing && (
                  <div className="text-blue-600 text-xs mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" fill="none" />
                      <path d="M4 12a8 8 0 018-8" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    Compressing file, please wait...
                  </div>
                )}
                {previewDataUrl && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview (compressed):</div>
                    {type === 'images' && (
                      <img src={previewDataUrl} alt="Preview" width="120" height="120" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 4, border: '1px solid #ccc' }} />
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      File size: {uploadedFileName ? `${previewDataUrlSize} chars (data URL)` : 'N/A'} / QR code limit: {QR_DATA_LIMIT}
                    </div>
                  </div>
                )}
                {uploadedFileName && !isCompressing && !uploadError && (
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <span className="text-sm text-green-700 dark:text-green-300 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {uploadedFileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName('');
                        setPreviewDataUrl('');
                        setPreviewDataUrlSize(0);
                        onChange('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                        setUploadError('');
                      }}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {uploadError && (
                  <div className="text-red-600 text-xs mt-1 flex items-center whitespace-pre-line">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {uploadError}
                  </div>
                )}
              </>
            ) : (
              <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder={`Enter ${type.toUpperCase()} URL (e.g., https://example.com/file.${type === 'pdf' ? 'pdf' : type === 'images' ? 'jpg' : 'mp4'})`}
              />
            )}
          </div>
        ) : type === 'social' ? (
          <div className="flex gap-2">
            <select
              value={selectedPlatform}
              onChange={e => setSelectedPlatform(e.target.value)}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
            >
              {socialPlatforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="Username or profile ID"
            />
          </div>
        ) : type === 'menu' ? (
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            placeholder={getPlaceholder()}
          />
        ) : type === 'maps' ? (
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            placeholder={getPlaceholder()}
          />
        ) : type === 'snapseed' ? (
          <>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (typeof event.target?.result === 'string') {
                      setSnapseedImage(event.target.result);
                      onChange(event.target.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
            {snapseedImage && (
              <div className="mt-2 flex flex-col items-center">
                <img src={snapseedImage} alt="Snapseed QR Preview" width="200" height="200" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, border: '1px solid #ccc' }} />
                <a href={snapseedImage} download="snapseed-qr.png" className="mt-2 text-purple-600 hover:underline text-sm">Download Image</a>
              </div>
            )}
          </>
        ) : (
          ['url', 'email', 'phone'].includes(type) ? (
            <input
              id="qr-content"
              type={type === 'phone' ? 'tel' : type}
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder={getPlaceholder()}
              aria-label={`Enter ${getLabel().toLowerCase()}`}
            />
          ) : (
            <textarea
              id="qr-content"
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder={getPlaceholder()}
              aria-label={`Enter ${getLabel().toLowerCase()}`}
              style={{ resize: 'vertical', minHeight: 120 }}
            />
          )
        )}
      </div>

      {type === 'url' && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter a valid URL starting with http:// or https://
        </p>
      )}

      {type === 'wifi' && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Format: SSID:NetworkName\nPassword:YourPassword\nEncryption:WPA/WEP/nopass
        </p>
      )}

      {type === 'vcard' && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Include contact details in vCard format
        </p>
      )}
      {(type === 'pdf' || type === 'images' || type === 'video') && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {type === 'pdf' && 'Upload a PDF file (max 1MB) or provide a PDF URL. Large files may create complex QR codes.'}
          {type === 'images' && 'Upload an image file (max 1MB) or provide an image URL. Images are automatically compressed for better QR code generation. Supported formats: JPG, PNG, GIF, WebP.'}
          {type === 'video' && 'Upload a video file (max 1MB) or provide a video URL. Supported formats: MP4, WebM, OGV.'}
          <br />
          <span className="text-xs">💡 Tip: For very large files, use the URL option and upload your file to a cloud service first.</span>
        </p>
      )}
      {type === 'menu' && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter a link to your restaurant's menu (PDF, image, or webpage).<br />
          Customers will scan the QR code to view your digital menu.
        </p>
      )}
      {type === 'snapseed' && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload a Snapseed Looks QR code image. Others can scan it in the Snapseed app to apply the look.<br />
          <span className="text-xs">Snapseed QR codes are only recognized by the Snapseed app.</span>
        </p>
      )}
    </div>
  );
};

export default QRCodeContentEditor;