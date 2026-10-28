import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';
import Barcode from 'react-barcode';

interface QRCodeStylingWrapperProps {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  style?: string;
  cornerRadius?: number;
  logoImage?: string;
  logoSize?: number;
  frame?: string;
  isBarcode?: boolean;
}

const QRCodeStylingWrapper = forwardRef<HTMLDivElement, QRCodeStylingWrapperProps>((props, ref) => {
  const {
    value,
    size,
    fgColor,
    bgColor,
    level,
    includeMargin,
    style,
    cornerRadius,
    logoImage,
    logoSize,
    frame,
    isBarcode = false,
  } = props;
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<unknown>(null);

  useImperativeHandle(ref, () => qrCodeRef.current!);

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.innerHTML = '';
    }
    if (isBarcode) {
      return;
    }
    
    console.log('Generating QR code for value length:', value.length);
    console.log('Value type:', typeof value);
    console.log('Value preview:', value.substring(0, 100) + '...');
    
    try {
      qrInstance.current = new QRCodeStyling({
        width: size,
        height: size,
        data: value,
        image: logoImage,
        imageOptions: {
          crossOrigin: 'anonymous',
          ...(logoImage ? { imageSize: logoSize ? logoSize / 100 : 0.25 } : {}),
        },
        dotsOptions: {
          color: fgColor,
          type: style === 'dots' ? 'dots' : style === 'rounded' ? 'rounded' : 'square',
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: cornerRadius && cornerRadius > 0 ? 'extra-rounded' : 'square',
          color: fgColor,
        },
        cornersDotOptions: {
          color: fgColor,
        },
        margin: includeMargin ? 10 : 0,
        qrOptions: {
          errorCorrectionLevel: level,
        },
      });
      
      if (qrCodeRef.current) {
        qrInstance.current.append(qrCodeRef.current);
        console.log('QR code generated successfully');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      console.error('Error details:', {
        valueLength: value.length,
        size,
        level,
        hasLogo: !!logoImage
      });
      
      if (qrCodeRef.current) {
        qrCodeRef.current.innerHTML = `
          <div class="text-red-500 text-center p-4 border border-red-300 rounded-lg">
            <div class="font-semibold mb-2">Error generating QR code</div>
            <div class="text-sm">Content may be too large or complex.</div>
            <div class="text-xs mt-1">Try using a smaller file or URL instead.</div>
          </div>
        `;
      }
    }
    
    // Frame support: add a border or overlay if frame is selected
    if (frame && frame !== 'none' && qrCodeRef.current) {
      qrCodeRef.current.style.border = '4px solid #6366F1';
      qrCodeRef.current.style.padding = '12px';
      qrCodeRef.current.style.borderRadius = '16px';
    } else if (qrCodeRef.current) {
      qrCodeRef.current.style.border = 'none';
      qrCodeRef.current.style.padding = '0';
      qrCodeRef.current.style.borderRadius = '0';
    }
  }, [value, size, fgColor, bgColor, level, includeMargin, style, cornerRadius, logoImage, logoSize, frame, isBarcode]);

  if (isBarcode) {
    return (
      <div ref={qrCodeRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: bgColor, padding: 8 }}>
        <Barcode
          value={value || ' '}
          width={2}
          height={size}
          background={bgColor}
          lineColor={fgColor}
          displayValue={true}
          fontSize={16}
          margin={includeMargin ? 10 : 0}
        />
      </div>
    );
  }

  return <div ref={qrCodeRef} />;
});

export default QRCodeStylingWrapper; 