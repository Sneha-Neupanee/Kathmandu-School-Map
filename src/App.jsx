import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SchoolAtlasTour from './components/SchoolAtlasTour';
import MapPage from './MapPage.jsx';
import Dashboard from './Dashboard.jsx';

export default function App() {
  const [showTour, setShowTour] = useState(true);

  const handleCloseTour = () => {
    setShowTour(false);
  };

  return (
    <>
      {showTour && <SchoolAtlasTour onClose={handleCloseTour} />}
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}
