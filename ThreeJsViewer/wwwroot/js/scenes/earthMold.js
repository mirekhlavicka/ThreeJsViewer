import { smoothAnim } from '../utils.js';
import * as THREE from 'three';

export function createEarthMold2Scene(name, f, f1, f2, egg = false) {
    return {
        name: "Earth/" + name,
        setup: (camera) => {
            camera.position.set(3, 0, 1.5);
        },
        models: [
            {
                path: `assets/mold/${f1}.ply`,
                color: 0xFFEFC1,
                animate: (m, t) => anim2(m, t, -1)
            },
            {
                path: `assets/mold/${f2}.ply`,
                color: 0xFFEFC1,
                animate: (m, t) => anim2(m, t, 1)
            },
            {
                path: `assets/mold/${f}.ply`,
                animate: (m, t) => m.rotation.z = (2 * Math.PI) * smoothAnim(t, 10, 1, 4.5),
                setupMaterial: m => {
                    m.color = 0xffffff;
                    m.vertexColors = true;
                },
                prepareGeometry: g => globeColors(g, egg)
            }
        ]
    };
}       

export function createEarthMold4Scene(name, f, f1, f2, f3, f4, egg = false) {
    return {
        name: "Earth/" + name,
        setup: (camera) => {
            camera.position.set(3, 0, 1.5);
        },
        models: [
            {
                path: `assets/mold/${f1}.ply`,
                color: 0xFFEFC1,
                animate: (m, t) => anim4front(m, t, 1)
            },
            {
                path: `assets/mold/${f2}.ply`,
                color: 0xFFEFC1,
                animate: (m, t) => anim4front(m, t, -1)
            },
            {
                path: `assets/mold/${f3}.ply`,
                color: 0xFFEFC1,
                animate: (m, t) => anim4back(m, t, 1)
            },
            {
                path: `assets/mold/${f4}.ply`,
                color: 0xFFEFC1,
                animate: (m, t) => anim4back(m, t, -1)
            },
            {
                path: `assets/mold/${f}.ply`,
                animate: (m, t) => m.rotation.z = (2 * Math.PI) * smoothAnim(t, 10, 1, 4.5),
                setupMaterial: m => {
                    m.color = 0xffffff;
                    m.vertexColors = true;
                },
                prepareGeometry: g => globeColors(g, egg)
            }
        ]
    };
}       

function anim2(m, t, sign = 1) {
    m.position.y = sign * 2.0 * smoothAnim(t, 10, 0.5, 4.5);
    let v = smoothAnim(t, 10, 1.5, 4.5);
    m.rotation.z = sign * (Math.PI / 2) * v;
    m.position.x = -0.6 * v;
}

function anim4front(m, t, sign = 1) {
    m.position.y = sign * 2.0 * smoothAnim(t, 10, 0.5, 4.5);
    m.position.x = 0.4 * smoothAnim(t, 10, 0.5, 1.5);
    let v = smoothAnim(t, 10, 1.5, 4.5);
    m.rotation.z = sign * (Math.PI / 2) * v;
    //m.position.y += sign * 0.6 * smoothAnim(t, 10, 2.5, 4.5);
}

function anim4back(m, t, sign = 1) {
    m.position.y = sign * 2.0 * smoothAnim(t, 10, 0.5, 4.5);
    let v = smoothAnim(t, 10, 1.5, 4.5);
    m.rotation.z = sign * (Math.PI / 4) * v;
    m.position.x = -0.6 * v;
}

function globeColors(geometry, egg) {
    const pos = geometry.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    // 1. Find the Min/Max radius to establish a scale
    let minR = Infinity;
    let maxR = -Infinity;
    const radii = new Float32Array(count);

    for (let i = 0; i < count; i++) {

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

    // 2. Define our "Palette" points
    const colorWaterDeep = new THREE.Color(0x050a30); // Dark Blue
    const colorWaterShallow = new THREE.Color(0x005b96); // Light Blue
    const colorSand = new THREE.Color(0xc2b280); // Sand
    const colorGrass = new THREE.Color(0x228b22); // Forest Green
    const colorMountain = new THREE.Color(0x4b3621); // Dark Brown
    const colorSnow = new THREE.Color(0xffffff); // White

    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
        // Normalize radius between 0 and 1
        const h = (radii[i] - minR) / (maxR - minR);

        if (h < 0.45) {
            // Ocean gradient
            tempColor.lerpColors(colorWaterDeep, colorWaterShallow, h / 0.45);
        } else if (h < 0.50) {
            // Coastline/Beach
            tempColor.copy(colorSand);
        } else if (h < 0.75) {
            // Land gradient (Green to Brown)
            const t = (h - 0.50) / 0.25;
            tempColor.lerpColors(colorGrass, colorMountain, t);
        } else {
            // High Peaks (Brown to Snow)
            const t = (h - 0.75) / 0.25;
            tempColor.lerpColors(colorMountain, colorSnow, t);
        }

        colors[i * 3] = tempColor.r;
        colors[i * 3 + 1] = tempColor.g;
        colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}