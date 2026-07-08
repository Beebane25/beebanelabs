import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

(function () {
  'use strict';

  let renderer, scene, camera, clock;
  let shapes = [];
  let particleSystem;
  let mouse = { x: 0, y: 0 };
  let targetMouse = { x: 0, y: 0 };
  let animationId;
  let container;

  const CONFIG = {
    shapeCount: 12,
    particleCount: 600,
    color: 0x3ecf8e,
    shapeOpacity: 0.12,
    particleOpacity: 0.35,
    cameraDistance: 30,
    mouseInfluence: 0.15,
    shapeRotationSpeed: 0.003,
    cameraOrbitSpeed: 0.0003,
  };

  function init() {
    container = document.querySelector('.hero');
    if (!container) return;

    // Ensure hero has position for absolute child
    const pos = getComputedStyle(container).position;
    if (pos === 'static') container.style.position = 'relative';

    // Scene
    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 200);
    camera.position.z = CONFIG.cameraDistance;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    createShapes();
    createParticles();
    bindEvents();
    animate();
  }

  function createShapes() {
    const geometries = [
      () => new THREE.IcosahedronGeometry(1.6, 0),
      () => new THREE.TorusKnotGeometry(1, 0.35, 64, 8),
      () => new THREE.OctahedronGeometry(1.4, 0),
      () => new THREE.TetrahedronGeometry(1.5, 0),
      () => new THREE.DodecahedronGeometry(1.2, 0),
    ];

    const material = new THREE.MeshBasicMaterial({
      color: CONFIG.color,
      wireframe: true,
      transparent: true,
      opacity: CONFIG.shapeOpacity,
    });

    for (let i = 0; i < CONFIG.shapeCount; i++) {
      const geoFn = geometries[i % geometries.length];
      const mesh = new THREE.Mesh(geoFn(), material.clone());

      // Spread shapes in a volume
      mesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );

      const scale = 0.5 + Math.random() * 1.5;
      mesh.scale.setScalar(scale);

      mesh.userData = {
        basePosition: mesh.position.clone(),
        rotSpeed: {
          x: (Math.random() - 0.5) * CONFIG.shapeRotationSpeed * 2,
          y: (Math.random() - 0.5) * CONFIG.shapeRotationSpeed * 2,
          z: (Math.random() - 0.5) * CONFIG.shapeRotationSpeed * 2,
        },
        floatOffset: Math.random() * Math.PI * 2,
        floatAmplitude: 0.3 + Math.random() * 0.5,
      };

      scene.add(mesh);
      shapes.push(mesh);
    }
  }

  function createParticles() {
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const spread = 50;

    for (let i = 0; i < CONFIG.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: CONFIG.color,
      size: 0.08,
      transparent: true,
      opacity: CONFIG.particleOpacity,
      sizeAttenuation: true,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function bindEvents() {
    function onMouseMove(e) {
      const rect = container.getBoundingClientRect();
      targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    function onResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize, { passive: true });

    // Cleanup on page unload (Astro SPA transitions)
    window.addEventListener('beforeunload', dispose, { once: true });

    // Store refs for dispose
    container._threeHeroHandlers = { onMouseMove, onResize };
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth mouse follow
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Rotate & float shapes
    shapes.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotSpeed.x;
      mesh.rotation.y += mesh.userData.rotSpeed.y;
      mesh.rotation.z += mesh.userData.rotSpeed.z;

      // Gentle floating
      mesh.position.y =
        mesh.userData.basePosition.y +
        Math.sin(elapsed * 0.5 + mesh.userData.floatOffset) * mesh.userData.floatAmplitude;

      // Subtle mouse influence
      mesh.position.x =
        mesh.userData.basePosition.x + mouse.x * CONFIG.mouseInfluence * 5;
    });

    // Slowly rotate particle field
    if (particleSystem) {
      particleSystem.rotation.y += 0.0002;
    }

    // Camera orbits gently + mouse offset
    const orbitAngle = elapsed * CONFIG.cameraOrbitSpeed;
    camera.position.x = Math.sin(orbitAngle) * 3 + mouse.x * 2;
    camera.position.y = mouse.y * 1.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function dispose() {
    if (animationId) cancelAnimationFrame(animationId);

    if (container && container._threeHeroHandlers) {
      window.removeEventListener('mousemove', container._threeHeroHandlers.onMouseMove);
      window.removeEventListener('resize', container._threeHeroHandlers.onResize);
    }

    shapes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    shapes = [];

    if (particleSystem) {
      particleSystem.geometry.dispose();
      particleSystem.material.dispose();
    }

    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }

    renderer = null;
    scene = null;
    camera = null;
  }

  // Self-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
