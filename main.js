import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.156.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.156.0/examples/jsm/controls/PointerLockControls.js';

const owner = 'lama855';
const repoPagesUrl = `https://${owner}.github.io/digital-lab-prototype/`;

// Basic scene setup
const holder = document.getElementById('canvas-holder');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1726);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.6, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
holder.appendChild(renderer.domElement);

// Lights
const hemi = new THREE.HemisphereLight(0xdfeeff, 0x0f172a, 0.9);
hemi.position.set(0,50,0);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
keyLight.position.set(6, 10, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024,1024);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8ec5ff, 0.35);
fillLight.position.set(-8, 6, -8);
scene.add(fillLight);

// Floor and room
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x232a34, roughness: 0.95, metalness: 0.02 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const backWall = new THREE.Mesh(new THREE.BoxGeometry(40, 12, 0.6), new THREE.MeshStandardMaterial({ color: 0x0f1724, roughness: 0.95 }));
backWall.position.set(0, 6, -14);
backWall.receiveShadow = true;
scene.add(backWall);

// Bench
const bench = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 3), new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.8 }));
bench.position.set(0, 0.8, 0);
bench.receiveShadow = true;
bench.castShadow = true;
scene.add(bench);

// Shelves
const shelfGroup = new THREE.Group();
const shelfMat = new THREE.MeshStandardMaterial({ color: 0x476b9b, roughness: 0.7 });
const shelfY = [2.2, 3.9, 5.6];
const labels = ['Biology','Chemistry','Physics'];
for (let i=0;i<3;i++){
  const s = new THREE.Mesh(new THREE.BoxGeometry(14, 0.18, 1.4), shelfMat);
  s.position.set(0, shelfY[i], -8);
  s.receiveShadow = true;
  shelfGroup.add(s);

  const tag = makeLabel(labels[i], '#0b1220','#ffffff',600,140);
  const tagMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2,0.8), new THREE.MeshBasicMaterial({ map: tag.texture, transparent:true }));
  tagMesh.position.set(-5.2, shelfY[i]+0.5, -9.2);
  scene.add(tagMesh);
}
scene.add(shelfGroup);

// interactive objects
const interactive = [];
function createItem(name,color,x,y,z,desc, size=0.35){
  const mat = new THREE.MeshStandardMaterial({ color, roughness:0.35, metalness:0.15 });
  const m = new THREE.Mesh(new THREE.SphereGeometry(size, 28,28), mat);
  m.position.set(x,y,z);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData = { name, description: desc, type:'equipment' };
  scene.add(m);
  interactive.push(m);
  return m;
}

createItem('Microscope',0x9b7ede,-5.2,2.6,-8,'A microscope helps students observe cells and microstructures.');
createItem('Petri Dish',0xf59e0b,-3.7,2.6,-8,'Shallow dishes used to culture microbes or seeds.');
createItem('Pipette',0x38bdf8,-2.2,2.6,-8,'Used to transfer small liquid volumes precisely.');
createItem('Beaker',0xfbbf24,-0.5,3.9,-8,'Cylindrical container with a spout used to hold, mix, and heat liquids.');
createItem('Erlenmeyer',0xf97316,1.2,3.9,-8,'Conical flask useful for mixing without spilling.');
createItem('Graduated Cylinder',0x34d399,2.9,3.9,-8,'Tall narrow cylinder for accurate volume measurement.');
createItem('Pendulum',0x22c55e,-5.2,5.6,-8,'Used to study periodic motion; T = 2π √(L/g).');
createItem('Multimeter',0x60a5fa,-2.8,5.6,-8,'Measures voltage, current, resistance.');
createItem('Optical Bench',0x38bdf8,-0.8,5.6,-8,'Precision bench for lenses and optics.');
createItem('Force Table',0xfca5a5,1.2,5.6,-8,'Used to demonstrate vector equilibrium.');
createItem('Vernier Caliper',0xffe082,3.2,5.6,-8,'Precision length measurement tool.');

// Work beaker (interactive with color/mix)
const workBeaker = new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,1.2,32), new THREE.MeshPhysicalMaterial({ color:0x6fb6ff, transparent:true, opacity:0.5, roughness:0.2, transmission:0.35 }));
workBeaker.position.set(1.2,1.6,0.6);
workBeaker.userData = { name:'Work Beaker', description:'Active beaker for mixing solutions.' };
workBeaker.castShadow = true; workBeaker.receiveShadow = true;
scene.add(workBeaker); interactive.push(workBeaker);

// pointer lock controls
const controls = new PointerLockControls(camera, renderer.domElement);
document.getElementById('lockBtn').addEventListener('click', ()=> controls.lock());
controls.addEventListener('lock', ()=> setStatus('Lab entered — WASD to move, mouse to look'));
controls.addEventListener('unlock', ()=> setStatus('Lab paused'));

// movement
const move = { f:false,b:false,l:false,r:false };
const speed = 3.8;
window.addEventListener('keydown',(e)=>{ if(e.code==='KeyW')move.f=true; if(e.code==='KeyS')move.b=true; if(e.code==='KeyA')move.l=true; if(e.code==='KeyD')move.r=true; });
window.addEventListener('keyup',(e)=>{ if(e.code==='KeyW')move.f=false; if(e.code==='KeyS')move.b=false; if(e.code==='KeyA')move.l=false; if(e.code==='KeyD')move.r=false; });

// raycast
const ray = new THREE.Raycaster();
const center = new THREE.Vector2(0,0);
let selected = null;

