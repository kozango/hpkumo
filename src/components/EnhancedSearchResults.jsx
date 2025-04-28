import { useState, useEffect } from 'react';

/**
 * 拡張された検索結果表示コンポーネント
 * - 高度なフィルタリング機能
 * - ソート機能
 * - カテゴリーフィルター
 * - レスポンシブデザイン
 */
export default function EnhancedSearchResults({ query = '' }) {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('relevance');
  const [searchMetrics, setSearchMetrics] = useState({
    totalResults: 0,
    searchTime: 0,
    hasResults: false
  });

  // 初期化時にブログデータを取得
  useEffect(() => {
    const startTime = performance.now();
    
    async function fetchSearchData() {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/search-data.json');
        if (!response.ok) {
          throw new Error('検索データの読み込みに失敗しました');
        }
        
        const data = await response.json();
        
        // 検索ロジック
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        const searchResults = data.filter(blog => {
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

        // 関連性スコアを計算
        const scoredResults = searchResults.map(blog => {
          let score = 0;
          const title = blog.title.toLowerCase();
          const description = (blog.description || '').toLowerCase();
          
          // タイトルに検索語が含まれる場合、スコアを高く
          searchTerms.forEach(term => {
            if (title.includes(term)) score += 10;
            if (description.includes(term)) score += 5;
          });
          
          // 完全一致の場合はさらにスコアアップ
          if (title === query.toLowerCase()) score += 50;
          
          return { ...blog, relevanceScore: score };
        });

        // カテゴリーリストを抽出
        const uniqueCategories = [...new Set(
          scoredResults
            .filter(blog => blog.category)
            .map(blog => blog.category.name)
        )];
        
        setCategories(uniqueCategories);
        setResults(scoredResults);
        setFilteredResults(scoredResults);
        
        const endTime = performance.now();
        setSearchMetrics({
          totalResults: scoredResults.length,
          searchTime: ((endTime - startTime) / 1000).toFixed(2),
          hasResults: scoredResults.length > 0
        });
      } catch (err) {
        console.error('検索エラー:', err);
        setError('検索中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }

    fetchSearchData();
  }, [query]);

  // フィルタリングとソートを適用
  useEffect(() => {
    if (results.length === 0) return;

    let filtered = [...results];
    
    // カテゴリーフィルタリング
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog => 
        blog.category && blog.category.name === selectedCategory
      );
    }
    
    // ソート
    switch (sortOption) {
      case 'relevance':
        filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
        break;
      default:
        filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    setFilteredResults(filtered);
  }, [results, selectedCategory, sortOption]);

  // 日付のフォーマット
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">検索結果を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4">
        <h3 className="text-red-600 font-medium mb-2">エラーが発生しました</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-600">検索キーワードを入力してください</p>
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-600 mb-4">
          「{query}」に一致する記事は見つかりませんでした
        </p>
        <p className="text-gray-500 text-sm mb-6">
          別のキーワードで検索するか、カテゴリーから記事を探してください
        </p>
        <a href="/blog" className="text-primary hover:underline">ブログトップに戻る</a>
      </div>
    );
  }

  return (
    <div className="search-results">
      {/* 検索メトリクス */}
      <div className="mb-6 pb-4 border-b">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-medium">
              「<span className="text-primary">{query}</span>」の検索結果
            </h2>
            <p className="text-sm text-gray-500">
              {searchMetrics.totalResults}件の記事が見つかりました（{searchMetrics.searchTime}秒）
            </p>
          </div>
          
          {/* フィルターとソートコントロール */}
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">すべてのカテゴリー</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="relevance">関連性順</option>
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
            </select>
          </div>
        </div>
      </div>

      {/* 検索結果リスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResults.map((blog) => (
          <a 
            key={blog.id} 
            href={`/blog/${blog.id}`}
            className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="relative h-48 overflow-hidden">
              {blog.eyecatch ? (
                <img 
                  src={blog.eyecatch} 
                  alt={blog.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              {blog.category && (
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary">
                  {blog.category.name}
                </span>
              )}
            </div>
            
            <div className="flex-1 p-5">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{blog.title}</h3>
              {blog.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{blog.description}</p>
              )}
              <div className="mt-auto pt-3 flex items-center text-xs text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
