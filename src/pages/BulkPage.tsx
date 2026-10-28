import React, { useState, useRef, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Trash2, Plus, Save, FileUp, FileDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeCustomization, QRCodeType } from '../types/qrTypes';
import { useHistory } from '../contexts/HistoryContext';

// Lazy-load QRCodeCanvas
const QRCodeCanvas = lazy(() => import('qrcode.react').then(mod => ({ default: mod.QRCodeCanvas })));

interface BatchItem {
  id: string;
  name: string;
  value: string;
  type: QRCodeType;
}

const BulkPage: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([
    { id: uuidv4(), name: 'Website QR Code', value: 'https://example.com', type: 'url' },
    { id: uuidv4(), name: 'Contact QR Code', value: 'tel:+1234567890', type: 'phone' },
  ]);
  
  const [customization, setCustomization] = useState<QRCodeCustomization>({
    fgColor: '#6366F1',
    bgColor: '#FFFFFF',
    size: 200,
    includeMargin: true,
    level: 'M',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToHistory } = useHistory();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const faqs: { q: string; a: string }[] = [
    { q: 'How many QR codes can I generate at once?', a: 'You can generate hundreds of QR codes in a single bulk, limited only by your browser and device performance. There are no artificial limits.' },
    { q: 'Is this bulk generator free?', a: 'Yes! You can generate unlimited QR codes for free, with no ads or sign-up required. All features are available without any cost.' },
    { q: 'Can I customize each QR code individually?', a: 'Yes! You can set individual content for each QR code while applying consistent styling across all codes for brand consistency.' },
    { q: 'What file formats are supported for download?', a: 'All QR codes are downloaded as high-quality PNG images in a ZIP file for easy organization and immediate use.' },
    { q: 'Is my data private and secure?', a: 'Absolutely. All processing happens locally in your browser—no data is uploaded or stored on our servers.' },
    { q: 'Can I save my configurations for later use?', a: 'Yes! You can export your bulk configurations as JSON files and import them later for consistent branding across campaigns.' },
  ];
  
  const addItem = () => {
    setItems([
      ...items,
      { id: uuidv4(), name: `QR Code ${items.length + 1}`, value: '', type: 'text' },
    ]);
  };
  
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const updateItem = (id: string, field: keyof BatchItem, value: string) => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const downloadAll = async () => {
    if (items.length === 0) return;
    try {
      setIsGenerating(true);
      const JSZip = (await import('jszip')).default;
      const { toPng } = await import('html-to-image');
      const zip = new JSZip();
      const promises = items.map(async item => {
        const element = document.getElementById(`qr-${item.id}`);
        if (!element) return null;
        const dataUrl = await toPng(element);
        const base64Data = dataUrl.split(',')[1];
        const fileName = `${item.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        zip.file(fileName, base64Data, { base64: true });
        return { item, preview: dataUrl };
      });
      const results = await Promise.all(promises);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'qr-codes.zip');
      results.forEach(result => {
        if (result) {
          addToHistory({
            id: result.item.id,
            type: result.item.type,
            value: result.item.value,
            name: result.item.name,
            created: new Date().toISOString(),
            customization,
            preview: result.preview,
          });
        }
      });
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating batch QR codes:', error);
      setIsGenerating(false);
    }
  };
  
  const exportConfig = () => {
    const config = {
      items,
      customization,
    };
    
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(config))}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'qr-batch-config.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config.items && Array.isArray(config.items) && config.customization) {
          setItems(config.items);
          setCustomization(config.customization);
        }
      } catch (error) {
        console.error('Error parsing config file:', error);
        alert('Invalid configuration file. Please try again.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };
  
  const importExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
        const [header, ...rows] = json;
        if (!header || header.length < 2) throw new Error('Invalid Excel format');
        const idxName = header.findIndex(h => h.toLowerCase().includes('name'));
        const idxValue = header.findIndex(h => h.toLowerCase().includes('value'));
        const idxType = header.findIndex(h => h.toLowerCase().includes('type'));
        const importedItems = rows.map((row, i) => ({
          id: uuidv4(),
          name: row[idxName] || `QR Code ${i + 1}`,
          value: row[idxValue] || '',
          type: (row[idxType] as QRCodeType) || 'text',
        })).filter(item => item.value);
        if (importedItems.length === 0) throw new Error('No valid rows found');
        setItems(importedItems);
      } catch (err) {
        alert('Failed to import Excel: ' + (err as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const Papa = await import('papaparse');
      Papa.parse<string[]>(event.target?.result as string, {
        complete: (results: any) => {
          try {
            const [header, ...rows] = results.data as string[][];
            if (!header || header.length < 2) throw new Error('Invalid CSV format');
            const idxName = header.findIndex(h => h.toLowerCase().includes('name'));
            const idxValue = header.findIndex(h => h.toLowerCase().includes('value'));
            const idxType = header.findIndex(h => h.toLowerCase().includes('type'));
            const importedItems = rows.map((row, i) => ({
              id: uuidv4(),
              name: row[idxName] || `QR Code ${i + 1}`,
              value: row[idxValue] || '',
              type: (row[idxType] as QRCodeType) || 'text',
            })).filter(item => item.value);
            if (importedItems.length === 0) throw new Error('No valid rows found');
            setItems(importedItems);
          } catch (error) {
            if (error instanceof Error) {
              alert('Failed to parse CSV: ' + error.message);
            } else {
              alert('Failed to parse CSV: ' + String(error));
            }
          }
        },
        error: (error: unknown) => {
          if (error instanceof Error) {
            alert('Failed to parse CSV: ' + error.message);
          } else {
            alert('Failed to parse CSV: ' + String(error));
          }
        },
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const importGoogleSheets = () => {
    alert('To import from Google Sheets, export your sheet as CSV and use the CSV import option.');
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const wsData = [
      ['Name', 'Value', 'Type'],
      ...items.map(item => [item.name, item.value, item.type]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'QR Codes');
    XLSX.writeFile(wb, 'qr-codes.xlsx');
  };

  const exportCSV = async () => {
    const Papa = await import('papaparse');
    const csv = Papa.unparse([
      ['Name', 'Value', 'Type'],
      ...items.map(item => [item.name, item.value, item.type]),
    ]);
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, 'qr-codes.csv');
  };

  const exportPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(14);
    doc.text('Batch QR Codes', 10, y);
    y += 10;
    items.forEach((item, i) => {
      doc.setFontSize(10);
      doc.text(`${i + 1}. ${item.name} [${item.type}]`, 10, y);
      y += 6;
      doc.text(item.value, 12, y);
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });
    doc.save('qr-codes.pdf');
  };

  const exportJPEG = async () => {
    if (items.length === 0) return;
    setIsGenerating(true);
    try {
      const JSZip = (await import('jszip')).default;
      const { toPng } = await import('html-to-image');
      const zip = new JSZip();
      const promises = items.map(async item => {
        const element = document.getElementById(`qr-${item.id}`);
        if (!element) return null;
        const dataUrl = await toPng(element);
        const base64Data = dataUrl.split(',')[1];
        const fileName = `${item.name.replace(/\s+/g, '-').toLowerCase()}.jpeg`;
        zip.file(fileName, base64Data, { base64: true });
        return { item, preview: dataUrl };
      });
      await Promise.all(promises);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'qr-codes-jpeg.zip');
    } catch (error) {
      alert('Error exporting JPEGs: ' + (error as Error).message);
    }
    setIsGenerating(false);
  };
  
  return (
    <div className="animate-fadeIn">
      <Helmet>
        <title>Bulk QR Code Generator | Create Multiple QR Codes | GOQRGen</title>
        <meta name="description" content="Create hundreds of QR codes in one go! Use our Bulk QR Code Generator for fast, bulk QR code creation no design skills needed!" />
        <link rel="canonical" href="https://goqrgen.com/bulk" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Bulk QR Code Generator
        </h1>
        
        <div className="flex space-x-2">
          {/* Import Dropdown */}
          <div className="relative group">
          <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors">
            <FileUp className="w-5 h-5 mr-2" />
            Import
            </label>
            <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
              <label className="block px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                JSON
                <input type="file" accept=".json" onChange={importConfig} className="hidden" />
              </label>
              <label className="block px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                Excel (XLSX)
                <input type="file" accept=".xlsx" onChange={importExcel} className="hidden" />
              </label>
              <label className="block px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                CSV
                <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
              </label>
              <label className="block px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white" onClick={importGoogleSheets}>
                Google Sheets
                <input type="file" className="hidden" disabled />
          </label>
            </div>
          </div>
          {/* Export Dropdown */}
          <div className="relative group">
          <button
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
            disabled={items.length === 0}
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export
          </button>
            <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white" onClick={exportConfig}>
                JSON
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white" onClick={exportExcel}>
                Excel (XLSX)
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white" onClick={exportCSV}>
                CSV
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white" onClick={exportJPEG}>
                JPEG
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white" onClick={exportPDF}>
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              QR Codes
            </h2>
            
            <div className="space-y-4" ref={containerRef}>
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                      QR Code #{index + 1}
                    </h3>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        placeholder="QR Code Name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                        Type
                      </label>
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(item.id, 'type', e.target.value as QRCodeType)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="url">URL</option>
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="sms">SMS</option>
                        <option value="wifi">WiFi</option>
                        <option value="vcard">Contact</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                      Content
                    </label>
                    <textarea
                      value={item.value}
                      onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter QR code content"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={addItem}
              className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another QR Code
            </button>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Preview & Options
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-3">
                  Global Style
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                      Foreground Color
                    </label>
                    <input
                      type="color"
                      value={customization.fgColor}
                      onChange={(e) => setCustomization({ ...customization, fgColor: e.target.value })}
                      className="w-full h-8 rounded-md border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={customization.bgColor}
                      onChange={(e) => setCustomization({ ...customization, bgColor: e.target.value })}
                      className="w-full h-8 rounded-md border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                    Size: {customization.size}px
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="300"
                    step="8"
                    value={customization.size}
                    onChange={(e) => setCustomization({ ...customization, size: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-100 mb-1">
                    Error Correction
                  </label>
                  <select
                    value={customization.level}
                    onChange={(e) => setCustomization({ ...customization, level: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
                
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="includeMargin"
                    checked={customization.includeMargin}
                    onChange={(e) => setCustomization({ ...customization, includeMargin: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeMargin" className="ml-2 block text-xs text-gray-500 dark:text-gray-100">
                    Include Margin
                  </label>
                </div>
              </div>
              
              {/* Preview section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-3">
                  Preview
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {items.slice(0, 2).map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white p-2 rounded-lg shadow-sm"
                    >
                      <div 
                        id={`qr-${item.id}`}
                        className="flex items-center justify-center"
                      >
                        <QRCodeCanvas
                          value={item.value || 'Empty'}
                          size={Math.min(120, customization.size)}
                          fgColor={customization.fgColor}
                          bgColor={customization.bgColor}
                          level={customization.level}
                          includeMargin={customization.includeMargin}
                        />
                      </div>
                      <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-100 truncate">
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
                
                {items.length > 2 && (
                  <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-100">
                    +{items.length - 2} more QR codes
                  </p>
                )}
              </div>
              
              <button
                onClick={downloadAll}
                disabled={isGenerating || items.some(item => !item.value) || items.length === 0}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                      <div className="border-2 border-white border-t-transparent rounded-full w-full h-full" />
                    </div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download All ({items.length} QR Codes)
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  items.forEach(item => {
                    addToHistory({
                      id: item.id,
                      type: item.type,
                      value: item.value,
                      name: item.name,
                      created: new Date().toISOString(),
                      customization,
                    });
                  });
                  alert(`Saved ${items.length} QR codes to history!`);
                }}
                disabled={items.some(item => !item.value) || items.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                Save All to History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About This Tool - Styled Card (full width) */}
      <div className="relative bg-gradient-to-r from-purple-100 via-purple-50 to-white dark:from-purple-900 dark:via-purple-800 dark:to-gray-900 border border-purple-200 dark:border-purple-700 rounded-2xl p-6 shadow-lg w-full mt-10">
        <div className="absolute top-6 left-6 flex items-center justify-center w-14 h-14 rounded-full bg-purple-200 dark:bg-purple-700">
          <svg className="w-8 h-8 text-purple-700 dark:text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
        </div>
        <div className="pl-20">
          <div className="font-bold text-purple-900 dark:text-purple-100 text-xl mb-1">Generate Bulk QR Code</div>
          <div className="text-purple-800 dark:text-purple-200 text-base mb-2">Generate hundreds of QR codes simultaneously with our advanced batch processor. <span className='font-semibold'>No limits, no registration.</span> Perfect for businesses, events, and marketing campaigns!</div>
          <div className="text-purple-700 dark:text-purple-300 text-base mb-2">Our tool is designed for speed, privacy, and ease of use. Whether you need QR codes for product packaging, event tickets, or marketing materials, you can create them all in one go—saving you hours of manual work. All processing happens instantly in your browser, so your data stays secure and private.</div>
          <div className="text-purple-700 dark:text-purple-300 text-base">We support a wide range of QR code types and customization options, making it easy to match your brand and project needs. With intuitive import/export features and real-time previews, you're always in control of your batch QR code generation process.</div>
        </div>
      </div>

      {/* How It Works - Stylish Stepper */}
      <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-white dark:from-yellow-900 dark:via-yellow-800 dark:to-gray-900 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 shadow-lg w-full mt-8">
        <div className="font-bold text-yellow-900 dark:text-yellow-100 text-xl mb-3 flex items-center gap-2">
          <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          How It Works
        </div>
        <ol className="list-decimal pl-6 text-yellow-900 dark:text-yellow-100 text-base space-y-1">
          <li><b>Add</b> your data - URLs, text, contact info, or WiFi details for each QR code.</li>
          <li><b>Customize</b> the appearance with colors, size, and error correction levels.</li>
          <li><b>Preview</b> all QR codes in real-time before generating.</li>
          <li><b>Download</b> all codes as a single ZIP file, ready for immediate use.</li>
        </ol>
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-700 rounded-2xl p-8 shadow-lg w-full mt-8">
        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-6">Benefits of Using Our Bulk QR Generator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full">
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-3xl mb-2">⚡</span>
            <h3 className="font-semibold text-lg mb-1">Lightning Fast</h3>
            <p className="text-gray-700 dark:text-gray-100">Generate 100+ QR codes in under 30 seconds. No waiting, no processing delays.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-3xl mb-2">🔒</span>
            <h3 className="font-semibold text-lg mb-1">100% Private</h3>
            <p className="text-gray-700 dark:text-gray-100">Your data never leaves your browser. No servers, no storage, no tracking.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-3xl mb-2">🎨</span>
            <h3 className="font-semibold text-lg mb-1">Custom Styling</h3>
            <p className="text-gray-700 dark:text-gray-100">Choose colors, size, and error correction for consistent branding.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-3xl mb-2">📦</span>
            <h3 className="font-semibold text-lg mb-1">ZIP Download</h3>
            <p className="text-gray-700 dark:text-gray-100">Get all QR codes in a single compressed file for easy organization.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-3xl mb-2">🆓</span>
            <h3 className="font-semibold text-lg mb-1">Completely Free</h3>
            <p className="text-gray-700 dark:text-gray-100">Unlimited generation, no ads, no sign-up required.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-800 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-3xl mb-2">💼</span>
            <h3 className="font-semibold text-lg mb-1">Enterprise Ready</h3>
            <p className="text-gray-700 dark:text-gray-100">Handle thousands of QR codes with advanced error correction.</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-transparent py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
            <span className="text-3xl mb-2">��</span>
            <h3 className="font-semibold text-lg mb-1">Unlimited Generation</h3>
            <p className="text-gray-700 dark:text-gray-100">Create as many QR codes as you need without any artificial limits.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
            <span className="text-3xl mb-2">📄</span>
            <h3 className="font-semibold text-lg mb-1">Multiple Formats</h3>
            <p className="text-gray-700 dark:text-gray-100">Support for URLs, text, vCards, emails, phones, WiFi, and more.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
            <span className="text-3xl mb-2">🔄</span>
            <h3 className="font-semibold text-lg mb-1">Import/Export</h3>
            <p className="text-gray-700 dark:text-gray-100">Save configurations and reuse them for consistent branding.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-lg p-4 sm:p-6 md:p-8 flex flex-col items-start transition hover:shadow-xl mb-6">
            <span className="text-3xl mb-2">👁️</span>
            <h3 className="font-semibold text-lg mb-1">Live Preview</h3>
            <p className="text-gray-700 dark:text-gray-100">See exactly how your QR codes will look before downloading.</p>
          </div>
        </div>
      </div>

      {/* Supported Data Formats Section */}
      <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-lg w-full mt-10 py-10">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-10 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" /></svg>
          Supported Data Formats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center bg-white dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">🌐</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">URLs</span>
          </div>
          <div className="flex flex-col items-center bg-white dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">📝</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">Text</span>
        </div>
          <div className="flex flex-col items-center bg-white dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">📧</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">Email</span>
        </div>
          <div className="flex flex-col items-center bg-white dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">📞</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">Phone</span>
      </div>
          <div className="flex flex-col items-center bg-white dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">📱</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">SMS</span>
          </div>
          <div className="flex flex-col items-center bg-white dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">📶</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">WiFi</span>
          </div>
          <div className="flex flex-col items-center bg-white dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">👤</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">vCard</span>
          </div>
          <div className="flex flex-col items-center bg-white dark:bg-blue-800 rounded-xl p-5 shadow">
            <span className="text-4xl mb-2">📅</span>
            <span className="font-semibold text-blue-900 dark:text-blue-100">Events</span>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white dark:bg-purple-800 rounded-xl p-4 sm:p-8 flex flex-col gap-6 shadow w-full mb-10 mt-10 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100 mb-10">Popular Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-2xl mb-2">🏷️</span>
            <h3 className="font-semibold text-lg mb-1">Product Labeling</h3>
            <p className="text-gray-700 dark:text-gray-100">Create QR codes for inventory tracking and product information.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-2xl mb-2">🎟️</span>
            <h3 className="font-semibold text-lg mb-1">Event Management</h3>
            <p className="text-gray-700 dark:text-gray-100">Generate tickets and badges for events and conferences.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-2xl mb-2">📢</span>
            <h3 className="font-semibold text-lg mb-1">Marketing Campaigns</h3>
            <p className="text-gray-700 dark:text-gray-100">Distribute QR codes on flyers, posters, and ads.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-2xl mb-2">🎓</span>
            <h3 className="font-semibold text-lg mb-1">Education</h3>
            <p className="text-gray-700 dark:text-gray-100">Student IDs, assignments, and resource sharing.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-2xl mb-2">🚚</span>
            <h3 className="font-semibold text-lg mb-1">Logistics & Shipping</h3>
            <p className="text-gray-700 dark:text-gray-100">Track shipments and manage logistics efficiently.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col items-start shadow">
            <span className="text-2xl mb-2">💼</span>
            <h3 className="font-semibold text-lg mb-1">Business Cards</h3>
            <p className="text-gray-700 dark:text-gray-100">Create contact QR codes for team members and clients.</p>
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
          <li>All QR code generation is processed instantly and locally in your browser.</li>
          <li>No data is uploaded or stored—your privacy is fully protected.</li>
          <li>HTTPS encryption for all connections.</li>
          <li>No tracking, analytics, or third-party cookies.</li>
          <li>Your configurations and data remain on your device only.</li>
        </ul>
      </div>

      {/* Accessibility Section */}
      <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-700 rounded-2xl p-8 shadow-lg w-full mt-10 py-10">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-10 flex items-center gap-2">
          <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
          Accessibility
        </h2>
        <p className="text-gray-700 dark:text-gray-100 text-base mb-2">
          Our Bulk QR Code Generator is designed for everyone. It's fully keyboard accessible, works with screen readers, and adapts to all devices. We believe in digital inclusion for all users, ensuring that batch QR code generation is accessible to businesses of all sizes.
        </p>
        <p className="text-gray-700 dark:text-gray-100 text-base mb-2">
          We follow the latest accessibility standards (WCAG) to make sure our tool is usable by people with disabilities, including those using assistive technologies. All interactive elements are labeled for screen readers, and color contrast is carefully chosen for readability.
        </p>
        <p className="text-gray-700 dark:text-gray-100 text-base">
          If you have suggestions or encounter any accessibility barriers, please let us know. We are committed to continuous improvement and welcome feedback to make our tool even more inclusive for everyone.
        </p>
      </div>

      {/* Troubleshooting & Tips Section */}
      <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-lg w-full mt-10 py-10">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-10 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          Troubleshooting & Tips
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((tip, idx) => (
            <div key={idx} className="rounded-xl bg-blue-50 dark:bg-blue-800 border border-blue-100 dark:border-blue-700 shadow flex flex-col">
              <button
                className="flex items-center justify-between w-full px-5 py-4 text-left focus:outline-none"
                onClick={() => setOpenFaq(openFaq === idx + 20 ? null : idx + 20)}
                aria-expanded={openFaq === idx + 20}
              >
                <span className="font-semibold text-base text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                  {tip.q}
                </span>
                {openFaq === idx + 20 ? (
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 px-5 ${openFaq === idx + 20 ? 'max-h-40 py-2' : 'max-h-0 py-0'}`}
                style={{ color: '#2563eb' }}
              >
                <p className="text-base leading-relaxed text-blue-900 dark:text-blue-100">{tip.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What Users Say (Testimonials) Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg w-full mt-12 py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center flex items-center justify-center gap-2">
          <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
          What Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-14 h-14 rounded-full mb-3" />
            <div className="flex gap-1 mb-2">{[...Array(5)].map((_,i) => <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}</div>
            <p className="text-gray-700 dark:text-gray-100 mb-2">"Bulk QR code generation saved us hours of manual work! The ZIP download is super convenient."</p>
            <span className="font-semibold text-blue-700 dark:text-blue-200">Amit S.</span>
          </div>
          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-14 h-14 rounded-full mb-3" />
            <div className="flex gap-1 mb-2">{[...Array(5)].map((_,i) => <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}</div>
            <p className="text-gray-700 dark:text-gray-100 mb-2">"Perfect for our marketing campaigns. The customization options are exactly what we needed."</p>
            <span className="font-semibold text-blue-700 dark:text-blue-200">Priya K.</span>
          </div>
          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow">
            <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="User" className="w-14 h-14 rounded-full mb-3" />
            <div className="flex gap-1 mb-2">{[...Array(5)].map((_,i) => <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>)}</div>
            <p className="text-gray-700 dark:text-gray-100 mb-2">"Enterprise-level tool that's completely free. Handles our large batches without any issues."</p>
            <span className="font-semibold text-blue-700 dark:text-blue-200">Rahul D.</span>
          </div>
        </div>
      </div>

      {/* Ready to Generate? (CTA) Section */}
      <div className="bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 rounded-2xl p-8 shadow-lg w-full mt-12 flex flex-col items-center text-center py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">Ready to Generate?</h2>
        <p className="text-purple-100 mb-6">Bookmark this page for quick access, share it with your team, or try our single QR code generator!</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => window.open(window.location.href, '_blank')} className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg shadow hover:bg-purple-100 transition">Bookmark</button>
          <button onClick={() => navigator.share ? navigator.share({ title: 'Bulk QR Generator', url: window.location.href }) : window.open('mailto:?subject=Try this Bulk QR Generator&body=Check out this free bulk QR code generator: ' + window.location.href)} className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg shadow hover:bg-purple-100 transition">Share</button>
          <a href="/generator" className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition">Try Single Generator</a>
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
          <a href="/scanner" className="flex flex-col items-center bg-purple-50 dark:bg-purple-800 rounded-xl p-6 shadow hover:bg-purple-100 dark:hover:bg-purple-700 transition">
            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2" /><path d="M16 3v4M8 3v4" strokeWidth="2" /></svg>
            <span className="font-semibold text-purple-900 dark:text-purple-100 mb-1">QR Scanner</span>
            <span className="text-sm text-purple-800 dark:text-purple-200 text-center">Scan QR codes online with your camera or images.</span>
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
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl transition-all duration-200 bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow flex flex-col">
                <button
                  className="flex items-center justify-between w-full px-5 py-4 text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span className="font-semibold text-lg text-black drop-shadow-sm">
                    {faq.q}
                  </span>
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

export default BulkPage;