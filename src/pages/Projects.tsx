import { Link } from 'react-router-dom';
import { getPublicProjects } from '../data/projects';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useSearch } from '../hooks/useSearch';
import '../styles/Academic.css';

const Projects = () => {
  const projects = getPublicProjects();
  const { query, setQuery, filtered } = useSearch(projects, ['title', 'content', 'tags']);
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: filtered,
    itemsPerPage: 6,
  });

  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">践迹</h1>
        <p className="page-subtitle">Projects</p>
      </header>

      <main>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="搜索项目名称或标签…"
            value={query}
            onChange={e => { setQuery(e.target.value); goToPage(1); }}
          />
          {query && (
            <button className="search-clear" onClick={() => { setQuery(''); goToPage(1); }} aria-label="清除">✕</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">{query ? `未找到与「${query}」相关的项目` : '暂无项目'}</p>
          </div>
        ) : (
          <>
            {query && (
              <p className="search-result-count">找到 {filtered.length} 个项目</p>
            )}
            <div className="diaries-grid">
              {currentItems.map((project) => (
                <Link to={`/projects/${project.id}`} key={project.id} className="diary-card">
                  <div className="diary-content">
                    <h3 className="diary-title">{project.title}</h3>
                    <p className="diary-date">{project.date}</p>
                    <p className="diary-excerpt">
                      {project.content.replace(/[#*_`>\[\]()]/g, '').substring(0, 120)}...
                    </p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="diary-tags">
                        {project.tags.map((tag: string, index: number) => (
                          <span key={index} className="diary-tag">{tag}</span>
                        ))}
                      </div>
                    )}
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

export default Projects;
