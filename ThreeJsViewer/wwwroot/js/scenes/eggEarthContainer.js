import { smoothAnim } from '../utils.js';
import * as THREE from 'three';

export const eggEarthContainerScene = {
    name: "Earth/Egg Container",
    models: [
        {
            path: 'assets/EggEarthContainer/eggbottom1.ply',
            color: 0xffd700,
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: prepareGeometry,
            animate: (m, t) => {
                earthquake(m, t);
            }
        },
        {
            path: 'assets/EggEarthContainer/eggtop1.ply',
            color: 0xffd700,
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            },
            prepareGeometry: prepareGeometry,
            animate: (m, t) => {
                earthquake(m, t);

                m.position.z += 0.9 * smoothAnim(t, 25, 1.5, 4.5);
                m.rotation.y = (Math.PI / 4) * smoothAnim(t, 25, 2.5, 4.5);
                m.rotation.x = (Math.PI / 6) * smoothAnim(t, 25, 3.5, 4.5);
            }
        },
        {
            path: 'assets/EggEarthContainer/dragon.ply',
            color: 0xF8E47E,
            prepareGeometry: g => {
                g.rotateZ(-Math.PI / 2);
                g.scale(0.5, 0.5, 0.5);
            },
            createMaterial: () => createTwistMaterial(0xF8E47E),
            animate: (m, t) => {
                m.material.userData.uTime.value = t;

                //earthquake(m, t);

                /*m.position.z = 1.0 * smoothAnim(t, 15, 1.5, 4.5);
                m.rotation.z = -(0.25 * Math.PI) * smoothAnim(t, 15, 2.5, 4.5);

                m.position.x = -1.5 * smoothAnim(t, 15, 4.5, 7.5);
                m.position.y = 1.5 * smoothAnim(t, 15, 4.5, 7.5);
                m.rotation.y = (-0.25 * Math.PI) * smoothAnim(t, 15, 4.5, 7.5);*/

                updateDragonAnimation(m, t);
            }
        }
    ]
}
function prepareGeometry(g) {
    g.rotateZ(-0.9 * Math.PI);
    globeColors(g, true)
}

function earthquake(m, t) {
    m.position.y = 0.02 * Math.sin(25 * smoothAnim(t, 25, 0, 2.8));
    m.position.x = 0.03 * Math.sin(35 * smoothAnim(t, 25, 0, 2.8));
    m.position.z = 0.01 * Math.sin(15 * smoothAnim(t, 25, 0, 2.8));
}

function globeColors(geometry, egg) {
    const pos = geometry.attributes.position;
    const originalColors = geometry.attributes.color;
    const count = pos.count;
    const newColors = new Float32Array(count * 3);
    const radii = new Float32Array(count);

    let minR = Infinity;
    let maxR = -Infinity;

    // 1. Establish the Elevation Scale (Earth Surface Only)
    for (let i = 0; i < count; i++) {
        const rVal = originalColors.getX(i);
        const gVal = originalColors.getY(i);
        const bVal = originalColors.getZ(i);

        // YOUR TEST: Check if this vertex is part of the Earth surface
        const isEarth = (rVal > 0.9 && gVal > 0.2 && gVal < 0.25 && bVal > 0.2 && bVal < 0.25);

        if (isEarth) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);

            if (egg) {
                let s1 = 1.2;
                let s2 = 1.7;
                let s = s1 + (s2 - s1) * (z + 1) / 2;
                x *= s; y *= s;
            }

            const r = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
            radii[i] = r;

            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
        }
    }

    minR = 0.9517397714244147;
    maxR = 1.02212966480691;

    // 2. Define Palette
    const colorWaterDeep = new THREE.Color(0x050a30);
    const colorWaterShallow = new THREE.Color(0x005b96);
    const colorSand = new THREE.Color(0xc2b280);
    const colorGrass = new THREE.Color(0x228b22);
    const colorMountain = new THREE.Color(0x4b3621);
    const colorSnow = new THREE.Color(0xffffff);

    const tempColor = new THREE.Color();

    // 3. Set Final Colors
    for (let i = 0; i < count; i++) {
        const rVal = originalColors.getX(i);
        const gVal = originalColors.getY(i);
        const bVal = originalColors.getZ(i);

        const isEarth = (rVal > 0.9 && gVal > 0.2 && gVal < 0.25 && bVal > 0.2 && bVal < 0.25);

        if (isEarth) {
            // Calculate terrain height based on the minR/maxR of the surface only
            const h = (radii[i] - minR) / (maxR - minR);

            if (h < 0.42) {
                tempColor.lerpColors(colorWaterDeep, colorWaterShallow, h / 0.42);
            } else if (h < 0.50) {
                tempColor.copy(colorSand);
            } else if (h < 0.75) {
                const t = (h - 0.50) / 0.25;
                tempColor.lerpColors(colorGrass, colorMountain, t);
            } else {
                const t = (h - 0.75) / 0.25;
                tempColor.lerpColors(colorMountain, colorSnow, t);
            }
        } else {
            // Non-earth parts (hollow/mold) set to pure White
            tempColor.set(0xffffff);
        }

        newColors[i * 3] = tempColor.r;
        newColors[i * 3 + 1] = tempColor.g;
        newColors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
    geometry.attributes.color.needsUpdate = true;
}

