import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Medallón 3D girable (port de `badge-3d.js` del prototipo a React + three npm).
 * Moneda metálica con el emoji grabado, anillo de brillos, luz de acento,
 * flota y gira; se arrastra con mouse/touch y retoma el giro al soltar.
 */
interface Badge3DProps {
  emoji?: string;
  accent?: string;
  locked?: boolean;
  height?: number;
}

function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r * f); g = Math.round(g * f); b = Math.round(b * f);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** Dibuja el emoji + anillos sobre un canvas → textura de la cara de la moneda. */
function faceTexture(emoji: string, accent: string): HTMLCanvasElement {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 40, s / 2, s / 2, s / 2);
  g.addColorStop(0, accent);
  g.addColorStop(0.55, shade(accent, 0.7));
  g.addColorStop(1, shade(accent, 0.42));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2 - 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2 - 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = '260px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillText(emoji || '🏅', s / 2, s / 2 + 14);
  return c;
}

export default function Badge3D({ emoji = '🏅', accent = '#6366f1', locked = false, height = 220 }: Badge3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const w = host.clientWidth || 300;
    const h = host.clientHeight || height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    // Moneda: cilindro delgado con caras texturizadas + canto metálico.
    const faceTex = new THREE.CanvasTexture(faceTexture(emoji, locked ? '#6b7280' : accent));
    faceTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    faceTex.colorSpace = THREE.SRGBColorSpace;

    const rimMat = new THREE.MeshStandardMaterial({ metalness: 0.9, roughness: 0.28 });
    rimMat.color = new THREE.Color(locked ? '#565b6b' : shade(accent, 0.85));
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, metalness: 0.35, roughness: 0.42 });

    const coin = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.28, 64), [rimMat, faceMat, faceMat]);
    coin.rotation.x = Math.PI / 2;
    const group = new THREE.Group();
    group.add(coin);
    scene.add(group);

    // Anillo de esferitas para el brillo.
    const ringGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const ringMat = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.6, roughness: 0.2, emissive: new THREE.Color(shade(accent, 0.5)), emissiveIntensity: 0.4 });
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const sph = new THREE.Mesh(ringGeo, ringMat);
      sph.position.set(Math.cos(a) * 2.3, Math.sin(a) * 2.3, 0);
      group.add(sph);
    }

    // Luces.
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(new THREE.Color(accent), 1.4, 30); rim.position.set(-4, -2, 3); scene.add(rim);

    // Arrastrar para girar.
    let dragging = false, px = 0, vel = 0.008;
    const clientX = (e: MouseEvent | TouchEvent) =>
      'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const down = (e: MouseEvent | TouchEvent) => { dragging = true; px = clientX(e); host.style.cursor = 'grabbing'; };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const x = clientX(e);
      vel = (x - px) * 0.006;
      group.rotation.y += (x - px) * 0.01;
      px = x;
    };
    const up = () => { dragging = false; host.style.cursor = 'grab'; };
    host.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    host.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);

    const onResize = () => {
      const nw = host.clientWidth || w, nh = host.clientHeight || h;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let t = 0;
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t += 0.016;
      if (!dragging) { group.rotation.y += vel; vel += (0.008 - vel) * 0.02; }
      group.rotation.x = Math.sin(t * 0.8) * 0.12;
      group.position.y = Math.sin(t * 1.2) * 0.08;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('mousedown', down);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      host.removeEventListener('touchstart', down);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
      window.removeEventListener('resize', onResize);
      faceTex.dispose();
      rimMat.dispose();
      faceMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
    };
  }, [emoji, accent, locked, height]);

  return <div ref={hostRef} style={{ width: '100%', height, cursor: 'grab' }} />;
}
