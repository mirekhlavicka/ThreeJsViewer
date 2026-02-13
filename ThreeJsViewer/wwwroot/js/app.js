import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { sceneConfigurations } from './config.js?v=1.04';

// --- State Variables ---
let controls, renderer, scene, camera, grid;

let autoRotate = false;
let useVertexColors = false;
let useflatShading = false;
let doubleSide = false;
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

function loadScene(reset = true) {
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
                polygonOffsetUnits: showWire ? 1 : 0,

                side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
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
                if (reset) {
                    controls.reset();
                    if (config.setup) {
                        config.setup(camera);
                    }
                    animationTime = 0;
                } else if (isPaused) {
                    animateMeshes();
                }

                setTimeout(() => progressContainer.style.display = 'none', 500);
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
    grid.position.z = minZ - 0.02;
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
        if (autoRotate) {
            loadedPivots.forEach(pivot => {
                pivot.rotation.z += 0.01;
            });
            grid.rotation.y += 0.01;
        }

        animateMeshes();
    }

    renderer.render(scene, camera);
}

function animateMeshes() {
    const t = animationTime * 1.5; // Adjust 1.5 to match your preferred speed
    loadedMeshes.forEach(mesh => {
        if (mesh.userData.animate) {
            mesh.userData.animate(mesh, t);
        }
    });        
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

document.getElementById('doubleSideSwitch').addEventListener('change', (e) => {
    doubleSide = e.target.checked;
    loadedMeshes.forEach(mesh => {
        mesh.material.side = doubleSide ? THREE.DoubleSide : THREE.FrontSide;
        mesh.material.needsUpdate = true; 
    });
});

document.getElementById('showWireSwitch').addEventListener('change', (e) => {
    showWire = e.target.checked;
    loadScene(false);
});

document.getElementById('showGridSwitch').addEventListener('change', (e) => {
    grid.visible = e.target.checked;
});


document.getElementById('btnResetCamera').addEventListener('click', (e) => {
    controls.reset();
    if (config.setup) {
        config.setup(camera);
    }
    loadedPivots.forEach(pivot => {
        pivot.rotation.z = 0;
    });
    grid.rotation.y = 0;
});

document.getElementById('btnPause').addEventListener('click', (e) => {
    isPaused = !isPaused;

    const btnPause = e.currentTarget;
    const pauseIcon = btnPause.querySelector('#pauseIcon');
    const stepControls = document.getElementById('stepControls');    

    if (isPaused) {
        stepControls.classList.remove('d-none');
        pauseIcon.classList.replace('bi-pause-fill', 'bi-play-fill');
        btnPause.classList.replace('btn-outline-light', 'btn-success');

    } else {
        stepControls.classList.add('d-none');
        pauseIcon.classList.replace('bi-play-fill', 'bi-pause-fill');
        btnPause.classList.replace('btn-success', 'btn-outline-light');
    }
});

const stepSize = 0.025; // Change this to make the "jump" larger or smaller

// Step Forward Logic
document.getElementById('btnStepForward').addEventListener('click', () => {
    if (isPaused) {
        animationTime += stepSize;
        animateMeshes();
    }
});

// Step Backward Logic
document.getElementById('btnStepBack').addEventListener('click', () => {
    if (isPaused) {
        animationTime -= stepSize;
        animateMeshes();
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
});

window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'Space':
            e.preventDefault(); // Stop page from scrolling
            document.getElementById('btnPause').click();
            break;
        case 'KeyR':
            document.getElementById('btnResetCamera').click();
            break;
        case 'ArrowRight':
            if (isPaused) document.getElementById('btnStepForward').click();
            break;
        case 'ArrowLeft':
            if (isPaused) document.getElementById('btnStepBack').click();
            break;
    }
});

// Start
setup();
loadScene();
animate();