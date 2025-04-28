import { useState, useEffect, useRef } from 'react';

/**
 * 拡張されたブログ検索コンポーネント
 * - 検索候補の表示
 * - 検索履歴の保存
 * - 高度な検索フィルタリング
 * - レスポンシブデザイン
 */
export default function EnhancedBlogSearch({ initialQuery = '', className = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allBlogs, setAllBlogs] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);

  // 初期化時にブログデータと検索履歴を取得
  useEffect(() => {
    async function initialize() {
      try {
        // ブログデータの取得
        const response = await fetch('/search-data.json');
        if (!response.ok) {
          throw new Error('検索データの読み込みに失敗しました');
        }
        const data = await response.json();
        setAllBlogs(data);

        // 検索履歴の取得
        const storedHistory = localStorage.getItem('kumono_search_history');
        if (storedHistory) {
          setSearchHistory(JSON.parse(storedHistory).slice(0, 5));
        }

        // URLからクエリパラメータを取得
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('q');
        if (queryParam) {
          setQuery(queryParam);
        }
      } catch (err) {
        console.error('初期化エラー:', err);
        setError('検索機能の初期化に失敗しました。');
      }
    }

    initialize();

    // クリックイベントのリスナーを追加（サジェスト外クリックで閉じる）
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // サジェスト外クリックの処理
  const handleClickOutside = (e) => {
    if (suggestionRef.current && !suggestionRef.current.contains(e.target) && 
        inputRef.current && !inputRef.current.contains(e.target)) {
      setShowSuggestions(false);
    }
  };

  // クエリ変更時に候補を更新
  useEffect(() => {
    if (query.trim().length > 1 && allBlogs.length > 0) {
      const searchTerm = query.toLowerCase();
      const matchedSuggestions = allBlogs
        .filter(blog => 
          blog.title.toLowerCase().includes(searchTerm) || 
          (blog.category?.name && blog.category.name.toLowerCase().includes(searchTerm))
        )
        .slice(0, 5)
        .map(blog => ({
          id: blog.id,
          title: blog.title,
          category: blog.category?.name || null
        }));
      
      setSuggestions(matchedSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, allBlogs]);

  // 検索実行関数
  const performSearch = () => {
    if (!query.trim()) return;
    
    // 検索ページへリダイレクト
    window.location.href = `/blog/search?q=${encodeURIComponent(query.trim())}`;
    
    // 検索履歴に追加
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('kumono_search_history', JSON.stringify(newHistory));
  };

  // フォーム送信ハンドラ
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // 候補クリックハンドラ
  const handleSuggestionClick = (suggestion) => {
    window.location.href = `/blog/${suggestion.id}`;
  };

  // 検索履歴クリックハンドラ
  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    setShowSuggestions(false);
    window.location.href = `/blog/search?q=${encodeURIComponent(historyItem)}`;
  };

  // 検索履歴削除ハンドラ
  const clearHistory = (e) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('kumono_search_history');
  };

  return (
    <div className={`blog-search relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="ブログ内を検索..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            aria-label="ブログ検索"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
            aria-label="検索"
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

        {/* サジェストと検索履歴 */}
        {showSuggestions && (query.trim().length > 1 || searchHistory.length > 0) && (
          <div 
            ref={suggestionRef}
            className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* 検索候補 */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">
                  候補
                </h3>
                <ul>
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.id}>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <div>
                          <div className="font-medium">{suggestion.title}</div>
                          {suggestion.category && (
                            <div className="text-xs text-gray-500">{suggestion.category}</div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 検索履歴 */}
            {searchHistory.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <div className="flex justify-between items-center px-3 py-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    検索履歴
                  </h3>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    履歴を削除
                  </button>
                </div>
                <ul>
                  {searchHistory.map((item, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleHistoryClick(item)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
