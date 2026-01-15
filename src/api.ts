import axios from 'axios';
import { Book } from './db';

interface OpenBDResponse {
  onix?: {
    DescriptiveDetail?: {
      TitleDetail?: {
        TitleElement?: Array<{
          TitleText?: {
            content?: string;
          };
        }>;
      };
      Contributor?: Array<{
        PersonName?: {
          content?: string;
        };
      }>;
    };
  };
  summary?: {
    isbn?: string;
    title?: string;
    author?: string;
    cover?: string;
  };
}

export async function fetchBookInfo(isbn: string): Promise<Book | null> {
  try {
    const response = await axios.get<OpenBDResponse[]>(
      `https://api.openbd.jp/v1/get?isbn=${isbn}`
    );

    const data = response.data[0];
    if (!data) {
      return null;
    }

    // summary が優先的に利用可能な場合はそちらを使用
    if (data.summary) {
      return {
        isbn: data.summary.isbn || isbn,
        title: data.summary.title || '不明なタイトル',
        author: data.summary.author || '不明な著者',
        coverImage: data.summary.cover || '',
        addedAt: new Date(),
      };
    }

    // onix から情報を取得
    const onix = data.onix;
    const title =
      onix?.DescriptiveDetail?.TitleDetail?.TitleElement?.[0]?.TitleText
        ?.content || '不明なタイトル';
    const author =
      onix?.DescriptiveDetail?.Contributor?.[0]?.PersonName?.content ||
      '不明な著者';

    return {
      isbn,
      title,
      author,
      coverImage: '',
      addedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to fetch book info:', error);
    return null;
  }
}
