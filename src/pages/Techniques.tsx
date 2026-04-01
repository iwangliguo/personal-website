import { Link } from 'react-router-dom';
import { getPublicTechniques } from '../data/techniques';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import '../styles/Academic.css';

const Techniques = () => {
  const publicTechniques = getPublicTechniques();
  const { query, setQuery, filtered } = useSearch(publicTechniques, ['title', 'content', 'tags']);
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: filtered,
    itemsPerPage: 6,
  });

  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">术略</h1>
        <p className="page-subtitle">Techniques</p>
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
            <p className="empty-text">{query ? `未找到与「${query}」相关的术略` : '暂无公开的术略'}</p>
          </div>
        ) : (
          <>
            {query && (
              <p className="search-result-count">找到 {filtered.length} 篇术略</p>
            )}
            <div className="diaries-grid">
              {currentItems.map((technique) => (
                <Link to={`/techniques/${technique.id}`} key={technique.id} className="diary-card">
                  {technique.coverImage && (
                    <div className="diary-cover">
                      <img src={technique.coverImage} alt={technique.title} />
                    </div>
                  )}
                  <div className="diary-content">
                    <h3 className="diary-title">{technique.title}</h3>
                    <p className="diary-date">{technique.date}</p>
                    <p className="diary-excerpt">
                      {technique.content.replace(/[#*_`>\[\]()]/g, '').substring(0, 120)}...
                    </p>
                    {technique.tags && technique.tags.length > 0 && (
                      <div className="diary-tags">
                        {technique.tags.map((tag: string, index: number) => (
                          <span key={index} className="diary-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="diary-media-indicator">
                      {technique.images && technique.images.length > 0 && (
                        <span className="media-icon" title="图片">📷</span>
                      )}
                      {technique.videos && technique.videos.length > 0 && (
                        <span className="media-icon" title="视频">🎬</span>
                      )}
                      {technique.audios && technique.audios.length > 0 && (
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

export default Techniques;
