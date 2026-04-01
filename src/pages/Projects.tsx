import { useRef, useEffect } from 'react';
import { profileData } from '../data/profile';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useEntryNav } from '../hooks/useEntryNav';
import { useSearch } from '../hooks/useSearch';
import '../styles/Academic.css';

const Projects = () => {
  const projects = profileData.projects;
  const { query, setQuery, filtered } = useSearch(projects, ['title', 'description', 'technologies']);
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: filtered,
    itemsPerPage: 6,
  });
  const { currentIndex, goTo, goPrev, goNext } = useEntryNav({ total: filtered.length });
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const pageIndex = currentIndex % 6;
    const ref = itemRefs.current[pageIndex];
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentIndex]);

  useEffect(() => {
    const targetPage = Math.floor(currentIndex / 6) + 1;
    if (targetPage !== currentPage) goToPage(targetPage);
  }, [currentIndex]);

  const currentPageStartIndex = (currentPage - 1) * 6;

  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">研究项目</h1>
        <p className="page-subtitle">Research Projects</p>
      </header>

      <main>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="搜索项目名称、描述或技术栈…"
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
            {query && <p className="search-result-count">找到 {filtered.length} 个项目</p>}

            <div className="projects-grid">
              {currentItems.map((project, pageIdx) => {
                const globalIndex = currentPageStartIndex + pageIdx;
                const isActive = globalIndex === currentIndex;
                return (
                  <div
                    key={project.id}
                    ref={el => { itemRefs.current[pageIdx] = el; }}
                    className={`project-card${isActive ? ' entry-active' : ''}`}
                    onClick={() => goTo(globalIndex)}
                  >
                    <div className="entry-index-badge">{globalIndex + 1}</div>
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    <div className="project-tech">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                        onClick={e => e.stopPropagation()}
                      >
                        查看详情 →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />

            <nav className="entry-nav entry-nav--list">
              <div className="entry-nav-item entry-nav-prev">
                <button className="entry-nav-btn" onClick={goPrev} disabled={currentIndex === 0}>
                  <span className="entry-nav-label">← 上一个</span>
                  {currentIndex > 0 && (
                    <span className="entry-nav-title">{filtered[currentIndex - 1].title}</span>
                  )}
                </button>
              </div>
              <div className="entry-nav-counter">
                {currentIndex + 1} / {filtered.length}
              </div>
              <div className="entry-nav-item entry-nav-next">
                <button className="entry-nav-btn entry-nav-btn--right" onClick={goNext} disabled={currentIndex === filtered.length - 1}>
                  <span className="entry-nav-label">下一个 →</span>
                  {currentIndex < filtered.length - 1 && (
                    <span className="entry-nav-title">{filtered[currentIndex + 1].title}</span>
                  )}
                </button>
              </div>
            </nav>
          </>
        )}
      </main>
    </div>
  );
};

export default Projects;
