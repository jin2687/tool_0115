import Dexie, { Table } from 'dexie';

export interface Book {
  isbn: string;
  title: string;
  author: string;
  coverImage: string;
  addedAt: Date;
  comment?: string;
  description?: string;
}

export class BooksDatabase extends Dexie {
  books!: Table<Book, string>;

  constructor() {
    super('BooksDatabase');
    this.version(1).stores({
      books: 'isbn, title, author, addedAt',
    });
  }
}

export const db = new BooksDatabase();