function createTwistMaterial(baseColorHex) {
    // 1. Create standard material (keeps your lighting/colors)
    const material = new THREE.MeshStandardMaterial({
        color: baseColorHex,
        flatShading: false,
        vertexColors: false,
        metalness: 0.7,
        roughness: 0.3
    });

    // 2. Define uniforms to pass data from JS to the Shader
    material.userData.uTime = { value: 0 };
    material.userData.uTwistStrength = { value: 1.5 };

    material.onBeforeCompile = (shader) => {
        // Pass our JS uniforms into the shader
        shader.uniforms.uTime = material.userData.uTime;
        shader.uniforms.uTwistStrength = material.userData.uTwistStrength;

        // 3. Inject uniform declarations into Vertex Shader
        shader.vertexShader = `
            uniform float uTime;
            uniform float uTwistStrength;
        ` + shader.vertexShader;

        // 4. Inject the deformation math
        // 'transformed' is the standard Three.js variable for vertex position
        shader.vertexShader = shader.vertexShader.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            
            // Calculate angle based on height (y) and time
            // sin(uTime) makes it breathe back and forth
            float angle =
                //smoothstep(-0.1, 0.2, transformed.z + transformed.x) *
                smoothstep(-0.2, 0.2, transformed.z) *
                smoothstep(-0.2, 0.2, transformed.x) *
                transformed.y * uTwistStrength * sin(uTime * 4.0 - (transformed.x * 0.5));
            
            float s = sin(angle);
            float c = cos(angle);
            
            // Apply 2D rotation matrix to X and Z coordinates
            mat2 rotationMatrix = mat2(c, -s, s, c);
            transformed.xy = rotationMatrix * transformed.xy;


            angle = 0.3 * smoothstep(-0.2, 0.0, transformed.z) * sin(uTime * 3.0);
            s = sin(angle);
            c = cos(angle);

            // Apply 2D rotation matrix to X and Z coordinates
            rotationMatrix = mat2(c, -s, s, c);

            transformed.xy = rotationMatrix * transformed.xy;

            `
        );
    };

    return material;
}

// Variables to track the "Orbit" state
let orbitRadius = 0;
let initialOrbitAngle = 0;

function updateDragonAnimation(mesh, time) {
    if (time < 1.5) return;

    // 1. PHASE 1: 1.5s to 4.5s (Rise and Rotate)
    if (time < 4.5) {
        let t = (time - 1.5) / 3;
        // Apply Easing
        t = THREE.MathUtils.smoothstep(t, 0, 1);

        mesh.position.z = THREE.MathUtils.lerp(0, 1.0, t);
        mesh.rotation.z = -THREE.MathUtils.lerp(0, Math.PI / 4, t);
    }

    // 2. PHASE 2: 4.5s to 7.5s (Move Radially Forward)
    else if (time < 7.5) {
        let t = (time - 4.5) / 3;
        t = THREE.MathUtils.smoothstep(t, 0, 1); // Smooth acceleration and deceleration

        const distance = THREE.MathUtils.lerp(0, 1.5, t);
        const angle = Math.PI - Math.PI / 4;

        mesh.position.x = Math.cos(angle) * distance;
        mesh.position.y = Math.sin(angle) * distance;

        // Gentle descent and lean
        mesh.position.z = 1.0 - (t / 4.0);
        //mesh.rotation.x = (-0.15 * Math.PI) * t;
        //mesh.rotation.y = (-0.15 * Math.PI) * t;

        orbitRadius = 1.5;
        initialOrbitAngle = angle;
    }

    // 3. PHASE 3: 7.5s to 9.5s (Local Rotation)
    else if (time < 9.5) {
        let t = (time - 7.5) / 2;
        t = THREE.MathUtils.smoothstep(t, 0, 1);

        mesh.rotation.z = -Math.PI / 4 + THREE.MathUtils.lerp(0, Math.PI / 2, t);
    }

    // 4. PHASE 4: 9.5s+ (The Global Orbit)
    else {
        const orbitTime = time - 9.5;

        // --- SMOOTH ORBIT ENTRY ---
        // To avoid the dragon "jerking" into motion at 8.5s, 
        // we ease the orbit speed from 0 to 0.5 over the first 4 seconds.
        const entryEase = THREE.MathUtils.smoothstep(orbitTime / 4.0, 0, 1);
        const orbitSpeed = 0.5 * entryEase;

        // Note: For a perfectly smooth orbit entry, we integrate the speed, 
        // but for a simple visual, accelerating the 'time' factor works:
        const currentAngle = initialOrbitAngle + (orbitTime * orbitSpeed);

        mesh.position.x = Math.cos(currentAngle) * orbitRadius;
        mesh.position.y = Math.sin(currentAngle) * orbitRadius;
        mesh.rotation.z = currentAngle - Math.PI / 2;

        // Return rotations to neutral during orbit
        //mesh.rotation.x *= 0.95;
        //mesh.rotation.y *= 0.95;
    }
}

/*function updateDragonAnimation(mesh, time) {
    if (time < 1.5) return;

    // Configuration for the "Return" trip
    const rotations = 1; // X rotations
    const orbitDuration = (Math.PI * 2 * rotations) / 0.5 + 4.0; // Adding the 4s ease-in time
    const phase4End = 9.5 + orbitDuration;

    // 1. PHASE 1: 1.5s to 4.5s (Rise and Rotate)
    if (time < 4.5) {
        let t = THREE.MathUtils.smoothstep((time - 1.5) / 3, 0, 1);
        mesh.position.z = THREE.MathUtils.lerp(0, 1.0, t);
        mesh.rotation.z = -THREE.MathUtils.lerp(0, Math.PI / 4, t);
    }

    // 2. PHASE 2: 4.5s to 7.5s (Move Radially Forward)
    else if (time < 7.5) {
        let t = THREE.MathUtils.smoothstep((time - 4.5) / 3, 0, 1);
        const distance = THREE.MathUtils.lerp(0, 1.5, t);
        const angle = Math.PI - Math.PI / 4;

        mesh.position.x = Math.cos(angle) * distance;
        mesh.position.y = Math.sin(angle) * distance;
        mesh.position.z = 1.0 - (t / 4.0);

        orbitRadius = 1.5;
        initialOrbitAngle = angle;
    }

    // 3. PHASE 3: 7.5s to 9.5s (Local Rotation for Orbit Entry)
    else if (time < 9.5) {
        let t = THREE.MathUtils.smoothstep((time - 7.5) / 2, 0, 1);
        mesh.rotation.z = -Math.PI / 4 + THREE.MathUtils.lerp(0, Math.PI / 2, t);
    }

    // 4. PHASE 4: 9.5s to phase4End (The Global Orbit)
    else if (time < phase4End) {
        const orbitTime = time - 9.5;
        const entryEase = THREE.MathUtils.smoothstep(orbitTime / 4.0, 0, 1);
        const orbitSpeed = 0.5 * entryEase;
        const currentAngle = initialOrbitAngle + (orbitTime * orbitSpeed);

        mesh.position.x = Math.cos(currentAngle) * orbitRadius;
        mesh.position.y = Math.sin(currentAngle) * orbitRadius;
        mesh.rotation.z = currentAngle - Math.PI / 2;

        // Store the final angle to ensure Phase 5 starts exactly where Phase 4 ends
        mesh.userData.finalOrbitAngle = currentAngle;
    }

    // 5. PHASE 5: (Local Rotation for Return) - Mirror Phase 3
    else if (time < phase4End + 2.0) {
        let t = THREE.MathUtils.smoothstep((time - phase4End) / 2, 0, 1);
        const startAng = mesh.userData.finalOrbitAngle - Math.PI / 2;

        // Dragon turns back to face the center
        mesh.rotation.z = startAng + THREE.MathUtils.lerp(0, Math.PI, t);
    }

    // 6. PHASE 6: (Move Radially Back) - Mirror Phase 2
    else if (time < phase4End + 5.0) {
        let t = THREE.MathUtils.smoothstep((time - (phase4End + 2.0)) / 3, 0, 1);
        const distance = THREE.MathUtils.lerp(1.5, 0, t);
        const angle = mesh.userData.finalOrbitAngle; // Keep the angle where it stopped

        mesh.position.x = Math.cos(angle) * distance;
        mesh.position.y = Math.sin(angle) * distance;
        mesh.position.z = 0.75 + (t / 4.0); // Returning to 1.0 height
    }

    // 7. PHASE 7: (Descend) - Mirror Phase 1
    else if (time < phase4End + 8.0) {
        let t = THREE.MathUtils.smoothstep((time - (phase4End + 5.0)) / 3, 0, 1);
        mesh.position.z = THREE.MathUtils.lerp(1.0, 0, t);
        // Slowly return rotation.z to 0 or its original state
        mesh.rotation.z = mesh.rotation.z * (1.0 - t);
    }
}*/