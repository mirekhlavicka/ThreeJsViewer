import * as THREE from 'three';
export function tetraFunc(x, y, z) {
    const sumOfSquares = x * x + y * y + z * z;
    return (sumOfSquares * sumOfSquares) + (8 * x * y * z) - (10 * sumOfSquares) + 20;
}
