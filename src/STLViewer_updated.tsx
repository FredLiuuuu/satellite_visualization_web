import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// Define the interface for parsed data
interface ParsedData {
  messageId: string;
  date: Date;  // Date as JavaScript Date object
  position: { x: number; y: number; z: number };
  rotation: { yaw: number; pitch: number; roll: number };
}

const STLViewer: React.FC<{ satelliteData: string[] }> = ({ satelliteData }) => {
  const mountRef = useRef<HTMLDivElement>(null);  // Ref for the 3D canvas
  let stlMesh: THREE.Mesh | undefined;  // Mesh for the STL model
  let sphere: THREE.Mesh | undefined;  // For storing the central sphere object

  const [currentData, setCurrentData] = useState<ParsedData | null>(null);  // Store current parsed data for display

  // Function to parse the satellite data including Message ID and Date
  const parseSatelliteData = (data: string): ParsedData | null => {
    const messageIdMatch = data.match(/Message\s(\d+)/);
    const locationMatch = data.match(/L\[(\-?\d+\.\d+),(\-?\d+\.\d+),(\d+\.\d+)\]/);
    const rotationMatch = data.match(/R\[(\-?\d+\.\d+),(\-?\d+\.\d+),(\-?\d+\.\d+)\]/);
    const dateMatch = data.match(/RD\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\]/);  // Extract date-time

    if (messageIdMatch && locationMatch && rotationMatch && dateMatch) {
      const messageId = messageIdMatch[1];

      // Parse the date into a JavaScript Date object
      const date = new Date(dateMatch[1]);

      const location = {
        latitude: parseFloat(locationMatch[1]),
        longitude: parseFloat(locationMatch[2]),
        altitude: parseFloat(locationMatch[3]),
      };
      const rotation = {
        yaw: parseFloat(rotationMatch[1]),
        pitch: parseFloat(rotationMatch[2]),
        roll: parseFloat(rotationMatch[3]),
      };

      // Convert lat/lon/alt to Cartesian coordinates
      const latRad = location.latitude * (Math.PI / 180);
      const lonRad = location.longitude * (Math.PI / 180);
      const R = 6371;  // Approximate Earth's radius in km
      const x = (R + location.altitude) * Math.sin(latRad) * Math.sin(lonRad);
      const y = (R + location.altitude) * Math.sin(latRad) * Math.cos(lonRad);
      const z = (R + location.altitude) * Math.cos(latRad);

      return { messageId, date, position: { x, y, z }, rotation };
    }

    return null;
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 0, 1500);  // Move camera farther away to view larger objects

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);  // Set background to black

    if (mountRef.current && mountRef.current.childNodes.length === 0) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);  // Strong ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);  // Strong directional light
    directionalLight.position.set(0, 500, 500).normalize();  // Position the light above and to the side
    scene.add(directionalLight);

    // Create a sphere at the center of the scene
    // 创建一个球体并将其设置为地球
   // 加载器
   const textureLoader = new THREE.TextureLoader();

// 地球纹理
   const earthTexture = textureLoader.load('/earth.jpg');
   earthTexture.wrapS = THREE.RepeatWrapping;
   earthTexture.repeat.x = 1; 
   earthTexture.offset.set(0.25, 0);  // 根据需要调整偏移值
   

// 创建地球
   const earthGeometry = new THREE.SphereGeometry(1000, 32, 32);
   const earthMaterial = new THREE.MeshStandardMaterial({
     map: earthTexture,
     
     color: 0xffffff,  // 白色地球（可以调整）
     metalness: 0.4,
     roughness: 0.6
});
   const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
   scene.add(earthMesh);

// 星空背景
   const starTexture = textureLoader.load('/stars.jpg');
   const starGeometry = new THREE.SphereGeometry(3000, 64, 64);
   const starMaterial = new THREE.MeshBasicMaterial({
     map: starTexture,
     side: THREE.BackSide // 反向球体，显示在球体内部
});
   const starMesh = new THREE.Mesh(starGeometry, starMaterial);
   scene.add(starMesh);



   


  // Create OrbitControls for dragging
   const controls = new OrbitControls(camera, renderer.domElement);
   controls.enableDamping = true;  // Enable damping for smooth controls
   controls.dampingFactor = 0.05;

    const loader = new STLLoader();
    loader.load('/model.stl', (geometry) => {
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });  // Red color
      stlMesh = new THREE.Mesh(geometry, material);
      
      // Set an initial scale to ensure the model is visible
      stlMesh.scale.set(1, 1, 1);  // Increase scale significantly
      stlMesh.position.set(0, 0, 0);  // Center the model in the scene
      scene.add(stlMesh);
      console.log('STL model loaded and added to the scene.');
    });

    let currentIndex = 0;

    const updateModel = () => {
      if (stlMesh && currentIndex < satelliteData.length) {
        const parsedData = parseSatelliteData(satelliteData[currentIndex]);

        if (parsedData) {
          const { position, rotation, messageId, date } = parsedData;

          // Update state with the current parsed data for display
          setCurrentData(parsedData);

          // Log parsed data to ensure it's being processed
          console.log("Message ID:", messageId);
          console.log("Date:", date);
          console.log("Updating model position:", position);
          console.log("Updating model rotation:", rotation);

          // Set the position and rotation of the STL model
          stlMesh.position.set(position.x/6, position.y/6, position.z/6);
          stlMesh.rotation.set(
            THREE.MathUtils.degToRad(rotation.pitch),
            THREE.MathUtils.degToRad(rotation.yaw),
            THREE.MathUtils.degToRad(rotation.roll)
          );

          currentIndex += 1;  // Move to the next data point
        }
      } else {
        currentIndex = 0;  // Reset to loop over the data
      }
    };

    const interval = setInterval(updateModel, 100);  // Update every second

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();  // Update controls on each frame
      console.log("Rendering scene...");  // Log to ensure the animation loop is running
      function animate() {
        requestAnimationFrame(animate);
      
        // 旋转地球和云层
        earthMesh.rotation.y += 0;
        //cloudMesh.rotation.y += 0.0015;
      
        renderer.render(scene, camera);
      }
      
      animate();
      
    };

    animate();

    return () => {
      clearInterval(interval);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [satelliteData]);

  return (
    <div>
      <div ref={mountRef} style={{ height: '90vh' }} />
      
      {/* Data table displaying current data */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '10px', borderRadius: '5px' }}>
        {currentData ? (
          <table>
            <thead>
              <tr>
                <th style={{ fontSize: '29px' }}>Date</th>
                <th style={{ fontSize: '29px' }}>Position (x, y, z)</th>
                <th style={{ fontSize: '29px' }}>Rotation (yaw, pitch, roll)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontSize: '28px' }}>{currentData.date.toLocaleString()}</td>
                <td style={{ fontSize: '28px' }}>{`(${currentData.position.x.toFixed(2)}, ${currentData.position.y.toFixed(2)}, ${currentData.position.z.toFixed(2)})`}</td>
                <td style={{ fontSize: '28px' }}>{`(${currentData.rotation.yaw.toFixed(2)}, ${currentData.rotation.pitch.toFixed(2)}, ${currentData.rotation.roll.toFixed(2)})`}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: '30px' }}>No data available</p>
        )}
      </div>

      {/* Visualize Message ID and Date below the 3D model */}
      <div style={{ textAlign: 'center', color: 'white', paddingTop: '10px', fontSize: '18px' }}>
        {currentData ? (
          <>
            <p><strong>Message ID:</strong> {currentData.messageId}</p>
            <p><strong>Date:</strong> {currentData.date.toLocaleString()}</p>
          </>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default STLViewer;
