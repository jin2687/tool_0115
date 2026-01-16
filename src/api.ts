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
    CollateralDetail?: {
      SupportingResource?: Array<{
        ResourceContentType?: string;
        ResourceMode?: string;
        ResourceVersion?: Array<{
          ResourceLink?: string;
        }>;
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

    // 基本情報の取得
    const summary = data.summary;
    const onix = data.onix;

    // タイトルと著者を取得（summaryを優先、なければonix）
    const title = summary?.title ||
      onix?.DescriptiveDetail?.TitleDetail?.TitleElement?.[0]?.TitleText?.content ||
      '不明なタイトル';

    const author = summary?.author ||
      onix?.DescriptiveDetail?.Contributor?.[0]?.PersonName?.content ||
      '不明な著者';

    // 画像URLを取得（複数のソースから試行）
    let coverImage = '';

    // 1. summary.cover を最優先
    if (summary?.cover) {
      coverImage = summary.cover;
      console.log('Cover image from summary:', coverImage);
    }

    // 2. summary に画像がない場合、onix から取得
    if (!coverImage && onix?.CollateralDetail?.SupportingResource) {
      const resources = onix.CollateralDetail.SupportingResource;

      // 表紙画像を探す
      const coverResource = resources.find(
        (r) => r.ResourceContentType === '01' || r.ResourceMode === '03'
      );

      if (coverResource?.ResourceVersion?.[0]?.ResourceLink) {
        coverImage = coverResource.ResourceVersion[0].ResourceLink;
        console.log('Cover image from onix:', coverImage);
      }

      // それでも見つからない場合、最初の画像リソースを使用
      if (!coverImage && resources[0]?.ResourceVersion?.[0]?.ResourceLink) {
        coverImage = resources[0].ResourceVersion[0].ResourceLink;
        console.log('Cover image from first resource:', coverImage);
      }
    }

    const book = {
      isbn: summary?.isbn || isbn,
      title,
      author,
      coverImage,
      addedAt: new Date(),
    };

    console.log('Fetched book info:', book);
    return book;
  } catch (error) {
    console.error('Failed to fetch book info:', error);
    return null;
  }
}
