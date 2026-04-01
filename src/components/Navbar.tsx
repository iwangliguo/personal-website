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
              自叙
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/diaries" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              日札
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/techniques" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              术略
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/publications" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              论稿
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/projects" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              践迹
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              寄言
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
