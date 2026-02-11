import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { sceneConfigurations } from './config.js?v=1.02';

// --- State Variables ---
let controls, renderer, scene, camera, grid;

let autoRotate = false;
let useVertexColors = false;
let useflatShading = false;
let showWire = false;
let isPaused = false;

const loadedPivots = []; 
const loadedMeshes = []; 
const loader = new PLYLoader();

const clock = new THREE.Clock();
let animationTime = 0; // Our custom "accumulated" time

// URL Parameter Logic
let config = sceneConfigurations[Math.min(Math.max(parseInt(new URLSearchParams(window.location.search).get('model')) || 0, 0), sceneConfigurations.length - 1)];

function setup() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.002);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up.set(0, 0, 1);
    camera.position.set(-3, 0 , 1.5);

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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(1, 1, 1);
    camera.add(dirLight);
    dirLight.target.position.set(0, 0, -1);
    camera.add(dirLight.target);
    scene.add(camera);

    // Add a grid to the "floor" (XZ plane)
    grid = new THREE.GridHelper(4, 12, 0x444444, 0x222222);
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
                color: useVertexColors ? 0xffffff  : modelData.color ?? 0xffffff,

                flatShading: useflatShading,
                vertexColors: useVertexColors,

                roughness: 0.3,
                metalness: 0.2,

                polygonOffset: showWire,
                polygonOffsetFactor: showWire ? 1 : 0,
                polygonOffsetUnits: showWire ? 1 : 0
            };

            if (modelData.setupMaterial) {
                modelData.setupMaterial(m);
            }
            const material = new THREE.MeshStandardMaterial(m);

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData = modelData; // Store config in mesh

            if (showWire) {
                const wireframe = new THREE.LineSegments(
                    new THREE.WireframeGeometry(geometry),
                    new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
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
                animationTime = 0;
                progressContainer.style.display = 'none';
            }
        }, (xhr) => {
            percentArray[i] = (xhr.loaded / xhr.total) * 100;
            let totalPercent = percentArray.reduce((a, b) => a + b, 0) / config.models.length;
            progressBar.style.width = totalPercent + '%';
            progressBar.innerText = Math.round(totalPercent) + '%';
        });
    });

    document.getElementById('sceneButton').innerText = config.name + " ";
    document.title = config.name;
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
        grid.position.z = minZ - 0.02;
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Get the time passed since the last frame
    const delta = clock.getDelta();
    
    // Only render and animate if models are ready
    if (loadedMeshes.length !== config.models.length) {
        return;
    }

    // ONLY increase our custom time if we are not paused
    if (!isPaused) {
        // 0.002 is your speed multiplier
        animationTime += delta;
    }

    if (!isPaused) {
        //const t = time * 0.002;
        const t = animationTime * 1.5; // Adjust 1.5 to match your preferred speed

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
    }

    renderer.render(scene, camera);
}

// --- UI & Event Listeners ---
const sceneList = document.getElementById('sceneList');
sceneConfigurations.forEach((cfg, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="dropdown-item" href="#">${cfg.name}</a>`;
    li.onclick = (e) => {
        e.preventDefault();
        config = sceneConfigurations[index];

        // 2. Update the URL without reloading the page
        const url = new URL(window.location);
        url.searchParams.set('model', index);
        window.history.pushState({}, '', url);

        loadScene();
    }
    sceneList.appendChild(li);
});

document.getElementById('autoRotateSwitch').addEventListener('change', (e) => {
    autoRotate = e.target.checked;
});

document.getElementById('vertexColorsSwitch').addEventListener('change', (e) => {
    useVertexColors = e.target.checked;

    loadedMeshes.forEach(mesh => {
        mesh.material.vertexColors = useVertexColors;

        mesh.material.needsUpdate = true;

        if (useVertexColors) {
            mesh.material.color.set(0xffffff);
        } else {
            mesh.material.color.set(mesh.userData.color ?? 0xffffff);
        }
    });
});

document.getElementById('flatShadingSwitch').addEventListener('change', (e) => {
    useflatShading = e.target.checked;

    loadedMeshes.forEach(mesh => {
        mesh.material.flatShading = useflatShading;
        mesh.material.needsUpdate = true;
    });
});

document.getElementById('showWireSwitch').addEventListener('change', (e) => {
    showWire = e.target.checked;
    loadScene();
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

document.getElementById('btnPause').addEventListener('click', (e) => {
    isPaused = !isPaused;

    const btnPause = e.currentTarget;
    const pauseIcon = btnPause.querySelector('#pauseIcon');

    // Swap Icons
    if (isPaused) {
        pauseIcon.classList.replace('bi-pause-fill', 'bi-play-fill');
        btnPause.classList.replace('btn-outline-light', 'btn-success'); // Turn green when paused?
    } else {
        pauseIcon.classList.replace('bi-play-fill', 'bi-pause-fill');
        btnPause.classList.replace('btn-success', 'btn-outline-light');
    }
});

// Start
setup();
loadScene();
animate();