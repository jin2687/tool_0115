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
        // 背面カメラを確実に使用するための設定
        const config = {
          fps: 30,
          qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
            // 画面サイズに応じて動的にスキャンボックスを調整
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * 0.8);
            return {
              width: Math.min(qrboxSize, 350),
              height: Math.min(qrboxSize * 0.5, 175)
            };
          },
          aspectRatio: 1.777778
        };

        // まず facingMode: environment で背面カメラを試行
        try {
          await scanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // ISBN-10 or ISBN-13 format detection
              const isbn = decodedText.replace(/[^0-9Xx]/g, '');
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
        } catch (facingModeError) {
          // facingMode が使えない場合は、デバイスリストから背面カメラを選択
          console.warn('facingMode not supported, falling back to device selection');
          const devices = await Html5Qrcode.getCameras();
          if (devices.length === 0) {
            setError('カメラが見つかりません');
            return;
          }

          // 背面カメラを確実に選択（複数のパターンでマッチング）
          const backCamera = devices.find(
            (device) => {
              const label = device.label.toLowerCase();
              return (
                label.includes('back') ||
                label.includes('rear') ||
                label.includes('environment') ||
                label.includes('背面') ||
                label.includes('環境') ||
                label.includes('camera 0') ||
                label.includes('camera2 0')
              );
            }
          );

          // 背面カメラが見つからない場合は最後のカメラ（通常は背面）を選択
          const cameraId = backCamera?.id || devices[devices.length - 1].id;

          await scanner.start(
            cameraId,
            config,
            (decodedText) => {
              const isbn = decodedText.replace(/[^0-9Xx]/g, '');
              if (isbn.length === 10 || isbn.length === 13) {
                onScan(isbn);
                stopScanner();
              }
            },
            (errorMessage) => {
              console.debug('Scan error:', errorMessage);
            }
          );
          setIsScanning(true);
        }
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
              <div className="mt-4 text-white text-center space-y-2">
                <p className="text-base font-semibold">📖 書籍裏表紙のバーコードをスキャン</p>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>✓ バーコード全体が枠内に入るように</p>
                  <p>✓ 明るい場所で、ピントを合わせて</p>
                  <p>✓ 10〜15cmほど離してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
