import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ViewMode, ColorTheme, Node3DData, PlanetType } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface ThreeCanvasProps {
  viewMode: ViewMode;
  colorTheme: ColorTheme;
  activeNodeId: string | null;
  highlightedNodeId?: string | null;
  onSelectNode: (node: Node3DData | null) => void;
  isRotating: boolean;
}

// Module-level reusable math objects to prevent GC inside render loop
const _pointer = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export const NODES_DATA: Node3DData[] = [
  {
    id: 'calidad',
    title: 'Sistema de Gestión (SGI)',
    planetName: 'El Sol',
    subtitle: 'Rumbo al SGI Norma ISO 9001:2026',
    color: '#fbbf24',
    accentColor: '#f59e0b',
    orbitRadius: 0,
    initialAngle: 0,
    orbitSpeed: 0,
    radius: 2.0,
    type: 'sun',
    description: 'Núcleo Desarrollo Académico ITD · Rumbo al SGI Norma ISO 9001:2026.',
    actionUrl: 'https://www.itdurango.edu.mx/',
    actionText: 'Ver Normativa ITD'
  },
  {
    id: 'estadisticas',
    title: 'Reportes y Estadísticas',
    planetName: 'Mercurio',
    subtitle: 'Métricas Académicas ITD',
    color: '#94a3b8',
    accentColor: '#cbd5e1',
    orbitRadius: 4.5,
    initialAngle: 2.3,
    orbitSpeed: 0.09,
    radius: 0.56,
    type: 'mercury',
    description: 'Módulo de análisis estadístico de reprobación, retención e impacto de la tutoría.',
    actionUrl: 'https://da-itd.github.io/C/reportes.html',
    actionText: 'Consultar Estadísticas'
  },
  {
    id: 'siape',
    title: 'SIAPE-ITD',
    planetName: 'Venus',
    subtitle: 'Atención Psicológica Estudiantil',
    color: '#8eb695',
    accentColor: '#6ee7b7',
    orbitRadius: 7.1,
    initialAngle: -0.7,
    orbitSpeed: 0.065,
    radius: 0.84,
    type: 'venus',
    description: 'Sistema Integral de Atención Psicológica Estudiantil · Oficina de Psicología ITD.',
    actionUrl: 'https://siape-itd.vercel.app',
    actionText: 'Ingresar a SIAPE-ITD'
  },
  {
    id: 'tutorias',
    title: 'Programa de Tutorías',
    planetName: 'La Tierra',
    subtitle: 'Seguimiento Académico ITD',
    color: '#38bdf8',
    accentColor: '#34d399',
    orbitRadius: 10.2,
    initialAngle: 0.55,
    orbitSpeed: 0.048,
    radius: 0.98,
    type: 'earth',
    description: 'Seguimiento institucional de tutorías. Formatos ITD-AC-PO-04-03 y ITD-AC-PO-04-02.',
    actionUrl: 'https://da-itd.github.io/C/ITD-AC-PO-04-03-app.html',
    actionText: 'Coordinador (04-03)',
    links: [
      { label: 'Coordinador (04-03)', url: 'https://da-itd.github.io/C/ITD-AC-PO-04-03-app.html' },
      { label: 'Tutor (04-02)', url: 'https://da-itd.github.io/C/tutor.html' },
      { label: 'Estadísticas', url: 'https://da-itd.github.io/C/reportes.html' }
    ]
  },
  {
    id: 'actualizacion',
    title: 'Actualización Docente',
    planetName: 'Marte',
    subtitle: 'Formación Continua TecNM',
    color: '#f97316',
    accentColor: '#fb923c',
    orbitRadius: 13.4,
    initialAngle: 2.0,
    orbitSpeed: 0.036,
    radius: 0.78,
    type: 'mars',
    description: 'Plataforma oficial de cursos, constancias y actualización del personal académico del ITD.',
    actionUrl: 'https://act-doc-itd.vercel.app',
    actionText: 'Acceder a Actualización'
  }
];

