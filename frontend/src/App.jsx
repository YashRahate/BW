import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FlyerGenerator from './Components/FlyerGenerator/FlyerGenerator.jsx';
import ReportGenerator from './Components/ReportGenerator/ReportGenerator.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/flyer" element={<FlyerGenerator />} />
        <Route path="/" element={<ReportGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;
