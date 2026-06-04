import * as THREE from 'three';
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
