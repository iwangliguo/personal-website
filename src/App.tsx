import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { profileData } from './data/profile';
import Navbar from './components/Navbar';
import About from './pages/About';
import Diaries from './pages/Diaries';
import DiaryDetail from './pages/DiaryDetail';
import Publications from './pages/Publications';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
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
            <Route path="/publications" element={<Publications />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} {profileData.name}. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
