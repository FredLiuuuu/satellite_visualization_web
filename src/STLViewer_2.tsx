import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'; // Import STLLoader

const STLViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    // Step 8: Add a test cube to the scene
     const geometry = new THREE.BoxGeometry(10, 10, 10);
     const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
     const cube = new THREE.Mesh(geometry, material);
     scene.add(cube);

     // Load STL file using STLLoader
     const loader = new STLLoader();
     loader.load(`${window.location.origin}/model.stl`, (geometry) => {
        console.log('STL file loaded:', geometry);
      
        const stlMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x111111, shininess: 200 });
        const stlMesh = new THREE.Mesh(geometry, stlMaterial);
        scene.add(stlMesh);
      
        const center = new THREE.Vector3();
        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
          geometry.boundingBox.getCenter(center);
          stlMesh.position.sub(center);
        }
      
        stlMesh.scale.set(0.1, 0.1, 0.1);  // 根据需要调整缩放
      }, undefined, (error: unknown) => {
        // Type assertion to convert `unknown` type to `Error`
        const typedError = error as Error;
        console.error('Error loading STL file:', typedError);
        console.error(`Error details: ${typedError.message}`);
      });

    // Animate function with a recursive loop to continuously render the scene
    const animate = () => {
      requestAnimationFrame(animate);  // Ensure recursive animation
      console.log('Rendering scene...');  // Output to check if it's running
       cube.rotation.x += 0.01; // Adding some rotation to see the movement
       cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();  // Initial call to start the animation loop

    return () => {
      renderer.dispose();  // Clean up when component unmounts
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default STLViewer;
