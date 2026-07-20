import * as THREE from 'three';
import { icosaVertices } from '../penguin/icosa.js';
import { geoPlanes } from './geoplanes.js';
import { geosphereVertices } from './geosphere.js';

export function tetraFunc(x, y, z) {
    const sumOfSquares = x * x + y * y + z * z;
    return (sumOfSquares * sumOfSquares) + (8 * x * y * z) - (10 * sumOfSquares) + 20;
}
export function balls(count, R, r, p = 2, eps = 0.2) {
    let res = null;

    for (var i = 0; i < count; i++) {
        let x0 = R * Math.cos(i * 2 * Math.PI / count);
        let y0 = R * Math.sin(i * 2 * Math.PI / count);

        let f = (x, y, z) =>
            Math.abs(x - x0) ** p +
            Math.abs(y - y0) ** p +
            Math.abs(z) ** p -
            r ** p;
        if (res == null) {
            res = f
        } else {
            res = ORFuncs(res, f, eps);
        }
    }

    return res;
}

function smoothMin(a, b, k) {
    // If k is 0, return the sharp minimum to avoid division by zero
    if (k <= 0) return Math.min(a, b);

    // h is our "interpolation factor" between 0 and 1
    let h = Math.max(k - Math.abs(a - b), 0.0) / k;

    // Return the standard min minus the polynomial correction
    return Math.min(a, b) - h * h * k * 0.25;
}

function smoothMax(a, b, k) {
    if (k <= 0) return Math.max(a, b);

    let h = Math.max(k - Math.abs(a - b), 0.0) / k;

    // For max, we add the correction instead of subtracting it
    return Math.max(a, b) + h * h * k * 0.25;
}

export function ORFuncs(l, r, eps = 0.2) {
    return (x, y, z) => {
        let a = l(x, y, z);
        let b = r(x, y, z);
        return smoothMin(a, b, eps)
    }
}

export function ORManyFuncs(f, eps = 0.2) {
    let res = f[0];

    for (var i = 1; i < f.length; i++) {
        res = ORFuncs(res, f[i], eps);
    }

    return res;
}

export function ANDFuncs(l, r, eps = 0.2) {
    return (x, y, z) => {
        let a = l(x, y, z);
        let b = r(x, y, z);
        return smoothMax(a, b, eps)
    }
}

export function ANDManyFuncs(f, eps = 0.2) {
    let res = f[0];

    for (var i = 1; i < f.length; i++) {
        res = ANDFuncs(res, f[i], eps);
    }

    return res;
}

export function ballMinusBalls(r = 0.295, eps = 0.04) {
    let res = (x, y, z) => x * x + y * y + z * z - 1.005;

    for (let i = 0; i < icosaVertices.length; i++) {
        const v = icosaVertices[i];

        res = ANDFuncs(res, (x, y, z) => - ((x - 1.2 * v.x) ** 2 + (y - 1.2 * v.y) ** 2 + (z - 1.2 * v.z) ** 2) + r * r , eps);

    }

    return res;
}

export function ballPlusMinusBalls(r = 0.3, eps = 0.04) {
    let res = (x, y, z) => x * x + y * y + z * z - 1.005;

    let balls = null;
    let notballs = null;

    for (let i = 0; i < geosphereVertices.length; i++) {
        const v = geosphereVertices[i];

        if (v.tag == 0) {

            let b = (x, y, z) => (x - 0.8 * v.x) ** 2 + (y - 0.8 * v.y) ** 2 + (z - 0.8 * v.z) ** 2 - (r + 0.005) ** 2;

            if (balls == null) {
                balls = b;
            } else {
                balls = ORFuncs(balls, b, eps);
            }

        } else {

            let b = (x, y, z) => - ((x - 1.2 * v.x) ** 2 + (y - 1.2 * v.y) ** 2 + (z - 1.2 * v.z) ** 2) + (r - 0.005) ** 2;

            if (notballs == null) {
                notballs = b;
            } else {
                notballs = ANDFuncs(notballs, b, eps);
            }

        }
    }

    res = ORFuncs(res, balls, eps);
    res = ANDFuncs(res, notballs, eps);

    return res;
}

