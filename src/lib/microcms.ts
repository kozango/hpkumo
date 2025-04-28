import { createClient } from 'microcms-js-sdk';
import type { MicroCMSQueries, MicroCMSImage, MicroCMSDate, MicroCMSContentId } from 'microcms-js-sdk';

// microCMSクライアントの作成
const isDummyMode = !import.meta.env.MICROCMS_SERVICE_DOMAIN || !import.meta.env.MICROCMS_API_KEY;

if (isDummyMode) {
  console.warn('警告: microCMSの環境変数が設定されていません。ダミーデータを使用します。');
}

// ダミーモードの場合でもエラーを出さないようにする
export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN || 'dummy-domain',
  apiKey: import.meta.env.MICROCMS_API_KEY || 'dummy-key',
});

// カテゴリータイプの定義
export type Category = {
  id: string;
  name: string;
} & MicroCMSContentId & MicroCMSDate;

// ブログ記事タイプの定義
export type Blog = {
  title: string;
  description: string;
  content: string;
  eyecatch?: MicroCMSImage;
  category?: Category;
} & MicroCMSContentId & MicroCMSDate;

// ブログ記事一覧を取得する関数
export const getBlogs = async (queries?: MicroCMSQueries) => {
  return await client.getList<Blog>({
    endpoint: 'blogs',
    queries,
  });
};

// 特定のブログ記事を取得する関数
export const getBlogDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return await client.getListDetail<Blog>({
    endpoint: 'blogs',
    contentId,
    queries,
  });
};

// カテゴリー一覧を取得する関数
export const getCategories = async (queries?: MicroCMSQueries) => {
  return await client.getList<Category>({
    endpoint: 'categories',
    queries,
  });
};

// 特定のカテゴリーを取得する関数
export const getCategoryDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return await client.getListDetail<Category>({
    endpoint: 'categories',
    contentId,
    queries,
  });
};

// カテゴリー別のブログ記事一覧を取得する関数
export const getBlogsByCategory = async (
  categoryId: string,
  queries?: MicroCMSQueries
) => {
  const queriesWithCategory = {
    ...queries,
    filters: `category[equals]${categoryId}`,
  };
  return await getBlogs(queriesWithCategory);
};
