import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

interface STLViewerProps {
  satelliteData: string[];
}

const STLViewer: React.FC<STLViewerProps> = ({ satelliteData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  let stlMesh: THREE.Mesh | undefined;

  function parseSatelliteData(data: string) {
    const locationMatch = data.match(/L\[(\-?\d+\.\d+),(\-?\d+\.\d+),(\-?\d+\.\d+)\]/);
    const rotationMatch = data.match(/R\[(\-?\d+\.\d+),(\-?\d+\.\d+),(\-?\d+\.\d+)\]/);
    
    if (locationMatch && rotationMatch) {
      const latitude = parseFloat(locationMatch[1]);
      const longitude = parseFloat(locationMatch[2]);
      const altitude = parseFloat(locationMatch[3]);

      const yaw = parseFloat(rotationMatch[1]);
      const pitch = parseFloat(rotationMatch[2]);
      const roll = parseFloat(rotationMatch[3]);

      const R = 6371;
      const latRad = latitude * (Math.PI / 180);
      const lonRad = longitude * (Math.PI / 180);

      const x = (R + altitude) * Math.cos(latRad) * Math.cos(lonRad);
      const y = (R + altitude) * Math.cos(latRad) * Math.sin(lonRad);
      const z = (R + altitude) * Math.sin(latRad);

      return { position: { x, y, z }, rotation: { yaw, pitch, roll } };
    }

    return null;
  }

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);  // Set background to black

    if (mountRef.current && mountRef.current.childNodes.length === 0) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);  // Strong ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);  // Strong directional light
    directionalLight.position.set(0, 0, 1).normalize();
    scene.add(directionalLight);

    const loader = new STLLoader();
    loader.load('/model.stl', (geometry) => {
      const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });  // Red color
      stlMesh = new THREE.Mesh(geometry, material);
      stlMesh.scale.set(5, 5, 5);  // Increase scale
      stlMesh.position.set(0, 0, 0);  // Center the model
      scene.add(stlMesh);
      console.log('STL model loaded and added to the scene.');
    });

    let currentIndex = 0;

    const updateModel = () => {
      if (stlMesh && currentIndex < satelliteData.length) {
        const parsedData = parseSatelliteData(satelliteData[currentIndex]);

        if (parsedData) {
          const { position, rotation } = parsedData;

          // Restrict position values to keep the model in view
          const x = Math.min(Math.max(position.x, -500), 500);
          const y = Math.min(Math.max(position.y, -500), 500);
          const z = Math.min(Math.max(position.z, 0), 1000);

          stlMesh.position.set(x, y, z);

          // Restrict rotation values to keep the model oriented
          stlMesh.rotation.set(
            THREE.MathUtils.degToRad(Math.min(Math.max(rotation.pitch, -90), 90)),
            THREE.MathUtils.degToRad(Math.min(Math.max(rotation.yaw, -180), 180)),
            THREE.MathUtils.degToRad(Math.min(Math.max(rotation.roll, -90), 90))
          );
          console.log('Updated position:', stlMesh.position);
          console.log('Updated rotation:', stlMesh.rotation);
        }

        currentIndex += 1;
      }
    };

    const interval = setInterval(updateModel, 1000);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      console.log('Rendering frame');  // Add logging for each frame
    };

    animate();

    return () => {
      clearInterval(interval);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [satelliteData]);

  return <div ref={mountRef} />;
};

export default STLViewer;
