import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import STLViewer from './STLViewer_updated';  // Importing the STLViewer component

const App: React.FC = () => {
  // State to hold the satellite data
  const [satelliteData, setSatelliteData] = useState<string[]>([]);

  useEffect(() => {
    // Fetch .txt data from the public folder
    fetch('/satellite_trajectory_data.txt') // Update to the correct file path
      .then(response => response.text())
      .then(text => {
        // Split text data into rows and set the rows as satelliteData
        const lines = text.split('\n');
        setSatelliteData(lines); // Set the lines as satelliteData
      });
  }, []);

  return (
    <div>
      <header style={{ textAlign: 'center', padding: '20px' }}>
        <h1>ANT61 Beacon Satellite Detection</h1>
        {/* Button to navigate to another page */}
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
        {/* STL model viewer with satellite data */}
        <STLViewer satelliteData={satelliteData} />
      </div>
    </div>
  );
};

export default App;
