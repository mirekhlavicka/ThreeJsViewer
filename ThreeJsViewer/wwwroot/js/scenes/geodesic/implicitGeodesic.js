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

        // --- 1. Euler Tangent Step ---
        _nextPos.copy(pos).addScaledVector(velocity, stepSize);

        // --- 2. Newton-Raphson Projection ---
        let t = 0;
        for (let i = 0; i < this.newtonIterations; i++) {
            this.gradient(f, _nextPos, _n1); 
            const f_val = f(_nextPos.x, _nextPos.y, _nextPos.z);
            this._computeRawGradient(f, _nextPos, _rawGrad);
            
            const denom = _rawGrad.dot(_n1);
            if (Math.abs(denom) > 1e-8) {
                t -= f_val / denom;
            }
            _nextPos.copy(_pos.copy(_nextPos).addScaledVector(_n1, t)); // Accumulate projection
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