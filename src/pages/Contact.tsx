import { profileData } from '../data/profile';
import '../styles/Academic.css';

const Contact = () => {
  return (
    <div className="container fade-in">
      <header className="page-header">
        <h1 className="page-title">联系方式</h1>
        <p className="page-subtitle">Contact Information</p>
      </header>

      <main className="contact-section">
        <div className="contact-info">
          <div className="contact-item">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
            <span>{profileData.email}</span>
          </div>

          <div className="contact-item">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            <span>{profileData.institution}</span>
          </div>
        </div>

        <div className="social-links">
          {profileData.socialLinks.github && (
            <a 
              href={profileData.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="social-label">GitHub</span>
            </a>
          )}

          {profileData.socialLinks.googleScholar && (
            <a 
              href={profileData.socialLinks.googleScholar}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12.001 1.998l-9.001 9.005 9.001 9.005 9.001-9.005-9.001-9.005zm0 2.828l5.172 5.172-5.172 5.172-5.172-5.172 5.172-5.172zm-7.778 7.778l1.414-1.414 5.172 5.172-5.172 5.172-1.414-1.414 5.172-5.172-5.172-5.172zm12.956 0l-5.172 5.172 5.172 5.172 1.414-1.414-5.172-5.172 5.172-5.172-1.414-1.414z"/>
              </svg>
              <span className="social-label">Google Scholar</span>
            </a>
          )}

          {profileData.socialLinks.csdn && (
            <a 
              href={profileData.socialLinks.csdn}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z"/>
              </svg>
              <span className="social-label">CSDN</span>
            </a>
          )}
        </div>
      </main>
    </div>
  );
};

export default Contact;
