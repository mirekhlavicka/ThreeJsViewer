import * as THREE from 'three';

/**
 * ImplicitGeodesicPro
 * A zero-GC, high-performance module for calculating geodesics on implicit surfaces.
 */

// ==========================================================
// MEMORY POOL (Zero Garbage Collection during the game loop)
// ==========================================================
const _pos = new THREE.Vector3();
const _nextPos = new THREE.Vector3();
const _n0 = new THREE.Vector3();
const _n1 = new THREE.Vector3();
const _k = new THREE.Vector3();
const _crossKV = new THREE.Vector3();
const _rawGrad = new THREE.Vector3();
const _randVec = new THREE.Vector3();
const _diff = new THREE.Vector3();

export class ImplicitGeodesicPro {
    /**
     * @param {Object} options - Configuration for the solver
     * @param {number} [options.epsilon=1e-5] - Central difference step for gradients
     * @param {number} [options.newtonIterations=3] - Projection precision
     * @param {string} [options.transportMethod='rodrigues'] - 'rodrigues' | 'projection'
     */
    constructor(options = {}) {
        this.epsilon = options.epsilon || 1e-5;
        this.newtonIterations = options.newtonIterations || 3;
        this.transportMethod = options.transportMethod || 'rodrigues';
    }

    /**
     * Calculates the raw, unnormalized gradient (internal use).
     * Writes directly to the provided target vector.
     */
    _computeRawGradient(f, pos, target) {
        const eps = this.epsilon;
        
        const fx = (f(pos.x + eps, pos.y, pos.z) - f(pos.x - eps, pos.y, pos.z)) / (2 * eps);
        const fy = (f(pos.x, pos.y + eps, pos.z) - f(pos.x, pos.y - eps, pos.z)) / (2 * eps);
        const fz = (f(pos.x, pos.y, pos.z + eps) - f(pos.x, pos.y, pos.z - eps)) / (2 * eps);
        
        return target.set(fx, fy, fz);
    }

    /**
     * Calculates the normalized gradient (Normal vector) of function f.
     * @param {Function} f - Implicit function f(x,y,z)
     * @param {THREE.Vector3} pos - Current position
     * @param {THREE.Vector3} [target=new THREE.Vector3()] - Vector to store the result
     * @returns {THREE.Vector3} Normalized gradient vector
     */
    gradient(f, pos, target = new THREE.Vector3()) {
        this._computeRawGradient(f, pos, target);
        return target.normalize();
    }

    /**
     * Generates a random normalized velocity tangent to the surface.
     * Safe to allocate new memory here as it is usually an initialization step.
     * @param {Function} f - Implicit function f(x,y,z)
     * @param {THREE.Vector3} pos - Position on the surface
     * @returns {THREE.Vector3} New velocity vector
     */
    randomVelocity(f, pos) {
        this.gradient(f, pos, _n0);
        
        _randVec.set(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize();
        
        const dot = _randVec.dot(_n0);
        const velocity = new THREE.Vector3().copy(_randVec).addScaledVector(_n0, -dot);
        
        return velocity.normalize();
    }

    /**
     * Performs one geodesic integration step.
     * Mutates the provided `pos` and `velocity` vectors directly.
     * 
     * @param {Function} f - Implicit function f(x,y,z)
     * @param {THREE.Vector3} pos - Current position (MUTATED)
     * @param {THREE.Vector3} velocity - Current velocity vector (MUTATED)
     * @param {number} stepSize - Integration step size (h)
     */
    step(f, pos, velocity, n, stepSize) {
        const speed = velocity.length();

        if (speed == 0) {
            this.gradient(f, pos, n);
            return;
        }

        // --- 1. Euler Tangent Step ---
        _nextPos.copy(pos).addScaledVector(velocity, stepSize);

        /*// --- 2. Newton-Raphson Projection ---
        let t = 0;
        this.gradient(f, _nextPos, _n1); 
        for (let i = 0; i < this.newtonIterations; i++) {
            const f_val = f(_nextPos.x, _nextPos.y, _nextPos.z);
            this._computeRawGradient(f, _nextPos, _rawGrad);
            
            const denom = _rawGrad.dot(_n1);
            if (Math.abs(denom) > 1e-8) {
                t = -f_val / denom;
            } else {
                break;
            }
            _nextPos.copy(_pos.copy(_nextPos).addScaledVector(_n1, t)); // Accumulate projection
        }*/

        // --- 2. Corrected Newton-Raphson Projection (50% faster) ---
        for (let i = 0; i < this.newtonIterations; i++) {
            const f_val = f(_nextPos.x, _nextPos.y, _nextPos.z);
            this._computeRawGradient(f, _nextPos, _rawGrad);

            const lenSq = _rawGrad.lengthSq();
            if (lenSq > 1e-16) {
                _nextPos.addScaledVector(_rawGrad, -f_val / lenSq);
            }
        }

        // --- 3. Parallel Transport ---
        this.gradient(f, pos, _n0);
        this.gradient(f, _nextPos, _n1);

        if (this.transportMethod === 'rodrigues') {
            _k.crossVectors(_n0, _n1);
            const c = _n0.dot(_n1);
            const s = _k.length();

            if (s > 1e-8) {
                _k.normalize();
                _crossKV.crossVectors(_k, velocity);
                const dotKV = _k.dot(velocity);
                
                velocity.multiplyScalar(c)
                        .addScaledVector(_crossKV, s)
                        .addScaledVector(_k, dotKV * (1 - c));
            }
        } else {
            // Tangent Projection transport
            const dot = velocity.dot(_n1);
            velocity.addScaledVector(_n1, -dot);
        }

        // --- 4. Apply Updates & Enforce Speed ---
        pos.copy(_nextPos);
        n.copy(_n1);
        velocity.normalize().multiplyScalar(speed);
    }


}

/**
 * Calculates the total force vector exerted on particle p0 by an array of particles p.
 * @param {THREE.Vector3} p0 - The position of the target particle.
 * @param {THREE.Vector3[]} p - An array of positions of the other particles.
 * @returns {THREE.Vector3} The accumulated force vector.
 */
export function calculateRepulsiveForce(p0, p, n0, n, shift, selected) {
    const totalForce = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < p.length; i++) {
        const pi = p[i];
        const ni = n[i];

        // 1. Calculate the distance between p0 and p[i]
        //const distance = p0.distanceTo(pi);

        // Set _tempVec to (pi - p0). 
        // .subVectors reads the two inputs but only mutates the calling object (_tempVec)
        _diff.subVectors(pi, p0);

        // Add (shift * ni)
        _diff.addScaledVector(ni, shift);

        // Subtract (shift * n0) by adding it with a negative shift
        _diff.addScaledVector(n0, -shift);

        // The distance is simply the length of this resulting difference vector
        const distance = _diff.length();

        // Guard against division by zero if two particles occupy the exact same space
        //if (distance === 0) continue;

        // 2. Calculate the direction vector: ( p0 - p[i])
        _diff.subVectors(p0, pi).normalize().projectOnPlane(n0);

        // 3. Divide by distance squared: (p[i] - p0) / distance^2
        //_diff.divideScalar(distance * distance);

        _diff.multiplyScalar(bump(distance, 0.25 * (pi == selected ? 1.8 : 1.0))) * (pi == selected ? 2.5 : 1.0);

        // 4. Accumulate into the total force
        totalForce.add(_diff);
    }

    return totalForce;
}

function bump(r, R) {
    const r2 = r * r;
    const R2 = R * R;

    if (r2 >= R2) {
        return 0.0;
    }

    return Math.exp(-r2 / (R2 - r2));
}