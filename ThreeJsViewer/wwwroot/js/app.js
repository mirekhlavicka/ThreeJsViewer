import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { sceneConfigurations } from './config.js?v=1.10';

// --- State Variables ---
let config;

let controls, renderer, scene, camera, grid, pivot;

let autoRotate = false;
let useVertexColors = false;
let useflatShading = false;
let doubleSide = false;
let showWire = false;
let isPaused = false;

let animationSpeed = 1.2;
let autoRotateSpeed = 0.01;
let materialRoughness = 0.3;
let materialMetalness = 0.2;
    
const loadedMeshes = []; 
const loader = new PLYLoader();

const timer = new THREE.Timer();
let animationTime = 0; // Our custom "accumulated" time

// URL Parameter Logic

function setup() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x3a3a3a);
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
    grid = new THREE.GridHelper(4, 12, 0x555555, 0x444444);
    grid.rotation.x = Math.PI / 2; // If your "up" is Z, or leave as is if "up" is Y    
}

function loadScene(reset = true) {
    // 1. Cleanup existing
    if (pivot) {
        pivot.traverse(node => {
            if (node === grid) return;

            if (node.isMesh || node.isLineSegments) {
                node.geometry.dispose();
                node.material.dispose();
            }
        });
        scene.remove(pivot);
        loadedMeshes.length = 0;
    }

    // 2. Reset Progress UI
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    progressBar.style.width = '0%';
    progressBar.innerText = '0%';
    progressContainer.style.display = 'block';

    let percentArray = new Array(config.models.length).fill(0);

    pivot = new THREE.Group();
    pivot.add(grid);
    scene.add(pivot);

    // 3. Load Models
    config.models.forEach((modelData, i) => {
        loader.load(modelData.path, (geometry) => {

            if (modelData.prepareGeometry) {
                modelData.prepareGeometry(geometry);
            }

            geometry.computeVertexNormals();

            let material = null;
            if (modelData.glass) {
                material = new THREE.MeshPhysicalMaterial({
                    thickness: 0.5,        // Depth of the glass
                    roughness: 0.0,        // Perfectly smooth
                    transmission: 1.0,     // 100% of light passes through
                    ior: 1.5,             // Index of Refraction (1.5 is standard for glass)
                    opacity: 1,           // Keep this at 1; transmission handles transparency
                    transparent: true,    // Must be true for transmission to work
                    envMapIntensity: 1.5,
                    color: useVertexColors ? 0xffffff : modelData.color ?? 0xffffff
                });

            } else {

                let m = {
                    color: useVertexColors ? 0xffffff : modelData.color ?? 0xffffff,

                    flatShading: useflatShading,
                    vertexColors: useVertexColors,

                    roughness: materialRoughness,
                    metalness: materialMetalness,

                    polygonOffset: showWire,
                    polygonOffsetFactor: showWire ? 1 : 0,
                    polygonOffsetUnits: showWire ? 1 : 0,

                    side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
                };

                if (modelData.setupMaterial) {
                    modelData.setupMaterial(m);
                }
                material = new THREE.MeshStandardMaterial(m);
            }

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData = modelData; // Store config in mesh

            if (showWire) {
                const wireframe = new THREE.LineSegments(
                    new THREE.WireframeGeometry(geometry),
                    new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
                );
                mesh.add(wireframe);
            }

            pivot.add(mesh);

            if (modelData.prepareMesh) {
                modelData.prepareMesh(mesh);
            }

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

    let title = config.name;
    if (title.includes('/')){
        title = title.split('/')[1];
    }

    document.getElementById('sceneButton').innerText = title + " ";
    document.title = title;
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
    timer.update();
    const delta = timer.getDelta();

    // Only render and animate if models are ready
    if (loadedMeshes.length !== config.models.length) {
        return;
    }

    // ONLY increase our custom time if we are not paused
    if (!isPaused) {
        // 0.002 is your speed multiplier
        animationTime += delta * animationSpeed;
    }

    if (!isPaused) {
        if (autoRotate) {
            pivot.rotation.z += autoRotateSpeed;
        }

        animateMeshes();
    }

    renderer.render(scene, camera);
}

function animateMeshes() {
    loadedMeshes.forEach(mesh => {
        if (mesh.userData.animate) {
            mesh.userData.animate(mesh, animationTime);
        }
    });        
}

// --- UI & Event Listeners ---

const sceneList = document.getElementById('sceneList');

// 1. Group scenes by their prefix (folder)
const groups = {};
sceneConfigurations.forEach((cfg, index) => {
    if (cfg.name.includes('/')) {
        const [parent, child] = cfg.name.split('/');
        if (!groups[parent]) groups[parent] = [];
        groups[parent].push({ name: child, index: index });
    } else {
        // Use a special key for top-level items
        if (!groups["_root"]) groups["_root"] = [];
        groups["_root"].push({ name: cfg.name, index: index });
    }
});

// 2. Helper to create a scene link
function createLink(name, index) {
    const li = document.createElement('li');
    // Add a data-index to make it easy to find later
    li.innerHTML = `<a class="dropdown-item" href="#" data-index="${index}">${name}</a>`;

    li.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Use the common loader logic
        selectScene(index);
    };
    return li;
}

// Separate the "selection" logic so you can call it on page load
function selectScene(index) {
    // 1. UI: Update Active Class
    document.querySelectorAll('#sceneList .dropdown-item').forEach(el => {
        // Match by our data-index
        if (el.getAttribute('data-index') == index) {
            el.classList.add('active');
            // If it's inside a submenu, expand that submenu so user sees where they are
            const parentSub = el.closest('.dropdown-submenu');
            if (parentSub) parentSub.classList.add('show-mobile');
        } else {
            el.classList.remove('active');
        }
    });

    // 2. Data: Update config
    config = sceneConfigurations[index];

    // 3. URL: Update history
    const url = new URL(window.location);
    url.searchParams.set('model', index);
    window.history.pushState({}, '', url);

    // 4. Engine: Load
    loadScene();
}

// 3. Render submenus FIRST
Object.keys(groups).forEach(groupName => {
    if (groupName === "_root") return;

    const dropdownLi = document.createElement('li');
    dropdownLi.className = 'dropdown-submenu dropend';

    // Create the parent link
    const parentLink = document.createElement('a');
    parentLink.className = 'dropdown-item dropdown-toggle';
    parentLink.href = '#';
    parentLink.innerText = groupName;

    // Handle the tap/click to toggle submenu
    parentLink.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Keep the main Bootstrap menu open

        // Find all other open submenus in the same menu and close them
        const parentMenu = dropdownLi.parentElement;
        parentMenu.querySelectorAll('.dropdown-submenu.show-mobile').forEach(openSub => {
            if (openSub !== dropdownLi) {
                openSub.classList.remove('show-mobile');
            }
        });

        dropdownLi.classList.toggle('show-mobile');
    };

    const subUl = document.createElement('ul');
    subUl.className = 'dropdown-menu dropdown-menu-dark';

    groups[groupName].forEach(item => {
        subUl.appendChild(createLink(item.name, item.index));
    });

    dropdownLi.appendChild(parentLink);
    dropdownLi.appendChild(subUl);
    sceneList.appendChild(dropdownLi);
});

// 4. Add a divider if we have both submenus and root items
if (Object.keys(groups).length > 1 && groups["_root"]) {
    const divider = document.createElement('li');
    divider.innerHTML = '<hr class="dropdown-divider">';
    sceneList.appendChild(divider);
}

// 5. Render root items LAST
if (groups["_root"]) {
    groups["_root"].forEach(item => {
        sceneList.appendChild(createLink(item.name, item.index));
    });
}

document.getElementById('autoRotateSwitch').addEventListener('change', (e) => {
    autoRotate = e.target.checked;
});

document.getElementById('vertexColorsSwitch').addEventListener('change', (e) => {
    useVertexColors = e.target.checked;

    loadedMeshes.forEach(mesh => {

        if (!mesh.userData.setupMaterial) {

            mesh.material.vertexColors = useVertexColors;
            if (useVertexColors) {
                mesh.material.color.set(0xffffff);
            } else {
                mesh.material.color.set(mesh.userData.color ?? 0xffffff);
            }

            mesh.material.needsUpdate = true;
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
    pivot.rotation.z = 0;
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


// Animation Speed Slider
const animRange = document.getElementById('animSpeedRange');
const animValLabel = document.getElementById('animSpeedVal');

animRange.addEventListener('input', (e) => {
    animationSpeed = parseFloat(e.target.value);
    animValLabel.innerText = animationSpeed.toFixed(1);
});

// Auto-Rotation Speed Slider
const rotRange = document.getElementById('rotateSpeedRange');
const rotValLabel = document.getElementById('rotSpeedVal');

rotRange.addEventListener('input', (e) => {
    autoRotateSpeed = parseFloat(e.target.value);
    rotValLabel.innerText = autoRotateSpeed.toFixed(4);
});

// Roughness Slider
const roughnessRange = document.getElementById('roughnessRange');
const roughnessValLabel = document.getElementById('roughnessVal');

roughnessRange.addEventListener('input', (e) => {
    materialRoughness = parseFloat(e.target.value);
    roughnessValLabel.innerText = materialRoughness.toFixed(2);

    loadedMeshes.forEach(mesh => {
        mesh.material.roughness = materialRoughness;
    });
});

// Metalness Slider
const metalnessRange = document.getElementById('metalnessRange');
const metalnessValLabel = document.getElementById('metalnessVal');

metalnessRange.addEventListener('input', (e) => {
    materialMetalness = parseFloat(e.target.value);
    metalnessValLabel.innerText = materialMetalness.toFixed(2);

    loadedMeshes.forEach(mesh => {
        mesh.material.metalness = materialMetalness;
    });
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

const initialModel = new URLSearchParams(window.location.search).get('model') || 0; // Default to first scene
selectScene(initialModel);

animate();