import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface ScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export function Scanner({ onScan, onClose }: ScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices.length === 0) {
          setError('カメラが見つかりません');
          return;
        }

        // 背面カメラを優先的に選択
        const backCamera = devices.find(
          (device) =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('環境')
        );
        const cameraId = backCamera?.id || devices[0].id;

        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // ISBN-10 or ISBN-13 format detection
            const isbn = decodedText.replace(/[^0-9]/g, '');
            if (isbn.length === 10 || isbn.length === 13) {
              onScan(isbn);
              stopScanner();
            }
          },
          (errorMessage) => {
            // スキャン失敗時のログは無視（頻繁に発生するため）
            console.debug('Scan error:', errorMessage);
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Scanner error:', err);
        setError('カメラの起動に失敗しました');
      }
    };

    const stopScanner = async () => {
      if (
        scanner.getState() === Html5QrcodeScannerState.SCANNING ||
        scanner.getState() === Html5QrcodeScannerState.PAUSED
      ) {
        await scanner.stop();
      }
      setIsScanning(false);
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);

  const handleClose = async () => {
    if (scannerRef.current) {
      const scanner = scannerRef.current;
      if (
        scanner.getState() === Html5QrcodeScannerState.SCANNING ||
        scanner.getState() === Html5QrcodeScannerState.PAUSED
      ) {
        await scanner.stop();
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="flex flex-col h-screen-dynamic">
        {/* ヘッダー */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">バーコードをスキャン</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 text-2xl font-bold px-3"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* スキャナー領域 */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="w-full max-w-md px-4">
            <div id="qr-reader" className="w-full"></div>
            {error && (
              <div className="mt-4 p-4 bg-red-500 text-white rounded-lg text-center">
                {error}
              </div>
            )}
            {isScanning && !error && (
              <div className="mt-4 text-white text-center">
                <p className="text-sm">バーコードをカメラに向けてください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
