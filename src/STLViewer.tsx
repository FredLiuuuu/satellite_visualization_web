import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const STLViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  let stlMesh: THREE.Mesh | undefined;

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    // Initialize the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Ensure only one renderer is attached
    if (mountRef.current && mountRef.current.childNodes.length === 0) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    // Load STL file using STLLoader
    const loader = new STLLoader();
    loader.load(`${window.location.origin}/model.stl`, (geometry) => {
      console.log('STL file loaded:', geometry);

      const stlMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x111111, shininess: 200 });
      stlMesh = new THREE.Mesh(geometry, stlMaterial);

      // Increase the size of the model
      stlMesh.scale.set(0.8, 0.8, 0.8); // You can adjust this value to make it larger

      scene.add(stlMesh);

      // Optional: center the STL model in the view
      const center = new THREE.Vector3();
      geometry.computeBoundingBox();
      if (geometry.boundingBox) {
        geometry.boundingBox.getCenter(center);
        stlMesh.position.sub(center); // Center the model
      }

      console.log('STL Mesh added to scene:', stlMesh);
    }, undefined, (error: unknown) => {
      const typedError = error as Error;
      console.error('Error loading STL file:', typedError);
      console.error(`Error details: ${typedError.message}`);
    });

    // Animation loop: recursively render the scene
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate STL model
      if (stlMesh) {
        stlMesh.rotation.x += 0.009;
        stlMesh.rotation.y += 0.009;
      }

      renderer.render(scene, camera);
    };

    animate();  // Start the animation loop

    // Cleanup function: remove the renderer when the component is unmounted
    return () => {
      renderer.dispose();  // Cleanup the renderer
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement); // Remove the DOM element
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default STLViewer;
