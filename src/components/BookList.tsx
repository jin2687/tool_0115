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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-2">
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
        <div className="p-2">
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
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`「${book.title}」を削除しますか?`)) {
      onDelete(book.isbn);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}/${day}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="p-2">
        <h3 className="font-medium text-xs line-clamp-2 mb-1 min-h-[2rem]">{book.title}</h3>
        <p className="text-xs text-gray-600 line-clamp-1 mb-1">{book.author}</p>
        <p className="text-xs text-gray-400 mb-2">{formatDate(book.addedAt)}</p>
        {book.comment && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">💭 {book.comment}</p>
        )}
        <button
          onClick={handleDelete}
          className="w-full py-1 px-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors active:bg-red-700"
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
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`「${book.title}」を削除しますか?`)) {
      onDelete(book.isbn);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}/${day}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center px-3 py-2 gap-2">
        {/* 書籍情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h3 className="font-medium text-sm line-clamp-1 flex-1">{book.title}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(book.addedAt)}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="line-clamp-1">{book.author}</span>
            {book.comment && (
              <span className="line-clamp-1 text-gray-500">💭 {book.comment}</span>
            )}
          </div>
        </div>

        {/* 削除ボタン */}
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors active:bg-red-700 whitespace-nowrap"
        >
          削除
        </button>
      </div>
    </div>
  );
}
