import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { db, Book } from '../db';

interface BookListProps {
  onDelete: (isbn: string) => void;
}

export function BookList({ onDelete }: BookListProps) {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {books.map((book) => (
        <BookCard key={book.isbn} book={book} onDelete={onDelete} />
      ))}
    </div>
  );
}

function BookCard({ book, onDelete }: { book: Book; onDelete: (isbn: string) => void }) {
  const [imageError, setImageError] = useState(false);

  const handleDelete = () => {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
