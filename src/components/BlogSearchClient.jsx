import { useState, useEffect } from 'react';

// ブログ検索コンポーネント（クライアントサイド）
export default function BlogSearchClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [allBlogs, setAllBlogs] = useState([]);
  const [error, setError] = useState(null);

  // 初期化時にブログデータを取得
  useEffect(() => {
    async function fetchBlogData() {
      try {
        const response = await fetch('/search-data.json');
        if (!response.ok) {
          throw new Error('Failed to load search data');
        }
        const data = await response.json();
        setAllBlogs(data);
      } catch (err) {
        console.error('Error loading search data:', err);
        setError('検索データの読み込みに失敗しました。');
      }
    }

    fetchBlogData();

    // URLからクエリパラメータを取得
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
      performSearch(queryParam);
    }
  }, []);

  // 検索実行関数
  const performSearch = (searchQuery) => {
    setLoading(true);
    setSearched(true);
    
    try {
      // 検索クエリが空の場合
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      // 検索ロジック
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      
      const filteredResults = allBlogs.filter(blog => {
        // タイトル、説明、コンテンツ、カテゴリーを検索対象にする
        const searchableText = [
          blog.title,
          blog.description || '',
          blog.content || '',
          blog.category?.name || ''
        ].join(' ').toLowerCase();
        
        // すべての検索語が含まれているかチェック
        return searchTerms.every(term => searchableText.includes(term));
      });
      
      setResults(filteredResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('検索中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // フォーム送信ハンドラ
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // URLにクエリパラメータを追加（履歴に残す）
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url);
    
    performSearch(query);
  };

  return (
    <div className="blog-search">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ブログ内を検索..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}

      {searched && (
        <div className="mt-4">
          {loading ? (
            <div className="py-4 text-center text-gray-500">
              検索中...
            </div>
          ) : results.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">検索結果 ({results.length}件)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((blog) => (
                  <div key={blog.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <a href={`/blog/${blog.id}`} className="block">
                      {blog.eyecatch ? (
                        <img src={blog.eyecatch} alt={blog.title} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{new Date(blog.publishedAt).toLocaleDateString('ja-JP')}</span>
                          {blog.category && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{blog.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              検索結果がありません。別のキーワードをお試しください。
            </div>
          )}
        </div>
      )}
    </div>
  );
}
