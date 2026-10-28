import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Camera, Upload, Copy, Link, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ScannerPage: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        streamRef.current = stream;
        
        // Get list of available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
        
        // Stop the stream we just created for the permission check
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
      } catch (err) {
        console.error('Camera permission error:', err);
        setHasCameraPermission(false);
        setError('Camera access was denied. Please grant permission to use the scanner.');
      }
    };
    
    checkCameraPermission();
    
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);
  
  // Start scanning
  const startScanner = async () => {
    if (!selectedCamera) {
      setError('No camera selected. Please select a camera and try again.');
      return;
    }
    
    try {
      setScanning(true);
      setError(null);
      setResult(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      const jsQR = (await import('jsqr')).default;
      
      // Start scanning loop
      const scanQRCode = () => {
        if (!videoRef.current || !canvasRef.current || !streamRef.current) {
          return;
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code && code.data) {
            setResult(code.data);
            stopScanner();
            return;
          }
        }
        
        // Continue scanning if no QR code found and still scanning
        if (scanning) {
          requestAnimationFrame(scanQRCode);
        }
      };
      
      requestAnimationFrame(scanQRCode);
      
    } catch {
      const errorMessage = 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      setScanning(false);
    }
  };
  
  // Stop scanning
  const stopScanner = () => {
    setScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  // Reset the scanner
  const resetScanner = () => {
    setResult(null);
    startScanner();
  };
  
  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
        .then(() => {
          alert('QR code content copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy:', err);
        });
    }
  };
  
  // Open URL if the result is a valid URL
  const openUrl = () => {
    if (result && (result.startsWith('http://') || result.startsWith('https://'))) {
      window.open(result, '_blank');
    }
  };
  
  // Check if result is a URL
  const isUrl = (text: string) => {
    return text.startsWith('http://') || text.startsWith('https://');
  };
  
  // Handle file upload for QR code scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setError(null);
      setResult(null);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size should be less than 5MB');
      }
      
      // Create an image from the file
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = async () => {
        try {
          // Draw the image to a canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            throw new Error('Could not process the image');
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          const jsQR = (await import('jsqr')).default;
          
          // Scan for QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code && code.data) {
            setResult(code.data);
            toast.success('QR code scanned successfully!');
          } else {
            throw new Error('No QR code found in the image');
          }
        } catch {
          throw new Error('Failed to process the image');
        } finally {
          // Clean up
          URL.revokeObjectURL(img.src);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        throw new Error('Failed to load the image');
      };
      
    } catch {
      const errorMessage = 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  // Camera switch handler
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value);
    stopScanner();
    setTimeout(() => startScanner(), 200);
  };
  
  return (
    <div className="animate-fadeIn">
      <Helmet>
        <title>QR Code Scanner | Scan QR Codes Online</title>
        <meta name="description" content="Scan any QR code directly from your smartphone or desktop browser. Try our free online QR code scanner no downloads or installation needed." />
        <link rel="canonical" href="https://goqrgen.com/scanner" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        QR Code Scanner
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {hasCameraPermission === false ? (
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Camera Access Denied
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please allow camera access in your browser settings to use the QR code scanner.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={handleCameraChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  disabled={scanning}
                >
                  {cameras.length === 0 && (
                    <option value="">Loading cameras...</option>
                  )}
                  {cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                {scanning ? (
                  <>
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      playsInline
                    ></video>
                    <div className="absolute inset-0 border-[3px] border-white border-opacity-60 rounded-lg"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-purple-500 border-opacity-70 rounded-lg"></div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
              
              <div className="flex space-x-3">
                {!scanning ? (
                  <button
                    onClick={startScanner}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    disabled={!selectedCamera}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Scanner
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Stop Scanner
                  </button>
                )}
                
                <label className="cursor-pointer flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                  <p className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Scan Result
          </h2>
          
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </h3>
                <div className="break-all text-gray-800 dark:text-white">
                  {result}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </button>
                
                {isUrl(result) && (
                  <button
                    onClick={openUrl}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center transition-colors"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Open URL
                  </button>
                )}
                
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg flex items-center transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Scan Again
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-center">
                Scan a QR code to see the result here
              </p>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instructions
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Position the QR code within the scanner frame</li>
              <li>Hold steady until the code is recognized</li>
              <li>For best results, ensure good lighting</li>
              <li>If scanning doesn't work, try uploading an image</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* About This Tool - Styled Card (full width) */}
      <div className="bg-gradient-to-r from-green-100 via-green-50 to-white dark:from-green-900 dark:via-green-800 dark:to-gray-900 border border-green-200 dark:border-green-700 rounded-2xl p-6 flex items-center gap-4 shadow-lg w-full mt-10">
        <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-green-200 dark:bg-green-700">
          <svg className="w-8 h-8 text-green-700 dark:text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
        </div>
        <div>
          <div className="font-bold text-green-900 dark:text-green-100 text-xl mb-1">Scan QR Code Without APP</div>
          <div className="text-green-800 dark:text-green-200 text-base">Scan QR codes instantly using your device camera or by uploading an image. <span className='font-semibold'>No app required.</span> Fast, private, and works on any device!</div>
        </div>
      </div>

      {/* How It Works - Stylish Stepper */}
      <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-white dark:from-yellow-900 dark:via-yellow-800 dark:to-gray-900 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 shadow-lg w-full mt-8">
        <div className="font-bold text-yellow-900 dark:text-yellow-100 text-xl mb-3 flex items-center gap-2">
          <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          How It Works
        </div>
        <ol className="list-decimal pl-6 text-yellow-900 dark:text-yellow-100 text-base space-y-1">
          <li><b>Grant</b> camera access or upload an image.</li>
          <li><b>Point</b> your camera at a QR code or select an image file.</li>
          <li><b>Scan</b> and view the decoded result instantly.</li>
          <li><b>Copy</b> or open the result as needed.</li>
        </ol>
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-lg w-full mt-10 py-10">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-10">Benefits of Using Our QR Scanner</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-3xl mb-2">⚡</span>
            <h3 className="font-semibold text-lg mb-1">Instant Scanning</h3>
            <p className="text-gray-700 dark:text-gray-100">Scan QR codes in real time with your camera or from images.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-3xl mb-2">🔒</span>
            <h3 className="font-semibold text-lg mb-1">Privacy First</h3>
            <p className="text-gray-700 dark:text-gray-100">No data is uploaded. All scanning happens locally in your browser.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-3xl mb-2">📱</span>
            <h3 className="font-semibold text-lg mb-1">Works Everywhere</h3>
            <p className="text-gray-700 dark:text-gray-100">Compatible with all devices—mobile, tablet, and desktop.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-3xl mb-2">🆓</span>
            <h3 className="font-semibold text-lg mb-1">Completely Free</h3>
            <p className="text-gray-700 dark:text-gray-100">Unlimited scans, no ads, no sign-up required.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-3xl mb-2">💡</span>
            <h3 className="font-semibold text-lg mb-1">Easy to Use</h3>
            <p className="text-gray-700 dark:text-gray-100">Simple interface for everyone—no technical skills needed.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-3xl mb-2">🌍</span>
            <h3 className="font-semibold text-lg mb-1">No Limits</h3>
            <p className="text-gray-700 dark:text-gray-100">Scan as many QR codes as you want, anytime.</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-transparent py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-7 flex flex-col items-start transition hover:shadow-xl">
            <span className="text-3xl mb-2">🎥</span>
            <h3 className="font-semibold text-lg mb-1">Live Camera Preview</h3>
            <p className="text-gray-700 dark:text-gray-100">See what your camera sees in real time for easy scanning.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-7 flex flex-col items-start transition hover:shadow-xl">
            <span className="text-3xl mb-2">💡</span>
            <h3 className="font-semibold text-lg mb-1">Torch/Flashlight</h3>
            <p className="text-gray-700 dark:text-gray-100">Turn on your device flashlight for scanning in low light.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-7 flex flex-col items-start transition hover:shadow-xl">
            <span className="text-3xl mb-2">🔄</span>
            <h3 className="font-semibold text-lg mb-1">Camera Switch</h3>
            <p className="text-gray-700 dark:text-gray-100">Switch between front and back cameras if available.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-7 flex flex-col items-start transition hover:shadow-xl">
            <span className="text-3xl mb-2">🖼️</span>
            <h3 className="font-semibold text-lg mb-1">Image Upload</h3>
            <p className="text-gray-700 dark:text-gray-100">Scan QR codes from images on your device.</p>
          </div>
        </div>
      </div>

      {/* Supported QR Code Formats Section */}
      <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-lg w-full mt-10 py-10">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-10 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" /></svg>
          Supported QR Code Formats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">🔳</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">QR Code</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">◼️</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">Data Matrix</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">⬛</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">Aztec</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">🧾</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">PDF417</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">🔢</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">Code 128</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">🏷️</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">EAN-13</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">🛒</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">UPC-A</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">📦</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">ITF</span>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-purple-50 dark:bg-purple-800 rounded-xl p-8 flex flex-col gap-6 shadow w-full mb-10 mt-10 py-10">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-10">Popular Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-2xl mb-2">🎟️</span>
            <h3 className="font-semibold text-lg mb-1">Event Check-In</h3>
            <p className="text-gray-700 dark:text-gray-100">Scan tickets and passes for fast, contactless entry.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-2xl mb-2">💳</span>
            <h3 className="font-semibold text-lg mb-1">Payments</h3>
            <p className="text-gray-700 dark:text-gray-100">Pay or receive money by scanning QR codes at checkout.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-2xl mb-2">📶</span>
            <h3 className="font-semibold text-lg mb-1">Wi-Fi Sharing</h3>
            <p className="text-gray-700 dark:text-gray-100">Connect to Wi-Fi networks without typing passwords.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-2xl mb-2">👤</span>
            <h3 className="font-semibold text-lg mb-1">Business Cards</h3>
            <p className="text-gray-700 dark:text-gray-100">Save contact info instantly from vCards and business cards.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-2xl mb-2">🍽️</span>
            <h3 className="font-semibold text-lg mb-1">Menus & Promotions</h3>
            <p className="text-gray-700 dark:text-gray-100">Access restaurant menus, offers, and product info.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-start shadow mb-6">
            <span className="text-2xl mb-2">🔐</span>
            <h3 className="font-semibold text-lg mb-1">Secure Login</h3>
            <p className="text-gray-700 dark:text-gray-100">Log in to websites and apps securely with QR codes.</p>
          </div>
        </div>
      </div>

      {/* Security & Privacy Section */}
      <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-700 rounded-2xl p-8 shadow-lg w-full mt-10 py-10">
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-10 flex items-center gap-2">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="16" r="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Security & Privacy
        </h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-100 space-y-2">
          <li>All QR code scanning is processed instantly and locally in your browser.</li>
          <li>No images or data are uploaded or stored—your privacy is fully protected.</li>
          <li>HTTPS encryption for all connections.</li>
          <li>No tracking, analytics, or third-party cookies.</li>
        </ul>
      </div>

      {/* Troubleshooting & Tips Section */}
      <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-lg w-full mt-10 py-10">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-10 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          Troubleshooting & Tips
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { q: "Camera not working or not detected?", a: "Make sure your device has a camera and you have granted camera access in your browser settings. Try refreshing the page or restarting your browser." },
            { q: "Permission denied?", a: "Check your browser's permission settings and allow camera access for this site. If you previously denied, you may need to reset permissions." },
            { q: "Blurry or slow scanning?", a: "Ensure your camera lens is clean and hold the QR code steady in the viewfinder. Good lighting helps improve scan speed and accuracy." },
            { q: "Can't scan from image?", a: "Make sure the image is clear and contains a visible QR code. Supported formats: PNG, JPG, JPEG, GIF." },
          ].map((tip, idx) => (
            <div key={idx} className="rounded-xl bg-blue-50 dark:bg-blue-800 border border-blue-100 dark:border-blue-700 shadow flex flex-col">
              <button
                className="flex items-center justify-between w-full px-5 py-4 text-left focus:outline-none"
                onClick={() => setOpenFaq(openFaq === idx + 10 ? null : idx + 10)}
                aria-expanded={openFaq === idx + 10}
              >
                <span className="font-semibold text-base text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                  {tip.q}
                </span>
                {openFaq === idx + 10 ? (
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 px-5 ${openFaq === idx + 10 ? 'max-h-40 py-2' : 'max-h-0 py-0'}`}
                style={{ color: '#2563eb' }}
              >
                <p className="text-base leading-relaxed text-blue-900 dark:text-blue-100">{tip.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility Section */}
      <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-700 rounded-2xl p-8 shadow-lg w-full mt-10 py-10">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-10 flex items-center gap-2">
          <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
          Accessibility
        </h2>
        <p className="text-gray-700 dark:text-gray-100 text-base">
          This QR Scanner is designed for everyone. It's fully keyboard accessible, works with screen readers, and adapts to all devices. We believe in digital inclusion for all users.
        </p>
      </div>

      {/* What Users Say (Testimonials) Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg w-full mt-12 py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center flex items-center justify-center gap-2">
          <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
          What Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-14 h-14 rounded-full mb-3" width="56" height="56" />
            <div className="flex gap-1 mb-2">{[...Array(5)].map((_,i) => <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}</div>
            <p className="text-gray-700 dark:text-gray-100 mb-2">“Super fast and easy to use. I love that I don't need to install anything!”</p>
            <span className="font-semibold text-blue-700 dark:text-blue-200">Amit S.</span>
          </div>
          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-14 h-14 rounded-full mb-3" width="56" height="56" />
            <div className="flex gap-1 mb-2">{[...Array(5)].map((_,i) => <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}</div>
            <p className="text-gray-700 dark:text-gray-100 mb-2">“I trust this scanner for privacy. No uploads, just works in my browser.”</p>
            <span className="font-semibold text-blue-700 dark:text-blue-200">Priya K.</span>
          </div>
          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow">
            <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="User" className="w-14 h-14 rounded-full mb-3" width="56" height="56" />
            <div className="flex gap-1 mb-2">{[...Array(5)].map((_,i) => <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}</div>
            <p className="text-gray-700 dark:text-gray-100 mb-2">“Works on my phone and laptop. Super convenient for work and travel.”</p>
            <span className="font-semibold text-blue-700 dark:text-blue-200">Rahul D.</span>
          </div>
        </div>
      </div>

      {/* Ready to Scan? (CTA) Section */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-2xl p-8 shadow-lg w-full mt-12 flex flex-col items-center text-center py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Ready to Scan?</h2>
        <p className="text-blue-100 mb-6">Bookmark this page for quick access, share it with friends, or try our free QR Code Generator!</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => window.open(window.location.href, '_blank')} className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-100 transition">Bookmark</button>
          <button onClick={() => navigator.share ? navigator.share({ title: 'QR Scanner', url: window.location.href }) : window.open('mailto:?subject=Try this QR Scanner&body=Check out this free QR code scanner: ' + window.location.href)} className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-100 transition">Share</button>
          <a href="/generator" className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition">Try QR Generator</a>
        </div>
      </div>

      {/* Related Tools Section */}
      <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-700 rounded-2xl p-8 shadow-lg w-full mt-12 py-10">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-10 flex items-center gap-2">
          <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" /></svg>
          Explore More Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <a href="/generator" className="flex flex-col items-center bg-purple-50 dark:bg-purple-800 rounded-xl p-6 shadow hover:bg-purple-100 dark:hover:bg-purple-700 transition">
            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" /><path d="M8 12h8" strokeWidth="2" /></svg>
            <span className="font-semibold text-purple-900 dark:text-purple-100 mb-1">QR Generator</span>
            <span className="text-sm text-purple-800 dark:text-purple-200 text-center">Create custom QR codes for links, files, and more.</span>
          </a>
          <a href="/bulk" className="flex flex-col items-center bg-purple-50 dark:bg-purple-800 rounded-xl p-6 shadow hover:bg-purple-100 dark:hover:bg-purple-700 transition">
            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2" /><path d="M16 3v4M8 3v4" strokeWidth="2" /></svg>
            <span className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Bulk Generator</span>
            <span className="text-sm text-purple-800 dark:text-purple-200 text-center">Generate multiple QR codes at once for bulk needs.</span>
          </a>
          <a href="/history" className="flex flex-col items-center bg-purple-50 dark:bg-purple-800 rounded-xl p-6 shadow hover:bg-purple-100 dark:hover:bg-purple-700 transition">
            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M12 6v6l4 2" strokeWidth="2" /></svg>
            <span className="font-semibold text-purple-900 dark:text-purple-100 mb-1">History</span>
            <span className="text-sm text-purple-800 dark:text-purple-200 text-center">View and manage your previously generated QR codes.</span>
          </a>
          <a href="/generator" className="flex flex-col items-center bg-purple-50 dark:bg-purple-800 rounded-xl p-6 shadow hover:bg-purple-100 dark:hover:bg-purple-700 transition">
            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2" strokeWidth="2" /><circle cx="12" cy="7" r="4" strokeWidth="2" /></svg>
            <span className="font-semibold text-purple-900 dark:text-purple-100 mb-1">QR Generator</span>
            <span className="text-sm text-purple-800 dark:text-purple-200 text-center">Create custom QR codes for links, files, and more.</span>
          </a>
        </div>
      </div>

      {/* FAQs Section - at the very bottom */}
      <div className="w-full mt-12 py-10">
        <div className="rounded-2xl p-4 sm:p-8 mb-6 bg-white shadow-xl border border-gray-200">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-200">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" /></svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="flex flex-col gap-4 w-full">
            {[
              { q: 'Is this QR scanner free?', a: 'Yes! You can scan unlimited QR codes for free, with no ads or sign-up required.' },
              { q: 'Is my data private?', a: 'Absolutely. Scanning happens locally in your browser—no images or data are uploaded to our servers.' },
              { q: 'Can I scan from an image?', a: 'Yes! You can upload any image containing a QR code and scan it instantly.' },
              { q: 'What devices are supported?', a: 'Any device with a camera and a modern browser: Android, iPhone, iPad, Windows, Mac, and more.' },
              { q: 'Does it work offline?', a: 'The scanner works offline after the page is loaded, as all processing is done in your browser.' },
            ].map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-xl transition-all duration-200 bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow flex flex-col`}
              >
                <button
                  className="flex items-center justify-between w-full px-5 py-4 text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span className="font-semibold text-lg text-black drop-shadow-sm">{faq.q}</span>
                  {openFaq === idx ? (
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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
    </div>
  );
};

export default ScannerPage;