renderer.domElement.addEventListener('click',()=>{
  if(!controls.isLocked) return;
  ray.setFromCamera(center, camera);
  const hit = ray.intersectObjects(interactive, false);
  if(hit.length>0){
    const obj = hit[0].object;
    selected = obj;
    openPanel(obj.userData.name, obj.userData.description);
    highlight(obj);
  } else {
    selected = null; closePanel();
  }
});

function highlight(obj){
  interactive.forEach(o=>{ if(o.material && o.material.emissive) o.material.emissive.setHex(0x000000); });
  if(obj.material && obj.material.emissive) obj.material.emissive.setHex(0x1146ff);
}

function openPanel(name,desc){
  document.getElementById('panel').hidden = false;
  document.getElementById('objName').textContent = name;
  document.getElementById('objDesc').textContent = desc;
}
function closePanel(){ document.getElementById('panel').hidden = true; }

document.getElementById('closePanel').addEventListener('click', closePanel);

// Mix animation: change beaker color towards item color
function mixIntoBeaker(item){
  const color = (item.material && item.material.color) ? item.material.color.clone() : new THREE.Color(0xffffff);
  const start = workBeaker.material.color.clone();
  let t = 0; const dur = 1.2;
  const initial = start;
  const anim = ()=>{
    t += 0.02;
    workBeaker.material.color.r = THREE.MathUtils.lerp(initial.r, color.r, t/dur);
    workBeaker.material.color.g = THREE.MathUtils.lerp(initial.g, color.g, t/dur);
    workBeaker.material.color.b = THREE.MathUtils.lerp(initial.b, color.b, t/dur);
    if(t < dur) requestAnimationFrame(anim);
  };
  anim();
}

document.getElementById('mixBtn').addEventListener('click', ()=>{
  if(!selected){ setAI('Select an item first to mix into beaker.'); return; }
  mixIntoBeaker(selected);
  setAI(`Mixed ${selected.userData.name} into the work beaker (simulated).`);
});

document.getElementById('focusBtn').addEventListener('click', ()=>{
  if(!selected){ setAI('Select an object first.'); return; }
  setAI(`Focused on ${selected.userData.name}: ${selected.userData.description}`);
});

// simple AI ask (local fallback and placeholder for server)
document.getElementById('explainBtn').addEventListener('click', askAI);
document.getElementById('query').addEventListener('keydown',(e)=>{ if(e.key==='Enter') askAI(); });

function setAI(text){ document.getElementById('aiResult').textContent = text; }
async function askAI(){
  const q = document.getElementById('query').value.trim();
  if(!q) { setAI('Type a question to the lab.'); return; }
  setAI('Thinking...');
  // Try contacting server endpoint; otherwise use local fallback
  try{
    const r = await fetch('/api/explain',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ query: q, context: selected?selected.userData.name:null }) });
    if(r.ok){ const j = await r.json(); setAI(j.answer || j); return; }
  }catch(e){ /*ignore*/ }
  setAI(localExplain(q));
}

function localExplain(q){ q=q.toLowerCase();
  if(q.includes('pendulum')) return 'Pendulum period: T = 2π √(L/g). Longer length → longer period.';
  if(q.includes('beaker')) return 'A beaker holds, mixes, and heats liquids. Use volumetric flasks for precise volume.';
  if(q.includes('microscope')) return 'A microscope magnifies tiny structures for biological observation.';
  if(q.includes('energy')) return 'Kinetic energy: KE = 1/2 m v^2. Potential energy: PE = m g h.';
  return 'This is the lab prototype. For full explanations connect the AI server or try specific keywords like "beaker", "pendulum", or "energy".';
}

// share / QR
const shareBtn = document.getElementById('shareBtn');
const qrModal = document.getElementById('qrModal');
const closeQr = document.getElementById('closeQr');
shareBtn.addEventListener('click', ()=>{
  qrModal.hidden = false;
  document.getElementById('pagesLink').href = repoPagesUrl;
  // generate QR
  const el = document.getElementById('qrcode');
  el.innerHTML = '';
  // eslint-disable-next-line no-undef
  new QRCode(el, { text: repoPagesUrl, width: 200, height: 200 });
});
closeQr.addEventListener('click', ()=>{ qrModal.hidden = true; });

function setStatus(s){ document.getElementById('status').textContent = 'Status: '+s; }

// highlight on hover (center reticle approach)
const clock = new THREE.Clock();
function animate(){ requestAnimationFrame(animate); const dt = clock.getDelta();
  // movement
  if(controls.isLocked){
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const right = new THREE.Vector3().crossVectors(dir,new THREE.Vector3(0,1,0)).normalize();
    const moveVec = new THREE.Vector3();
    if(move.f) moveVec.add(dir);
    if(move.b) moveVec.sub(dir);
    if(move.l) moveVec.sub(right);
    if(move.r) moveVec.add(right);
    if(moveVec.lengthSq()>0){ moveVec.normalize().multiplyScalar(speed*dt); camera.position.add(moveVec); camera.position.y = 1.6; }
  }

  // center ray hover
  ray.setFromCamera(center, camera);
  const hits = ray.intersectObjects(interactive, false);
  if(hits.length>0){
    const o = hits[0].object;
    interactive.forEach(i=>{ if(i.material && i.material.emissive) i.material.emissive.setHex(0x000000); });
    if(o.material && o.material.emissive) o.material.emissive.setHex(0x0f6bf5);
    setStatus(`Looking at: ${o.userData.name}`);
  }

  renderer.render(scene,camera);
}
animate();

window.addEventListener('resize', ()=>{ camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
