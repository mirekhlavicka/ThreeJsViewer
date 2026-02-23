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