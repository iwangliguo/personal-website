import { NavLink } from 'react-router-dom';
import '../styles/Academic.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <NavLink to="/" className="navbar-brand">
          不成熟的理想主义者会为理想悲壮地死去
        </NavLink>
        <ul className="navbar-nav">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              关于我
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/diaries" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              日记
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/publications" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              发表论文
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/projects" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              研究项目
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              联系方式
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
