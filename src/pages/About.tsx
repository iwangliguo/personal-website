import { useState } from 'react';
import { profileData } from '../data/profile';
import DifyChatbot from '../components/DifyChatbot';
import '../styles/Academic.css';

const About = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">{profileData.name}</h1>
        <p className="page-subtitle">{profileData.title} | {profileData.institution}</p>
      </header>

      <main>
        <section className="about-section">
          <div className="profile-photo">
            <div 
              className="profile-photo-container"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img 
                src="/photo1.jpg"
                alt={`${profileData.name} 的照片 1`}
                className={`profile-image ${isHovered ? 'image-hide' : 'image-show'}`}
              />
              <img 
                src="/photo2.jpg"
                alt={`${profileData.name} 的照片 2`}
                className={`profile-image image-overlay ${isHovered ? 'image-show' : 'image-hide'}`}
              />
            </div>
            
            {/* Talk to hins */}
            <DifyChatbot />
          </div>

          <div className="profile-info">
            <h2>个人简介</h2>
            <p className="bio">{profileData.bio}</p>

            {/* 工作经历 */}
            <div className="education-section">
              <h3 className="section-title">工作经历</h3>
              <ul className="education-list">
                {profileData.workExperience.map((work, index) => (
                  <li key={index} className="education-item">
                    <h4>{work.institution}</h4>
                    <p className="degree-field">{work.degree} - {work.field}</p>
                    <p className="year">{work.year}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* 教育背景 */}
            <div className="education-section">
              <h3 className="section-title">教育背景</h3>
              <ul className="education-list">
                {profileData.education.map((edu, index) => (
                  <li key={index} className="education-item">
                    <h4>{edu.institution}</h4>
                    <p className="degree-field">{edu.degree} - {edu.field}</p>
                    <p className="year">{edu.year}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* 研究兴趣 */}
            <div className="research-interests">
              <h3 className="section-title">研究兴趣</h3>
              <div className="interest-tags">
                {profileData.researchInterests.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* 技能 */}
            <div className="skills-section">
              <h3 className="section-title">专业技能</h3>
              <div className="skill-tags">
                {profileData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
