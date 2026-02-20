import * as THREE from 'three';

export function triangle01(t, period = 1) {
    let x = t / period;
    x = x - Math.floor(x);     // fractional part
    return x < 0.5 ? 2 * x : 2 * (1 - x);
}

export function sinSmooth(y, y0, y1) {
    y = -Math.PI / 2 + Math.PI * (y - y0) / (y1 - y0);

    return y0 + (y1 - y0) * (Math.sin(y) + 1) / 2;
}

export function smoothAnim(t, period = 1, t0 = 0, t1 = 1) {
    const v0 = triangle01(t0, period);
    const v1 = triangle01(t1, period);
    let v = triangle01(t, period);

    v = (-v0 + Math.min(Math.max(v, v0), v1)) / (v1 - v0);
    return sinSmooth(v, 0, 1);
}

export function goldMaterial(m) {
    m.metalness = 0.7;
    m.roughness = 0.3;
    m.emissive = 0xffa500;
    m.emissiveIntensity = 0.1;
}

export function globeColors(geometry, egg) {
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