import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  text: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  text,
  size = 180,
  className = '',
  darkColor = '#0f172a',
  lightColor = '#ffffff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !text) return;
    QRCode.toCanvas(
      canvasRef.current,
      text,
      {
        width: size,
        margin: 1.5,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) console.error('QR code generation error:', error);
      }
    );
  }, [text, size, darkColor, lightColor]);

  return (
    <div className={`inline-flex items-center justify-center p-2 rounded-xl bg-white shadow-md ${className}`}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </div>
  );
};
