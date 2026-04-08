import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import About from './pages/About';
import Diaries from './pages/Diaries';
import DiaryDetail from './pages/DiaryDetail';
import Publications from './pages/Publications';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Contact from './pages/Contact';
import Techniques from './pages/Techniques';
import TechniqueDetail from './pages/TechniqueDetail';
import './styles/Academic.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/diaries" element={<Diaries />} />
            <Route path="/diaries/:id" element={<DiaryDetail />} />
            <Route path="/techniques" element={<Techniques />} />
            <Route path="/techniques/:id" element={<TechniqueDetail />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} hins wang. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
