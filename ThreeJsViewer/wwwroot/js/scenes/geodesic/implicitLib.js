import * as THREE from 'three';
export function tetraFunc(x, y, z) {
    const sumOfSquares = x * x + y * y + z * z;
    return (sumOfSquares * sumOfSquares) + (8 * x * y * z) - (10 * sumOfSquares) + 20;
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

    h = Math.max(k - Math.abs(a - b), 0.0) / k;

    // For max, we add the correction instead of subtracting it
    return Math.max(a, b) + h * h * k * 0.25;
}

export function ORFuncs(l, r, eps) {
    return (x, y, z) => {
        let a = l(x, y, z);
        let b = r(x, y, z);
        return smoothMin(a, b, eps)
    }
}