import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { sceneConfigurations } from './config.js?v=1.01';

// --- State Variables ---
let controls, renderer, scene, camera, grid;
let autoRotate = false;
const loadedPivots = []; 
const loadedMeshes = []; 
const loader = new PLYLoader();

// URL Parameter Logic
const urlParams = new URLSearchParams(window.location.search);
const modelIndex = parseInt(urlParams.get('model')) || 1;
const initialIndex = (modelIndex >= 0 && modelIndex < sceneConfigurations.length) ? modelIndex : 1;
let config = sceneConfigurations[initialIndex];

function setup() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.002);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up.set(0, 0, 1);
    camera.position.set(-3, 0 , 2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('viewer').appendChild(renderer.domElement);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 2.5;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.staticMoving = false; 

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(hemiLight);

    //const envLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    //scene.add(envLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(0.5, -3.5, 1.5);
    camera.add(dirLight);
    dirLight.target.position.set(0, 0, -1);
    camera.add(dirLight.target);
    scene.add(camera);

    // Add a grid to the "floor" (XZ plane)
    grid = new THREE.GridHelper(5, 10, 0x444444, 0x222222);
    grid.rotation.x = Math.PI / 2; // If your "up" is Z, or leave as is if "up" is Y    

    scene.add(grid);
}

function loadScene() {
    // 1. Cleanup existing
    loadedPivots.forEach(pivot => {
        pivot.traverse(node => {
            if (node.isMesh || node.isLineSegments) {
                node.geometry.dispose();
                node.material.dispose();
            }
        });
        scene.remove(pivot);
    });
    loadedPivots.length = 0;
    loadedMeshes.length = 0;

    // 2. Reset Progress UI
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    progressBar.style.width = '0%';
    progressBar.innerText = '0%';
    progressContainer.style.display = 'block';

    let percentArray = new Array(config.models.length).fill(0);

    // 3. Load Models
    config.models.forEach((modelData, i) => {
        loader.load(modelData.path, (geometry) => {
            geometry.computeVertexNormals();

            let m = {
                color: modelData.color ?? 0xffffff,

                flatShading: false,
                vertexColors: false,

                roughness: 0.3,
                metalness: 0.2,

                polygonOffset: !!modelData.wire,
                polygonOffsetFactor: modelData.wire ? 1 : 0,
                polygonOffsetUnits: modelData.wire ? 1 : 0
            };

            if (modelData.setupMaterial) {
                modelData.setupMaterial(m);
            }
            const material = new THREE.MeshStandardMaterial(m);


            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData = modelData; // Store config in mesh

            if (modelData.wire) {
                const wireframe = new THREE.LineSegments(
                    new THREE.WireframeGeometry(geometry),
                    new THREE.LineBasicMaterial({ color: 0x505050, transparent: true, opacity: 0.15 })
                );
                mesh.add(wireframe);
            }

            const pivot = new THREE.Group();
            pivot.add(mesh);
            scene.add(pivot);

            loadedPivots.push(pivot);
            loadedMeshes.push(mesh);

            if (loadedMeshes.length === config.models.length) {
                autoPositionGrid();
                controls.reset();
                if (config.setup) {
                    config.setup(camera);
                }
                progressContainer.style.display = 'none';
            }
        }, (xhr) => {
            percentArray[i] = (xhr.loaded / xhr.total) * 100;
            let totalPercent = percentArray.reduce((a, b) => a + b, 0) / config.models.length;
            progressBar.style.width = totalPercent + '%';
            progressBar.innerText = Math.round(totalPercent) + '%';
        });
    });

    const titleElement = document.getElementById('sceneButton');
    if (titleElement) {
        titleElement.innerText = config.name + " ";
    }    
}

function autoPositionGrid() {
    if (loadedMeshes.length === 0) return;

    grid.rotation.y = 0;

    // 1. Create an empty bounding box
    const combinedBox = new THREE.Box3();

    // 2. Expand it to include every loaded mesh
    loadedMeshes.forEach(mesh => {
        // We use setFromObject to account for the mesh's position/scale
        const meshBox = new THREE.Box3().setFromObject(mesh);
        combinedBox.union(meshBox);
    });

    // 3. Get the minimum Z value
    const minZ = combinedBox.min.z;

    // 4. Move the grid slightly below that (e.g., 0.05 units) 
    // to prevent the model from "touching" the grid lines
    if (grid) {
        grid.position.z = minZ - 0.05;
    }
}

function animate(time) {
    requestAnimationFrame(animate);
    controls.update();
    
    // Only render and animate if models are ready
    if (loadedMeshes.length === config.models.length) {
        const t = time * 0.002;

        if (autoRotate) {
            loadedPivots.forEach(pivot => {
                pivot.rotation.z += 0.01;
            });
            if (grid) {
                grid.rotation.y += 0.01;
            }
        }

        loadedMeshes.forEach(mesh => {
            if (mesh.userData.animate) {
                mesh.userData.animate(mesh, t);
            }
        });
        renderer.render(scene, camera);
    }
}

// --- UI & Event Listeners ---
const sceneList = document.getElementById('sceneList');
sceneConfigurations.forEach((cfg, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item" href="#">${cfg.name}</a>`;
    li.onclick = (e) => {
        e.preventDefault();
        config = sceneConfigurations[index];
        loadScene();
    }
    sceneList.appendChild(li);
});

document.getElementById('autoRotateSwitch').addEventListener('change', (e) => {
    autoRotate = e.target.checked;
});

document.getElementById('btnResetCamera').addEventListener('click', (e) => {
    controls.reset();
    if (config.setup) {
        config.setup(camera);
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
});

// Start
setup();
loadScene();
animate(0);