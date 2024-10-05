import React from 'react';
import { createRoot } from 'react-dom/client'; // React 18 new API
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import WorkInProgress from './WorkInProgress';

const container = document.getElementById('root');
const root = createRoot(container!); // Use createRoot

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/work-in-progress" element={<WorkInProgress />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

