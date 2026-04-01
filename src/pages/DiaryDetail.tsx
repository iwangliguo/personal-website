import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getDiaryById, getPublicDiaries } from '../data/diaries';
import '../styles/Academic.css';

// 格式化日期：只显示到日期（YYYY-MM-DD）
const formatDate = (dateStr: string) => {
  return dateStr.split('T')[0];
};

const VIDEO_EXTS = ['.mp4', '.webm', '.ogg', '.mov'];
const AUDIO_EXTS = ['.mp3', '.ogg', '.wav', '.m4a', '.aac', '.flac'];

function getExt(src: string) {
  return src.split('?')[0].toLowerCase().slice(src.lastIndexOf('.'));
}

// 将 style 字符串（如 "zoom:33%; color:red"）转为 React style 对象
function parseStyleStr(styleStr?: string): React.CSSProperties | undefined {
  if (!styleStr) return undefined;
  return styleStr.split(';').reduce((acc, decl) => {
    const [prop, val] = decl.split(':').map(s => s.trim());
    if (!prop || !val) return acc;
    // zoom → zoom（React 支持），其余 kebab-case → camelCase
    const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return { ...acc, [camel]: val };
  }, {} as React.CSSProperties);
}

type ImgProps = React.ImgHTMLAttributes<HTMLImageElement> & { src?: string; alt?: string };

function InlineImage(props: ImgProps) {
  const { src, alt, style, ...rest } = props;
  if (!src) return null;
  const ext = getExt(src);

  // style 可能是字符串（来自原始 HTML）或对象（React 正常传值）
  const styleObj: React.CSSProperties | undefined =
    typeof style === 'string' ? parseStyleStr(style) : style;

  if (VIDEO_EXTS.includes(ext)) {
    return (
      <span className="inline-media inline-video">
        <video controls preload="metadata" style={styleObj} {...(rest as object)}>
          <source src={src} />
          您的浏览器不支持视频播放
        </video>
        {alt && <span className="inline-media-caption">{alt}</span>}
      </span>
    );
  }

  if (AUDIO_EXTS.includes(ext)) {
    return (
      <span className="inline-media inline-audio">
        <audio controls preload="metadata" style={styleObj}>
          <source src={src} />
          您的浏览器不支持音频播放
        </audio>
        {alt && <span className="inline-media-caption">{alt}</span>}
      </span>
    );
  }

  return (
    <span className="inline-media inline-image">
      <img src={src} alt={alt ?? ''} loading="lazy" style={styleObj} {...rest} />
      {alt && <span className="inline-media-caption">{alt}</span>}
    </span>
  );
}

const DiaryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const diary = getDiaryById(Number(id));
  const publicDiaries = getPublicDiaries();

  const sortedDiaries = [...publicDiaries].sort((a, b) => a.id - b.id);
  const currentIndex = sortedDiaries.findIndex(d => d.id === Number(id));
  const prevDiary = currentIndex > 0 ? sortedDiaries[currentIndex - 1] : null;
  const nextDiary = currentIndex < sortedDiaries.length - 1 ? sortedDiaries[currentIndex + 1] : null;

  if (!diary) {
    return (
      <div className="container fade-in">
        <div className="empty-state">
          <h2 className="page-title">日记未找到</h2>
          <p className="empty-text">这篇日记不存在或已被删除</p>
          <Link to="/diaries" className="back-link">← 返回日记列表</Link>
        </div>
      </div>
    );
  }

  if (!diary.isPublic) {
    return (
      <div className="container fade-in">
        <div className="empty-state">
          <h2 className="page-title">私人日记</h2>
          <p className="empty-text">这是一篇私人日记，不对外公开</p>
          <Link to="/diaries" className="back-link">← 返回日记列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <main className="diary-detail">
        <Link to="/diaries" className="back-link">← 返回日记列表</Link>

        <article className="diary-article">
          <header className="diary-header">
            <h1 className="diary-detail-title">{diary.title}</h1>
            <p className="diary-detail-date">{formatDate(diary.date)}</p>
            {diary.tags && diary.tags.length > 0 && (
              <div className="diary-tags">
                {diary.tags.map((tag: string, index: number) => (
                  <span key={index} className="diary-tag">{tag}</span>
                ))}
              </div>
            )}
          </header>

          {diary.coverImage && (
            <div className="diary-cover-large">
              <img src={diary.coverImage} alt={diary.title} />
            </div>
          )}

          <div className="diary-detail-content markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{ img: (props) => <InlineImage {...props} /> }}
            >
              {diary.content}
            </ReactMarkdown>
          </div>

          {diary.images && diary.images.length > 0 && (
            <section className="diary-media-section">
              <h3 className="media-section-title">📷 图片</h3>
              <div className="diary-images-grid">
                {diary.images.map((img, index) => (
                  <div key={index} className="diary-image-item">
                    <img src={img} alt={`日记图片 ${index + 1}`} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {diary.videos && diary.videos.length > 0 && (
            <section className="diary-media-section">
              <h3 className="media-section-title">🎬 视频</h3>
              <div className="diary-videos-grid">
                {diary.videos.map((video: string, index: number) => (
                  <div key={index} className="diary-video-item">
                    <video controls>
                      <source src={video} type="video/mp4" />
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                ))}
              </div>
            </section>
          )}

          {diary.audios && diary.audios.length > 0 && (
            <section className="diary-media-section">
              <h3 className="media-section-title">🎵 音频</h3>
              <div className="diary-audios-grid">
                {diary.audios.map((audio: string, index: number) => (
                  <div key={index} className="diary-audio-item">
                    <audio controls>
                      <source src={audio} type="audio/mpeg" />
                      您的浏览器不支持音频播放
                    </audio>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* 上一篇 / 下一篇导航 */}
        <nav className="entry-nav">
          <div className="entry-nav-item entry-nav-prev">
            {prevDiary ? (
              <Link to={`/diaries/${prevDiary.id}`} className="entry-nav-link">
                <span className="entry-nav-label">← 上一篇</span>
                <span className="entry-nav-title">{prevDiary.title}</span>
                <span className="entry-nav-date">{formatDate(prevDiary.date)}</span>
              </Link>
            ) : (
              <span className="entry-nav-disabled">已是第一篇</span>
            )}
          </div>
          <div className="entry-nav-divider" />
          <div className="entry-nav-item entry-nav-next">
            {nextDiary ? (
              <Link to={`/diaries/${nextDiary.id}`} className="entry-nav-link entry-nav-link--right">
                <span className="entry-nav-label">下一篇 →</span>
                <span className="entry-nav-title">{nextDiary.title}</span>
                <span className="entry-nav-date">{formatDate(nextDiary.date)}</span>
              </Link>
            ) : (
              <span className="entry-nav-disabled entry-nav-disabled--right">已是最后一篇</span>
            )}
          </div>
        </nav>
      </main>
    </div>
  );
};

export default DiaryDetail;
