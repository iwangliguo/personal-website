import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getProjectById, getPublicProjects } from '../data/projects';
import '../styles/Academic.css';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(Number(id));
  const allProjects = getPublicProjects();
  const currentIndex = allProjects.findIndex(p => p.id === Number(id));
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  if (!project) {
    return (
      <div className="container fade-in">
        <div className="empty-state">
          <p className="empty-text">未找到该项目</p>
          <Link to="/projects" className="back-link">← 返回践迹列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">{project.title}</h1>
        <p className="page-subtitle">{project.date}</p>
      </header>

      <main>
        {project.tags && project.tags.length > 0 && (
          <div className="diary-tags" style={{ marginBottom: '1rem' }}>
            {project.tags.map((tag: string, index: number) => (
              <span key={index} className="diary-tag">{tag}</span>
            ))}
          </div>
        )}

        <article className="diary-detail-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {project.content}
          </ReactMarkdown>
        </article>

        <div className="entry-nav">
          <div className="entry-nav-item entry-nav-prev">
            {prevProject ? (
              <Link to={`/projects/${prevProject.id}`} className="entry-nav-btn">
                <span className="entry-nav-label">← 践迹</span>
                <span className="entry-nav-title">{prevProject.title}</span>
              </Link>
            ) : (
              <span className="entry-nav-btn entry-nav-btn--disabled">
                <span className="entry-nav-label">← 践迹</span>
                <span className="entry-nav-title">没有了</span>
              </span>
            )}
          </div>
          <div className="entry-nav-counter">
            {currentIndex + 1} / {allProjects.length}
          </div>
          <div className="entry-nav-item entry-nav-next">
            {nextProject ? (
              <Link to={`/projects/${nextProject.id}`} className="entry-nav-btn entry-nav-btn--right">
                <span className="entry-nav-label">践迹 →</span>
                <span className="entry-nav-title">{nextProject.title}</span>
              </Link>
            ) : (
              <span className="entry-nav-btn entry-nav-btn--disabled entry-nav-btn--right">
                <span className="entry-nav-label">践迹 →</span>
                <span className="entry-nav-title">没有了</span>
              </span>
            )}
          </div>
        </div>

        <div className="back-to-list">
          <Link to="/projects" className="back-link">← 返回践迹列表</Link>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
