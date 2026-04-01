import { Link } from 'react-router-dom';
import { getPublicDiaries } from '../data/diaries';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import '../styles/Academic.css';

const Diaries = () => {
  const publicDiaries = getPublicDiaries();
  const { query, setQuery, filtered } = useSearch(publicDiaries, ['title', 'content', 'tags']);
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: filtered,
    itemsPerPage: 6,
  });

  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">日记</h1>
        <p className="page-subtitle">Diaries</p>
      </header>

      <main>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="搜索标题、内容或标签…"
            value={query}
            onChange={e => { setQuery(e.target.value); goToPage(1); }}
          />
          {query && (
            <button className="search-clear" onClick={() => { setQuery(''); goToPage(1); }} aria-label="清除">✕</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">{query ? `未找到与「${query}」相关的日记` : '暂无公开的日记'}</p>
          </div>
        ) : (
          <>
            {query && (
              <p className="search-result-count">找到 {filtered.length} 篇日记</p>
            )}
            <div className="diaries-grid">
              {currentItems.map((diary) => (
                <Link to={`/diaries/${diary.id}`} key={diary.id} className="diary-card">
                  {diary.coverImage && (
                    <div className="diary-cover">
                      <img src={diary.coverImage} alt={diary.title} />
                    </div>
                  )}
                  <div className="diary-content">
                    <h3 className="diary-title">{diary.title}</h3>
                    <p className="diary-date">{diary.date}</p>
                    <p className="diary-excerpt">
                      {diary.content.replace(/[#*_`>\[\]()]/g, '').substring(0, 120)}...
                    </p>
                    {diary.tags && diary.tags.length > 0 && (
                      <div className="diary-tags">
                        {diary.tags.map((tag: string, index: number) => (
                          <span key={index} className="diary-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="diary-media-indicator">
                      {diary.images && diary.images.length > 0 && (
                        <span className="media-icon" title="图片">📷</span>
                      )}
                      {diary.videos && diary.videos.length > 0 && (
                        <span className="media-icon" title="视频">🎬</span>
                      )}
                      {diary.audios && diary.audios.length > 0 && (
                        <span className="media-icon" title="音频">🎵</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Diaries;
