import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db, Book } from '../db';
import { BookDetail } from './BookDetail';

interface BookListProps {
  onDelete: (isbn: string) => void;
}

type ViewMode = 'grid' | 'list';

export function BookList({ onDelete }: BookListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const books = useLiveQuery(() =>
    db.books.orderBy('addedAt').reverse().toArray()
  );

  if (!books) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-lg">書籍がありません</p>
          <p className="text-sm mt-2">スキャンボタンから追加してください</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 表示切り替えボタン */}
      <div className="px-4 pt-4 pb-2 flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 書籍一覧 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
          {books.map((book) => (
            <BookCard
              key={book.isbn}
              book={book}
              onDelete={onDelete}
              onClick={() => setSelectedBook(book)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {books.map((book) => (
            <BookListItem
              key={book.isbn}
              book={book}
              onDelete={onDelete}
              onClick={() => setSelectedBook(book)}
            />
          ))}
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedBook && (
        <BookDetail book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </>
  );
}

function BookCard({
  book,
  onDelete,
  onClick,
}: {
  book: Book;
  onDelete: (isbn: string) => void;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`「${book.title}」を削除しますか?`)) {
      onDelete(book.isbn);
    }
  };

  // 日付を日本語形式でフォーマット
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}年${month}月${day}日`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="aspect-[3/4] bg-gray-200 relative">
        {book.coverImage && !imageError ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-1 mb-2">{book.author}</p>
        <p className="text-xs text-gray-400 mb-1">ISBN: {book.isbn}</p>
        <p className="text-xs text-gray-400 mb-3">📅 {formatDate(book.addedAt)}</p>
        <button
          onClick={handleDelete}
          className="w-full py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors active:bg-red-700"
        >
          削除
        </button>
      </div>
    </div>
  );
}

function BookListItem({
  book,
  onDelete,
  onClick,
}: {
  book: Book;
  onDelete: (isbn: string) => void;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`「${book.title}」を削除しますか?`)) {
      onDelete(book.isbn);
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
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="flex p-4 gap-4">
        {/* サムネイル */}
        <div className="flex-shrink-0 w-20 h-28">
          <div className="w-full h-full bg-gray-200 rounded overflow-hidden">
            {book.coverImage && !imageError ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* 書籍情報 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base line-clamp-2 mb-1">{book.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-1 mb-2">{book.author}</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>ISBN: {book.isbn}</p>
            <p>📅 {formatDate(book.addedAt)}</p>
          </div>
          {book.comment && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">💭 {book.comment}</p>
          )}
        </div>

        {/* 削除ボタン */}
        <div className="flex-shrink-0 flex items-start">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors active:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
