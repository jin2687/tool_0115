import { useState } from 'react';
import { Scanner } from './components/Scanner';
import { BookList } from './components/BookList';
import { db } from './db';
import { fetchBookInfo } from './api';

function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleScan = async (isbn: string) => {
    setShowScanner(false);
    setIsLoading(true);
    setMessage(null);

    try {
      // 既に登録済みかチェック
      const existing = await db.books.get(isbn);
      if (existing) {
        setMessage({ type: 'error', text: 'この書籍は既に登録されています' });
        setIsLoading(false);
        return;
      }

      // OpenBD APIから書籍情報を取得
      const bookInfo = await fetchBookInfo(isbn);
      if (!bookInfo) {
        setMessage({ type: 'error', text: '書籍情報が見つかりませんでした' });
        setIsLoading(false);
        return;
      }

      // データベースに保存
      await db.books.add(bookInfo);
      setMessage({ type: 'success', text: `「${bookInfo.title}」を追加しました` });
    } catch (error) {
      console.error('Failed to add book:', error);
      setMessage({ type: 'error', text: '書籍の追加に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (isbn: string) => {
    try {
      await db.books.delete(isbn);
      setMessage({ type: 'success', text: '書籍を削除しました' });
    } catch (error) {
      console.error('Failed to delete book:', error);
      setMessage({ type: 'error', text: '書籍の削除に失敗しました' });
    }
  };

  const handleOpenScanner = () => {
    setMessage(null);
    setShowScanner(true);
  };

  return (
    <div className="min-h-screen-dynamic bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold">📚 書籍管理</h1>
        </div>
      </header>

      {/* メッセージ通知 */}
      {message && (
        <div className="sticky top-0 z-40">
          <div
            className={`p-4 text-center font-medium ${
              message.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-700 font-medium">処理中...</p>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="pb-24">
        <BookList onDelete={handleDelete} />
      </main>

      {/* 固定スキャンボタン */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <button
          onClick={handleOpenScanner}
          disabled={isLoading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <span>バーコードをスキャン</span>
        </button>
      </div>

      {/* スキャナーモーダル */}
      {showScanner && (
        <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}

export default App;
