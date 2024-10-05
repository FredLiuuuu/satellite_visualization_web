import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import WorkInProgress from './WorkInProgress';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/work-in-progress" element={<WorkInProgress />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
