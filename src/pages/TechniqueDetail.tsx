import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getTechniqueById, getPublicTechniques } from '../data/techniques';
import '../styles/Academic.css';

const TechniqueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const technique = getTechniqueById(Number(id));
  const allTechniques = getPublicTechniques();
  const currentIndex = allTechniques.findIndex(t => t.id === Number(id));
  const prevTechnique = currentIndex > 0 ? allTechniques[currentIndex - 1] : null;
  const nextTechnique = currentIndex < allTechniques.length - 1 ? allTechniques[currentIndex + 1] : null;

  if (!technique) {
    return (
      <div className="container fade-in">
        <div className="empty-state">
          <p className="empty-text">未找到该技术总结</p>
          <Link to="/techniques" className="back-link">← 返回术略列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">{technique.title}</h1>
        <p className="page-subtitle">{new Date(technique.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      <main>
        {technique.tags && technique.tags.length > 0 && (
          <div className="diary-tags" style={{ marginBottom: '1rem' }}>
            {technique.tags.map((tag: string, index: number) => (
              <span key={index} className="diary-tag">{tag}</span>
            ))}
          </div>
        )}

        <article className="diary-detail-content">
          <ReactMarkdown>{technique.content}</ReactMarkdown>
        </article>

        <div className="entry-nav">
          <div className="entry-nav-item entry-nav-prev">
            {prevTechnique ? (
              <Link to={`/techniques/${prevTechnique.id}`} className="entry-nav-btn">
                <span className="entry-nav-label">← 技术总结</span>
                <span className="entry-nav-title">{prevTechnique.title}</span>
              </Link>
            ) : (
              <span className="entry-nav-btn entry-nav-btn--disabled">
                <span className="entry-nav-label">← 术略</span>
                <span className="entry-nav-title">没有了</span>
              </span>
            )}
          </div>
          <div className="entry-nav-counter">
            {currentIndex + 1} / {allTechniques.length}
          </div>
          <div className="entry-nav-item entry-nav-next">
            {nextTechnique ? (
              <Link to={`/techniques/${nextTechnique.id}`} className="entry-nav-btn entry-nav-btn--right">
                <span className="entry-nav-label">技术总结 →</span>
                <span className="entry-nav-title">{nextTechnique.title}</span>
              </Link>
            ) : (
              <span className="entry-nav-btn entry-nav-btn--disabled entry-nav-btn--right">
                <span className="entry-nav-label">术略 →</span>
                <span className="entry-nav-title">没有了</span>
              </span>
            )}
          </div>
        </div>

        <div className="back-to-list">
          <Link to="/techniques" className="back-link">← 返回技术总结列表</Link>
        </div>
      </main>
    </div>
  );
};

export default TechniqueDetail;
