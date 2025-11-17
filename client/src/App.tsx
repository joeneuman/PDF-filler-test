import { Routes, Route, Navigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import BuilderPage from './pages/BuilderPage';
import FillerPage from './pages/FillerPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/builder/:pdfId" element={<BuilderPage />} />
        <Route path="/f/:pdfId" element={<FillerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