export function torusPlusMinusBalls(count1 = 8, count2 = 4, R = 0.7, r = 0.3, eps = 0.02) {
    let res = (x, y, z) => (Math.sqrt(x * x + y * y) - R) ** 2 + z * z - (r /*+ 0.005*/) ** 2;

    let balls = null;
    let notballs = null;

    for (let i = 0; i < count1; i++)
        for (let j = 0; j < count2; j++) {
            let fi = i * 2 * Math.PI / count1;
            let psi = j * 2 * Math.PI / count2;
            let r0 = 0.125 + 0.1 * Math.abs(psi - Math.PI) / Math.PI;
            let rr = r + (((i + j) % 2 == 0) ? -0.5 * r0 : 0.5 * r0);
            let x0 = (R + rr * Math.cos(psi)) * Math.cos(fi);
            let y0 = (R + rr * Math.cos(psi)) * Math.sin(fi);
            let z0 = rr * Math.sin(psi);

            if ((i + j) % 2 == 0) {

                let b = (x, y, z) => (x - x0) ** 2 + (y - y0) ** 2 + (z - z0) ** 2 - (r0 /*+ 0.005*/) ** 2;

                if (balls == null) {
                    balls = b;
                } else {
                    balls = ORFuncs(balls, b, eps);
                }

            } else {

                let b = (x, y, z) => - ((x - x0) ** 2 + (y - y0) ** 2 + (z - z0) ** 2) + (r0/* - 0.005*/) ** 2;

                if (notballs == null) {
                    notballs = b;
                } else {
                    notballs = ANDFuncs(notballs, b, eps);
                }

            }
        }

    res = ORFuncs(res, balls, eps);
    res = ANDFuncs(res, notballs, eps);

    return res;
}


export function geodesicSphere(eps = 0.004) {
    let res = null;

    for (let i = 0; i < geoPlanes.length; i++) {
        const p = geoPlanes[i];

        let f = (x, y, z) => (x - p.v.x) * p.n.x + (y - p.v.y) * p.n.y + (z - p.v.z) * p.n.z;

        if (res == null) {
            res = f
        } else {
            res = ANDFuncs(res, f, eps);
        }

    }

    return res;
}

export function dice(eps = 0.02) {
    // Total of 21 points mapped to the 6 faces of a [-d, d] 3D cube.
    // Arranged sequentially from Face 1 to Face 6.
    const d = 1.15;
    const dicePips = [
        // --- Side 1 (1 point) on Z = 1 (Front) ---
        [0.0, 0.0, d],

        // --- Side 2 (2 points) on X = -1 (Left) ---
        [-d, -0.5, -0.5],
        [-d, 0.5, 0.5],

        // --- Side 3 (3 points) on Y = -1 (Bottom) ---
        [-0.5, -d, -0.5],
        [0.0, -d, 0.0],
        [0.5, -d, 0.5],

        // --- Side 4 (4 points) on Y = 1 (Top) ---
        [-0.5, d, -0.5],
        [-0.5, d, 0.5],
        [0.5, d, -0.5],
        [0.5, d, 0.5],

        // --- Side 5 (5 points) on X = 1 (Right) ---
        [d, -0.5, -0.5],
        [d, -0.5, 0.5],
        [d, 0.0, 0.0],
        [d, 0.5, -0.5],
        [d, 0.5, 0.5],

        // --- Side 6 (6 points) on Z = -1 (Back) ---
        [-0.5, -0.5, -d],
        [-0.5, 0.0, -d],
        [-0.5, 0.5, -d],
        [0.5, -0.5, -d],
        [0.5, 0.0, -d],
        [0.5, 0.5, -d]
    ];

    let res = (x, y, z) => (x ** 8 + y ** 8 + z ** 8) ** (1.0 / 8.0) - 1.000;
    let pips = null;

    for (let i = 0; i < dicePips.length; i++) {
        const p = dicePips[i];

        let f = (x, y, z) => - ((x - p[0]) ** 2 + (y - p[1]) ** 2 + (z - p[2]) ** 2) + 0.06;

        if (pips == null) {
            pips = f;
        } else {
            pips = ANDFuncs(pips, f, 0);
        }
    }

    res = ANDFuncs(res, pips, 0.02);

    return res;
}