// Deterministic pseudo-random helper so planet textures stay consistent across renders
function seededRand(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function createPlanetTexture(type: PlanetType, maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (type === 'sun') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.5, '#fbbf24');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 420; i++) {
      const x = seededRand(i * 1.1) * 512;
      const y = seededRand(i * 2.3) * 256;
      const r = 4 + seededRand(i * 3.7) * 22;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 251, 235, 0.25)' : 'rgba(234, 88, 12, 0.22)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'mercury') {
    ctx.fillStyle = '#7c8491';
    ctx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 260; i++) {
      const x = seededRand(i * 3.1) * 512;
      const y = seededRand(i * 4.7) * 256;
      const r = 2 + seededRand(i * 5.3) * 14;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(55, 65, 81, 0.4)' : 'rgba(203, 213, 225, 0.28)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (r > 7) {
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  } else if (type === 'venus') {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#d9a45b');
    grad.addColorStop(0.3, '#f3d08a');
    grad.addColorStop(0.55, '#e6b86a');
    grad.addColorStop(0.8, '#f6dba4');
    grad.addColorStop(1, '#c88d44');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Swirling atmospheric cloud bands
    for (let i = 0; i < 38; i++) {
      const y = seededRand(i * 2.9) * 256;
      const h = 6 + seededRand(i * 4.1) * 18;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 247, 224, 0.22)' : 'rgba(180, 110, 40, 0.16)';
      ctx.fillRect(0, y, 512, h);
    }
  } else if (type === 'earth') {
    // Deep ocean base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 256);
    oceanGrad.addColorStop(0, '#0c4a6e');
    oceanGrad.addColorStop(0.5, '#0369a1');
    oceanGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Procedural continents
    for (let i = 0; i < 45; i++) {
      const x = seededRand(i * 7.1 + 3) * 512;
      const y = 32 + seededRand(i * 5.9 + 7) * 192;
      const rx = 14 + seededRand(i * 2.1) * 34;
      const ry = 10 + seededRand(i * 3.3) * 24;
      ctx.fillStyle = i % 4 === 0 ? '#65a30d' : i % 3 === 0 ? '#4d7c0f' : '#22c55e';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, seededRand(i) * Math.PI, 0, Math.PI * 2);
      ctx.fill();

      // Subtle ochre desert patches
      if (i % 5 === 0) {
        ctx.fillStyle = 'rgba(217, 160, 91, 0.55)';
        ctx.beginPath();
        ctx.ellipse(x + 4, y + 2, rx * 0.45, ry * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Polar ice caps
    ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
    ctx.fillRect(0, 0, 512, 16);
    ctx.fillRect(0, 240, 512, 16);
  } else {
    // Mars
    const marsGrad = ctx.createLinearGradient(0, 0, 0, 256);
    marsGrad.addColorStop(0, '#b45309');
    marsGrad.addColorStop(0.5, '#dc5a2a');
    marsGrad.addColorStop(1, '#9a3412');
    ctx.fillStyle = marsGrad;
    ctx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 160; i++) {
      const x = seededRand(i * 6.3) * 512;
      const y = 18 + seededRand(i * 4.5) * 220;
      const r = 4 + seededRand(i * 2.7) * 20;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(124, 45, 18, 0.35)' : 'rgba(251, 146, 60, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Martian polar caps
    ctx.fillStyle = 'rgba(255, 247, 237, 0.85)';
    ctx.fillRect(0, 0, 512, 10);
    ctx.fillRect(0, 246, 512, 10);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createEarthCloudsTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 256);

  for (let i = 0; i < 95; i++) {
    const x = seededRand(i * 9.3 + 11) * 512;
    const y = 20 + seededRand(i * 4.2 + 5) * 216;
    const rx = 12 + seededRand(i * 3.9) * 32;
    const ry = 5 + seededRand(i * 1.7) * 11;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, seededRand(i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createGlowTexture(innerColor: string, midColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 126);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.35, midColor);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  viewMode,
  colorTheme,
  activeNodeId,
  highlightedNodeId,
  onSelectNode,
  isRotating
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    viewMode,
    colorTheme,
    activeNodeId,
    highlightedNodeId: highlightedNodeId ?? null,
    isRotating,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    isDragging: false,
    prevPointerX: 0,
    prevPointerY: 0,
    orbitTheta: 0.35,
    orbitPhi: Math.PI / 3.1,
    orbitRadius: 24,
    hoveredNodeId: null as string | null
  });

  useEffect(() => {
    stateRef.current.viewMode = viewMode;
    stateRef.current.colorTheme = colorTheme;
    stateRef.current.activeNodeId = activeNodeId;
    stateRef.current.highlightedNodeId = highlightedNodeId ?? null;
    stateRef.current.isRotating = isRotating;
  }, [viewMode, colorTheme, activeNodeId, highlightedNodeId, isRotating]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 3. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040710, 0.012);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      180
    );
    camera.position.set(0, 9.5, 23);

    // 4. Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Solar System Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x05080f, 0.65);
    scene.add(hemiLight);

    // Main sunlight radiating from the center
    const sunLight = new THREE.PointLight(0xfff1d6, 4.5, 70, 0.6);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Gentle directional rim light so dark sides of planets stay subtly readable
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    rimLight.position.set(-18, 12, -16);
    scene.add(rimLight);

    // 6. Calm Deep-Space Starfield (static Points, zero dizziness)
    const starCount = 650;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 42 + seededRand(i * 1.9) * 55;
      const theta = seededRand(i * 3.7) * Math.PI * 2;
      const phi = Math.acos(2 * seededRand(i * 5.1) - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const tint = seededRand(i * 7.3);
      starColors[i * 3] = tint > 0.7 ? 1.0 : 0.78;
      starColors[i * 3 + 1] = tint > 0.4 ? 0.92 : 0.85;
      starColors[i * 3 + 2] = tint < 0.3 ? 1.0 : 0.92;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 7. Label Helper
    const createNodeLabel = (planetName: string, title: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 560;
      canvas.height = 136;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = 'rgba(5, 8, 15, 0.9)';
      ctx.beginPath();
      ctx.roundRect(14, 14, 532, 108, 48);
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 26px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planetName.toUpperCase(), 280, 44);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 31px Rajdhani, sans-serif';
      ctx.fillText(title, 280, 84);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;

      const spriteMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthTest: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(3.4, 0.84, 1);
      sprite.renderOrder = 10;
      return sprite;
    };

    // 8. Build Solar System Celestial Bodies + Orbit Tracks
    const disposables: { dispose: () => void }[] = [starGeo, starMat];
    const raycastTargets: THREE.Object3D[] = [];

    const sunGlowTex = createGlowTexture('rgba(255, 224, 130, 0.9)', 'rgba(245, 158, 11, 0.28)');
    const earthAtmoTex = createGlowTexture('rgba(56, 189, 248, 0.45)', 'rgba(56, 189, 248, 0.08)');
    const cloudTex = createEarthCloudsTexture(maxAnisotropy);
    const moonTex = createPlanetTexture('mercury', maxAnisotropy);
    disposables.push(sunGlowTex, earthAtmoTex, cloudTex, moonTex);

    const celestialObjects: {
      id: string;
      group: THREE.Group;
      planetMesh: THREE.Mesh;
      cloudsMesh?: THREE.Mesh;
      moonPivot?: THREE.Group;
      selectionRing: THREE.Mesh;
      orbitRing?: THREE.Mesh;
      label: THREE.Sprite;
      angle: number;
      data: Node3DData;
    }[] = [];

    NODES_DATA.forEach((node) => {
      // Orbit ring on ecliptic plane
      let orbitRing: THREE.Mesh | undefined;
      if (node.orbitRadius > 0) {
        const orbitGeo = new THREE.RingGeometry(node.orbitRadius - 0.025, node.orbitRadius + 0.025, 128);
        const orbitMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(node.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.22
        });
        orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
        orbitRing.rotation.x = -Math.PI / 2;
        scene.add(orbitRing);
        disposables.push(orbitGeo, orbitMat);
      }

      const bodyGroup = new THREE.Group();
      const px = Math.cos(node.initialAngle) * node.orbitRadius;
      const pz = Math.sin(node.initialAngle) * node.orbitRadius;
      bodyGroup.position.set(px, 0, pz);

      const planetTex = createPlanetTexture(node.type, maxAnisotropy);
      disposables.push(planetTex);

      const sphereGeo = new THREE.SphereGeometry(node.radius, 48, 36);
      disposables.push(sphereGeo);

      let planetMat: THREE.Material;
      if (node.type === 'sun') {
        planetMat = new THREE.MeshBasicMaterial({
          map: planetTex
        });
      } else {
        planetMat = new THREE.MeshStandardMaterial({
          map: planetTex,
          roughness: node.type === 'earth' ? 0.55 : node.type === 'venus' ? 0.65 : 0.85,
          metalness: 0.06,
          emissive: new THREE.Color(node.color),
          emissiveIntensity: 0.08
        });
      }
      disposables.push(planetMat);

      const planetMesh = new THREE.Mesh(sphereGeo, planetMat);
      if (node.type === 'earth') {
        planetMesh.rotation.z = THREE.MathUtils.degToRad(23.4);
      } else if (node.type === 'mars') {
        planetMesh.rotation.z = THREE.MathUtils.degToRad(25.0);
      }
      planetMesh.userData = { nodeId: node.id, isNode: true, data: node };
      bodyGroup.add(planetMesh);
      raycastTargets.push(planetMesh);

      // Sun Corona Halo
      if (node.type === 'sun') {
        const coronaMat = new THREE.SpriteMaterial({
          map: sunGlowTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const corona = new THREE.Sprite(coronaMat);
        corona.scale.set(node.radius * 4.4, node.radius * 4.4, 1);
        bodyGroup.add(corona);
        disposables.push(coronaMat);
      }

      // Earth Clouds + Atmosphere Halo + Orbiting Moon
      let cloudsMesh: THREE.Mesh | undefined;
      let moonPivot: THREE.Group | undefined;
      if (node.type === 'earth') {
        const cloudGeo = new THREE.SphereGeometry(node.radius * 1.025, 40, 32);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          roughness: 0.9
        });
        cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
        bodyGroup.add(cloudsMesh);
        disposables.push(cloudGeo, cloudMat);

        const atmoMat = new THREE.SpriteMaterial({
          map: earthAtmoTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const atmoSprite = new THREE.Sprite(atmoMat);
        atmoSprite.scale.set(node.radius * 2.8, node.radius * 2.8, 1);
        bodyGroup.add(atmoSprite);
        disposables.push(atmoMat);

        // Orbiting Moon
        moonPivot = new THREE.Group();
        const moonGeo = new THREE.SphereGeometry(0.24, 24, 20);
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          roughness: 0.9,
          metalness: 0.05
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(1.75, 0.15, 0);
        moonPivot.add(moonMesh);
        bodyGroup.add(moonPivot);
        disposables.push(moonGeo, moonMat);
      }

      // Subtle selection / highlight ring around the planet
      const selGeo = new THREE.RingGeometry(node.radius * 1.38, node.radius * 1.5, 48);
      const selMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.accentColor),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });
      const selectionRing = new THREE.Mesh(selGeo, selMat);
      selectionRing.rotation.x = -Math.PI / 2;
      bodyGroup.add(selectionRing);
      disposables.push(selGeo, selMat);

      // Floating holographic label above celestial body
      const labelSprite = createNodeLabel(node.planetName, node.title, node.color);
      labelSprite.position.y = node.radius + 0.72;
      labelSprite.visible = stateRef.current.viewMode === 'space3d';
      bodyGroup.add(labelSprite);
      disposables.push(labelSprite.material);

      scene.add(bodyGroup);

      celestialObjects.push({
        id: node.id,
        group: bodyGroup,
        planetMesh,
        cloudsMesh,
        moonPivot,
        selectionRing,
        orbitRing,
        label: labelSprite,
        angle: node.initialAngle,
        data: node
      });
    });

    // 9. Pointer & Orbit Interaction Handlers
    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _pointer.x = x;
      _pointer.y = y;

      stateRef.current.targetMouseX = x;
      stateRef.current.targetMouseY = y;

      if (stateRef.current.isDragging && stateRef.current.viewMode === 'space3d') {
        const deltaX = e.clientX - stateRef.current.prevPointerX;
        const deltaY = e.clientY - stateRef.current.prevPointerY;
        stateRef.current.orbitTheta -= deltaX * 0.006;
        stateRef.current.orbitPhi = Math.max(
          0.18,
          Math.min(Math.PI / 2.15, stateRef.current.orbitPhi - deltaY * 0.006)
        );
        stateRef.current.prevPointerX = e.clientX;
        stateRef.current.prevPointerY = e.clientY;
      }

      _raycaster.setFromCamera(_pointer, camera);
      const intersects = _raycaster.intersectObjects(raycastTargets);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const nodeId = hit.userData.nodeId;
        if (stateRef.current.hoveredNodeId !== nodeId) {
          stateRef.current.hoveredNodeId = nodeId;
          container.style.cursor = 'pointer';
          sound.playHover();
        }
      } else {
        if (stateRef.current.hoveredNodeId !== null) {
          stateRef.current.hoveredNodeId = null;
          container.style.cursor = stateRef.current.viewMode === 'space3d' ? 'grab' : 'default';
        }
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevPointerX = e.clientX;
      stateRef.current.prevPointerY = e.clientY;
      if (stateRef.current.viewMode === 'space3d') {
        container.style.cursor = 'grabbing';
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      stateRef.current.isDragging = false;
      container.style.cursor = stateRef.current.hoveredNodeId ? 'pointer' : 'default';

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _pointer.x = x;
      _pointer.y = y;
      _raycaster.setFromCamera(_pointer, camera);
      const intersects = _raycaster.intersectObjects(raycastTargets);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const hitData = hit.userData.data as Node3DData;
        sound.playSelect();
        onSelectNode(hitData);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (stateRef.current.viewMode === 'space3d') {
        e.preventDefault();
        stateRef.current.orbitRadius = Math.max(
          10,
          Math.min(42, stateRef.current.orbitRadius + e.deltaY * 0.025)
        );
      }
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 10. Paced Render Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const current = stateRef.current;

      current.mouseX = THREE.MathUtils.damp(current.mouseX, current.targetMouseX, 2.5, delta);
      current.mouseY = THREE.MathUtils.damp(current.mouseY, current.targetMouseY, 2.5, delta);

      // Theme tinting on rimLight / sunLight
      if (current.colorTheme === 'cyber') {
        sunLight.color.setHex(0xffe4b5);
        rimLight.color.setHex(0x00e5c0);
      } else if (current.colorTheme === 'gold') {
        sunLight.color.setHex(0xfde68a);
        rimLight.color.setHex(0xf59e0b);
      } else {
        sunLight.color.setHex(0xfff1d6);
        rimLight.color.setHex(0x38bdf8);
      }

      // Pause orbital travel when inspecting a specific planet in 3D so inspection stays steady
      const shouldRevolve = current.isRotating && !(current.viewMode === 'space3d' && current.activeNodeId);

      celestialObjects.forEach((item) => {
        item.label.visible =
          current.viewMode === 'space3d' || current.hoveredNodeId === item.id;

        // Serene axial spin
        if (current.isRotating) {
          item.planetMesh.rotation.y += delta * (item.data.type === 'sun' ? 0.06 : 0.14);
          if (item.cloudsMesh) {
            item.cloudsMesh.rotation.y += delta * 0.18;
          }
          if (item.moonPivot) {
            item.moonPivot.rotation.y += delta * 0.35;
          }
        }

        // Serene orbital revolution around the Sun
        if (shouldRevolve && item.data.orbitRadius > 0) {
          item.angle += delta * item.data.orbitSpeed;
          item.group.position.set(
            Math.cos(item.angle) * item.data.orbitRadius,
            0,
            Math.sin(item.angle) * item.data.orbitRadius
          );
        }

        const isHovered = current.hoveredNodeId === item.id;
        const isSelected = current.activeNodeId === item.id;
        const isCardHighlighted = current.viewMode === 'portal' && current.highlightedNodeId === item.id;

        const targetScale = isSelected ? 1.12 : isHovered || isCardHighlighted ? 1.08 : 1.0;
        item.planetMesh.scale.setScalar(
          THREE.MathUtils.damp(item.planetMesh.scale.x, targetScale, 5.0, delta)
        );

        const ringMat = item.selectionRing.material as THREE.MeshBasicMaterial;
        const targetRingOpacity = isSelected ? 0.85 : isHovered || isCardHighlighted ? 0.6 : 0.0;
        ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetRingOpacity, 6.0, delta);

        if (item.orbitRing) {
          const orbMat = item.orbitRing.material as THREE.MeshBasicMaterial;
          orbMat.opacity = THREE.MathUtils.damp(
            orbMat.opacity,
            isSelected || isCardHighlighted ? 0.55 : 0.22,
            5.0,
            delta
          );
        }
      });

      // Camera positioning
      if (current.viewMode === 'space3d') {
        if (current.activeNodeId) {
          const targetObj = celestialObjects.find((n) => n.id === current.activeNodeId);
          if (targetObj) {
            const px = targetObj.group.position.x;
            const py = targetObj.group.position.y;
            const pz = targetObj.group.position.z;

            if (targetObj.data.orbitRadius === 0) {
              // Framing the Sun + its top label cleanly inside the open viewport
              _targetLookAt.set(0, 0.75, 0);
              _targetCamPos.set(6.5, 3.8, 10.5);
            } else {
              // Frame both planet and its floating label cleanly between Header and Bottom Dock
              const dist = targetObj.data.radius * 5.2 + 4.4;
              const len = Math.hypot(px, pz) || 1;
              const dx = px / len;
              const dz = pz / len;
              _targetLookAt.set(px, py + 0.55, pz);
              _targetCamPos.set(
                px + dx * dist + dz * 2.0,
                py + targetObj.data.radius * 1.1 + 1.6,
                pz + dz * dist - dx * 2.0
              );
            }
          }
        } else {
          const sinPhi = Math.sin(current.orbitPhi);
          const cosPhi = Math.cos(current.orbitPhi);
          const sinTheta = Math.sin(current.orbitTheta);
          const cosTheta = Math.cos(current.orbitTheta);

          _targetCamPos.set(
            current.orbitRadius * sinPhi * sinTheta,
            current.orbitRadius * cosPhi,
            current.orbitRadius * sinPhi * cosTheta
          );
          _targetLookAt.set(0, 0.3, 0);
        }
      } else {
        // Portal mode: position the Solar System in the upper-center open stage above the single card
        _targetCamPos.set(
          current.mouseX * 0.65,
          8.4 - current.mouseY * 0.28,
          25.0
        );
        _targetLookAt.set(0, -2.9, 0);
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 3.2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 3.2, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 3.2, delta);
      camera.lookAt(_targetLookAt);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);

      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectNode]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      style={{
        zIndex: viewMode === 'space3d' ? 10 : 0,
        opacity: viewMode === 'space3d' ? 1 : 0.78,
        transition: 'opacity 0.6s ease'
      }}
    />
  );
};
