// src/App.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import STLViewer from './STLViewer';  // Assuming you have this for your model viewer

const App: React.FC = () => {
  return (
    <div>
      <header style={{ textAlign: 'center', padding: '20px' }}>
        <h1>ANT61 Beacon Satellite Detection</h1>
        {/* Adjust button position */}
        <div style={{
          position: 'absolute',
          top: '50px',  // Distance from the top
          right: '40px',  // Distance from the right edge
        }}>
          <Link to="/work-in-progress">
            <button style={{ padding: '10px 20px', fontSize: '16px' }}>Go to WIP</button>
          </Link>
        </div>
      </header>
      <div style={{ height: '100vh', backgroundColor: 'black' }}>
        {/* STL model viewer */}
        <STLViewer />
      </div>
    </div>
  );
};

export default App;
