import { useState, useEffect } from 'react';
import { Book, db } from '../db';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
}

export function BookDetail({ book, onClose }: BookDetailProps) {
  const [comment, setComment] = useState(book.comment || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setComment(book.comment || '');
  }, [book.comment]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.books.update(book.isbn, { comment });
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Failed to save comment:', error);
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}年${month}月${day}日`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">書籍詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-4">
          {/* 書籍情報 */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>
              <p className="text-base text-gray-700">{book.author}</p>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-semibold">ISBN:</span> {book.isbn}
              </p>
              <p>
                <span className="font-semibold">登録日:</span> {formatDate(book.addedAt)}
              </p>
            </div>
          </div>

          {/* 書籍の説明 */}
          {book.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📖 書籍について</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{book.description}</p>
            </div>
          )}

          {/* コメント入力 */}
          <div>
            <label htmlFor="comment" className="block font-semibold text-gray-900 mb-2">
              💭 コメント・メモ
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="この本についてのメモや感想を書き込めます..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                  isSaving
                    ? 'bg-green-500'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {isSaving ? '✓ 保存しました' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
