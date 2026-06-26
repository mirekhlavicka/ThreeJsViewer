import * as THREE from 'three';
import { ImplicitGeodesicPro, calculateRepulsiveForce } from './implicitGeodesic.js?v=1.02';

export function createGeoPenguinScene(name, model, impF, pcount, shadow = false, scale = 1.0, speedFactor = 1.0, vertexColors = false, bcount = 0 ) {

    let penguins = [];
    let balls = [];

    let selectedPenguin = null;

    let surfaceMesh = null;

    let impFunc = impF;

    if (scale != 1.0) {
        impFunc = (x, y, z) => impF(x / scale, y / scale, z / scale);
    }

    const geodesicSolver = new ImplicitGeodesicPro({
        newtonIterations: 5,
        transportMethod: 'rodrigues'
    });

    function getRandomVertex() {
        const geometry = surfaceMesh.geometry;
        const positionAttribute = geometry.attributes.position;

        if (positionAttribute) {
            // 1. Pick a random vertex index
            const randomIndex = Math.floor(Math.random() * positionAttribute.count);

            // 2. Extract the raw, original coordinates directly into a Vector3
            const originalCoordinates = new THREE.Vector3();
            originalCoordinates.fromBufferAttribute(positionAttribute, randomIndex);

            return originalCoordinates;
        }
    }

    function createPenguin(params = {}) {
        let color = params.color;
        let speed = params.speed;
        let initspeed = params.speed;

        const penguinPosition = new THREE.Vector3(1000, 1000, 1000);
        const penguinVelocity = new THREE.Vector3();
        const penguinNormal = new THREE.Vector3();
        //const penguinNormalPrev = new THREE.Vector3();
        const penguinForce = new THREE.Vector3(0, 0, 0);

        const penguinPositionGeo = new THREE.Vector3(1000, 1000, 1000);
        const penguinVelocityGeo = new THREE.Vector3();
        const penguinNormalGeo = new THREE.Vector3();

        //const deltaRotation = new THREE.Quaternion();

        const tempForward = new THREE.Vector3(0, 0, -1); // Tracks last known forward direction
        const cameraTarget = new THREE.Vector3();
        const targetPosition = new THREE.Vector3();
        const currentLookTarget = new THREE.Vector3();

        let otherPos = [];
        let otherNormals = [];

        let stepTime = 0;

        // 4. Camera spacing variables (Adjust these to fit your game's scale)
        let followDistance = 0.8; // How far behind the penguin
        let followHeight = 0.8;   // How high above the penguin's feet
        let eyeHeight = -0.65;      // Target height for the camera to look at


        function setSelected(selected) {
            if (selected) {
                penguin.mesh.material.userData.uSelectedId.value = 1.0;

                penguin.mesh.material.metalness = 0.7;
                penguin.mesh.material.roughness = 0.3;

                speed = 0.3;
            } else {
                penguin.mesh.material.userData.uSelectedId.value = -1.0;
                penguin.mesh.material.roughness = 0.5;
                penguin.mesh.material.metalness = 0.4;

                speed = initspeed;
                scene.resetCamera();
            }

            penguinVelocity.setLength(speed);
            penguinPositionGeo.copy(penguinPosition);
            penguinVelocityGeo.copy(penguinVelocity);

            penguin.mesh.material.needsUpdate = true;
        }


        let penguin = {
            path: 'assets/OnSphere/penguinEgg.ply',
            createMaterial: () => createTwistMaterial(color),
            prepareGeometry: g => {
                penguinColors(g, color)
                g.rotateZ(Math.PI);
                g.scale(0.07, 0.07, 0.07);
            },
            prepareMesh: m => {
                m.castShadow = true;
                m.material.userData.uHighlightColor1.value = new THREE.Color(color);
            },
            meshesLoaded: () => {

                let p = getRandomVertex();

                while (penguins.some(pp => pp.position.distanceTo(p) < 0.3) || balls.some(pp => pp.position.distanceTo(p) < 0.3)) {
                    p = getRandomVertex();
                }

                penguinPosition.copy(p);
                penguinVelocity.copy(geodesicSolver.randomVelocity(impFunc, penguinPosition));
                penguinVelocity.multiplyScalar(speed);

                penguinPositionGeo.copy(penguinPosition);
                penguinVelocityGeo.copy(penguinVelocity);


                otherPos = penguins.filter(pp => pp != penguin).map(pp => pp.position);
                otherNormals = penguins.filter(pp => pp != penguin).map(pp => pp.normal);
            },
            animate: (m, t, delta, animationSpeed, pivot, camera, controls, isUserOrbiting) => {

                //penguinNormalPrev.copy(penguinNormal);

                geodesicSolver.step(
                    impFunc,
                    penguinPosition,
                    penguinVelocity,
                    penguinNormal,
                    animationSpeed * 0.02,
                );                

                geodesicSolver.step(
                    impFunc,
                    penguinPositionGeo,
                    penguinVelocityGeo,
                    penguinNormalGeo,
                    animationSpeed * 0.02,
                );                

                updateFigureTransform(m, penguinPosition, penguinVelocity, penguinNormal, 0.068);

                if (penguin != selectedPenguin) {
                    let f = calculateRepulsiveForce(penguinPosition, otherPos, penguinNormal, otherNormals, 0.068, selectedPenguin?.position);
                    let pf = f.clone().projectOnVector(penguinVelocity);
                    let nf = f.length();
                    f.sub(pf).setLength(nf);

                    penguinForce.projectOnPlane(penguinNormal);
                    penguinForce.lerp(f, 0.2); //multiplyScalar(0.6).addScaledVector(f, 0.4);
                    penguinVelocity.normalize().addScaledVector(penguinForce, 1.5 * speed *  animationSpeed).setLength(speed);


                    if (nf < 0.3) {
                        let d = penguinPosition.distanceTo(penguinPositionGeo);

                        if (d > 0.5) {
                            penguinPositionGeo.copy(penguinPosition);
                            penguinVelocityGeo.copy(penguinVelocity);
                        } else {
                            f.subVectors(penguinPositionGeo, penguinPosition).normalize().projectOnPlane(penguinNormal).multiplyScalar(d * d);
                            pf = f.clone().projectOnVector(penguinVelocity);
                            f.sub(pf);
                            penguinVelocity.normalize().addScaledVector(f, 4 * speed * animationSpeed).setLength(speed);
                        }
                    }
                } else {
                    if ((scene.keyboardState['w'] || scene.keyboardState['W'] || scene.keyboardState['ArrowUp']) && speed < 0.8) {
                        speed += 0.005;
                        penguinVelocity.setLength(speed);
                    }
                    if ((scene.keyboardState['s'] || scene.keyboardState['S'] || scene.keyboardState['ArrowDown']) && speed > 0.001) {
                        speed -= 0.005;
                        if (speed < 0.001) {
                            speed = 0.001;
                        }
                        penguinVelocity.setLength(speed);
                    }

                    if (scene.keyboardState['a'] || scene.keyboardState['A'] || scene.keyboardState['ArrowLeft']) {
                        const f = new THREE.Vector3().crossVectors(penguinVelocity, penguinNormal).normalize();
                        penguinVelocity.normalize().addScaledVector(f, -speed * animationSpeed * 0.15).setLength(speed);
                    }

                    if (scene.keyboardState['d'] || scene.keyboardState['D'] || scene.keyboardState['ArrowRight']) {
                        const f = new THREE.Vector3().crossVectors(penguinVelocity, penguinNormal).normalize();
                        penguinVelocity.normalize().addScaledVector(f, speed * animationSpeed * 0.15).setLength(speed);
                    }

                    if (scene.keyboardState['+']) {
                        followDistance -= 0.01;
                    }

                    if (scene.keyboardState['-']) {
                        followDistance += 0.01;
                    }

                    if (!scene.keyboardState['Shift'] && scene.keyboardState['*']) {
                        followHeight -= 0.01;
                    }

                    if (!scene.keyboardState['Shift'] && scene.keyboardState['/']) {
                        followHeight += 0.01;
                    }

                    if (scene.keyboardState['Shift'] && scene.keyboardState['*']) {
                        eyeHeight -= 0.01;
                    }

                    if (scene.keyboardState['Shift'] && scene.keyboardState['/']) {
                        eyeHeight += 0.01;
                    }


                    if (isUserOrbiting) {
                        // A. If the user is actively dragging the mouse, let OrbitControls rule.
                        // Make sure the orbit center stays locked to the moving penguin.
                        controls.target.copy(penguinPosition).addScaledVector(penguinNormal, eyeHeight);
                        controls.update();
                    } else {

                        // 2. Calculate Forward Direction
                        if (penguinVelocity.lengthSq() > 0.001) {
                            tempForward.copy(penguinVelocity).normalize();
                        }

                        // 3. Orient Camera Up
                        //camera.up.copy(penguinNormal);
                        camera.up.lerp(penguinNormal, 0.05);

                        // Calculate Camera position behind and above the penguin
                        targetPosition.copy(penguinPosition)
                            .addScaledVector(tempForward, -followDistance) // Move backward
                            .addScaledVector(penguinNormal, followHeight);  // Move up

                        // Smoothly interpolate (lerp) camera position
                        camera.position.lerp(targetPosition, 0.05);

                        // 5. Look at the penguin's upper body/head instead of its feet
                        cameraTarget.copy(penguinPosition).addScaledVector(penguinNormal, eyeHeight);
                        //camera.lookAt(cameraTarget);
                        currentLookTarget.lerp(cameraTarget, 0.05); 
                        camera.lookAt(currentLookTarget);

                    }

                    /*deltaRotation.setFromUnitVectors(penguinNormal, penguinNormalPrev);
                    pivot.quaternion.multiply(deltaRotation);*/
                }

                //speed = penguinVelocity.length();

                stepTime += animationSpeed * speed * 0.9;

                m.material.userData.uTwistStrength.value = 8 * Math.sin(stepTime);
                m.material.userData.uTime1.value = 0.2 * stepTime;
                m.material.userData.uTwistStrength2.value = 0.5 *(1 + Math.sin(0.1 * stepTime)) + 0.4 * Math.sin(0.1 * 2.0 * stepTime);

                m.material.userData.uSelectedId1.value = (Math.abs(Math.sin(0.3 * stepTime)) < 0.8 ? -1.0 : 2.0);


            },

            position: penguinPosition,
            normal: penguinNormal,

            setSelected
        }

        return penguin;
    }

    function createBall(params = {}) {
        let speed = params.speed;

        const ballPosition = new THREE.Vector3(1000, 1000, 1000);
        const ballCenterPosition = new THREE.Vector3(1000, 1000, 1000);
        const ballCenterPositionPrev = new THREE.Vector3(1000, 1000, 1000);
        const ballVelocity = new THREE.Vector3();
        const ballNormal = new THREE.Vector3();

        let ball = {
            path: Math.random() < 0.33 ? 'assets/Geodesic/icosahedron.ply' : (Math.random() < 0.66 ? 'assets/Geodesic/geoball.ply' : 'assets/Geodesic/dodecahedron.ply'),
            prepareGeometry: g => {               

                const positionAttribute = g.attributes.position;
                const vertex = new THREE.Vector3();

                for (let i = 0; i < positionAttribute.count; i++) {
                    // Read x, y, z into the vector
                    vertex.fromBufferAttribute(positionAttribute, i);

                    // Normalizes the vector (sets length/norm to 1)
                    vertex.normalize();

                    // Write the normalized values back
                    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
                }

                // Tell Three.js to send the updated data to the GPU
                positionAttribute.needsUpdate = true;

                g.scale(0.05, 0.05, 0.05);
            },
            prepareMesh: m => {
                m.castShadow = true;
            },
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
                //m.roughness = 0.05;
                //m.metalness = 0.5;

            },
            meshesLoaded: () => {

                let p = getRandomVertex();

                while (penguins.some(pp => pp.position.distanceTo(p) < 0.3 || balls.some(pp => pp.position.distanceTo(p) < 0.3))) {
                    p = getRandomVertex();
                }

                ballPosition.copy(p);
                ballVelocity.copy(geodesicSolver.randomVelocity(impFunc, ballPosition));
                ballVelocity.multiplyScalar(speed);

            },
            animate: (m, t, delta, animationSpeed, pivot, camera, controls, isUserOrbiting) => {

                while (ballCenterPositionPrev.distanceTo(ballCenterPosition) < ballVelocity.length() * animationSpeed * 0.019)
                {
                    geodesicSolver.step(
                        impFunc,
                        ballPosition,
                        ballVelocity,
                        ballNormal,
                        animationSpeed * 0.02,
                    );
                    ballCenterPosition.copy(ballPosition).addScaledVector(ballNormal, 0.05);
                }

                ballCenterPositionPrev.copy(ballCenterPosition);

                updateBallTransform(m, ballPosition, ballVelocity, animationSpeed * 0.02, ballNormal, 0.05);

                
            },

            position: ballPosition,
            centerPosition: ballCenterPosition,
            velocity: ballVelocity,
            normal: ballNormal

        }

        return ball;
    }
    
    let scene = {
        reset: () => {
            if (scene.used) {
                return createGeoPenguinScene(name, model, impF, pcount, shadow, scale, speedFactor, vertexColors, bcount);
            } else {
                return scene;
            }
        },
        onPointerDown: (m, p) => {
            let i = penguins.indexOf(m.userData);
            if (i >= 0) {
                if (selectedPenguin == m.userData) {
                    selectedPenguin.setSelected(false);
                    selectedPenguin = null;
                } else {
                    if (selectedPenguin != null) {
                        selectedPenguin.setSelected(false);
                    }
                    selectedPenguin = m.userData;
                    selectedPenguin.setSelected(true);
                }
                return true;
            }
        },
        setup: (camera, dirLight) => {
            camera.position.set(-1.5, -1.5, -1.0);
            dirLight.position.set(1, 1, 1);
        },
        animate: (t) => {
            //balls.forEach(b => b.velocity.normalize().multiplyScalar(0.2 + 0.15*Math.sin(t)));

            for (let i = 0; i < bcount - 1; i++) {
                for (let j = i + 1; j < bcount; j++) {


                    const b1 = balls[i];
                    const b2 = balls[j];

                    const pos1 = b1.centerPosition;
                    const pos2 = b2.centerPosition;

                    // Spočítáme vzdálenost středů
                    const distance = pos1.distanceTo(pos2);
                    const minDistance = 0.1; // Součet poloměrů 

                    if (distance <= minDistance) {
                        // Vytvoříme směrový vektor z pos2 do pos1
                        const normal = new THREE.Vector3().subVectors(pos1, pos2);
                        normal.normalize(); // Převod na jednotkový vektor

                        // Spuštění fyzikálního výpočtu, který přímo upraví .velocity objekty
                        resolveElasticCollision3D(
                            b1.velocity,
                            b2.velocity,
                            100,
                            100,
                            normal
                        );

                        const v1 = b1.velocity.length();
                        const v2 = b2.velocity.length();

                        b1.velocity.projectOnPlane(b1.normal).setLength(v1);
                        b2.velocity.projectOnPlane(b2.normal).setLength(v2);
                    }
                }
            }
        },
        hideGrid: true,
        autoRotate: false,
        sceneBackgroundTexture: "assets/OnSphere/milky_way_penguin.png",
        shadowMapType: shadow ? THREE.VSMShadowMap : null, 
        name: "Geodesic/" + name,
        models: [
            {
                path: `assets/Geodesic/${model}.ply`,
                setupMaterial: m => {
                    m.color = 0xffffff;
                    m.vertexColors = vertexColors;
                    m.roughness = 0.05;
                    m.metalness = 0.5;

                },
                prepareGeometry: g => {
                    if (scale != 1.0) {
                        g.scale(scale, scale, scale);
                    }
                },
                prepareMesh: m => {
                    m.receiveShadow = true;
                    m.castShadow = false;
                    surfaceMesh = m;
                }
            }
        ]
    };

    for (let i = 0; i < pcount; i++) {

        let clrspeed = (pcount == 1 ? 1 : i / (pcount - 1));

        const value = 30 + Math.floor(clrspeed * (200 - 30));
        const grayColor = (value << 16) | (value << 8) | value;

        let penguin = createPenguin({
            color: grayColor,
            speed: speedFactor * (0.2 + 0.2 * clrspeed)
        });

        scene.models.push(penguin);
        penguins.push(penguin);
    }

    for (let i = 0; i < bcount; i++) {

        let speed = (bcount == 1 ? 1 : i / (bcount - 1));


        let ball = createBall({
            speed: speedFactor * (0.2 + 0.2 * speed)
        });

        scene.models.push(ball);
        balls.push(ball);
    }

    return scene;
}

function getOrthogonalVector(v) {
    // 1. Ensure the input is normalized
    const vec = v.clone().normalize();

    // 2. Use a stable helper constant
    // This creates a singularity only at v = (0, 0, -1)
    const k = Math.abs(vec.z) < 0.999 ? 0 : 1;
    const sign = vec.z >= 0 ? 1 : -1;
    const a = -1 / (sign + vec.z);
    const b = vec.x * vec.y * a;

    // 3. Construct the orthogonal vector
    return new THREE.Vector3(
        1 + sign * vec.x * vec.x * a,
        sign * b,
        -sign * vec.x
    ).normalize();
}

function updateFigureTransform(figure, pos, vel, newZ, shift) {

    if (vel.x == 0 && vel.y == 0 & vel.z == 0) {
        vel = getOrthogonalVector(newZ)
    }

    // X-axis (Side): Perpendicular to both Velocity and the Normal
    // We calculate this first to ensure a perfect 90-degree system
    const newX = new THREE.Vector3().crossVectors(vel, newZ).normalize();

    // Y-axis (Forward): Perpendicular to Up and Side
    // This ensures Y aligns with velocity even if v1,v2,v3 isn't perfectly tangent
    const newY = new THREE.Vector3().crossVectors(newZ, newX).normalize();

    // 3. Create and apply the Rotation Matrix
    const matrix = new THREE.Matrix4();
    matrix.makeBasis(newX, newY, newZ);
    figure.quaternion.setFromRotationMatrix(matrix);

    // 4. Set Position with the radial shift
    // We add the normalized 'up' vector multiplied by your shift value
    figure.position.set(
        pos.x + (newZ.x * shift),
        pos.y + (newZ.y * shift),
        pos.z + (newZ.z * shift)
    );
}


/**
 * @param {THREE.Mesh} figure - Your single ball mesh
 * @param {THREE.Vector3} pos - Current position vector
 * @param {THREE.Vector3} vel - Current velocity vector
 * @param {number} stepSize - euler method step 
 * @param {THREE.Vector3} newZ - Surface normal (Up)
 * @param {number} r - Radius of the ball
 */
function updateBallTransform1(figure, pos, vel, stepSize, newZ, r) {

    // 1. Calculate speed
    const speed = vel.length();

    // 2. Handle zero velocity case
    let targetVel = vel.clone();
    if (speed < 0.0001) {
        targetVel = getOrthogonalVector(newZ); // Using your existing fallback
    }

    // 3. Create the Basis vectors for Alignment
    const newX = new THREE.Vector3().crossVectors(targetVel, newZ).normalize();
    const newY = new THREE.Vector3().crossVectors(newZ, newX).normalize();

    // 4. Calculate the "Alignment Quaternion" (Orientation on the sphere)
    const alignMatrix = new THREE.Matrix4();
    alignMatrix.makeBasis(newX, newY, newZ);

    const alignQuat = new THREE.Quaternion();
    alignQuat.setFromRotationMatrix(alignMatrix);

    // 5. Track and accumulate the rolling angle inside 'userData'
    if (figure.userData.cumulativeRoll === undefined) {
        figure.userData.cumulativeRoll = 0;
    }

    if (speed > 0.0001) {
        const distanceCovered = speed * stepSize;
        const rollAngle = distanceCovered / r;

        // Note: Depending on your geometry's default orientation, 
        // you might need to change this to `-= rollAngle` to roll forward instead of backward.
        figure.userData.cumulativeRoll -= rollAngle;
    }

    // 6. Calculate the "Roll Quaternion" (Local rotation around X-axis)
    const rollQuat = new THREE.Quaternion();
    rollQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), figure.userData.cumulativeRoll);

    // 7. Combine the Quaternions!
    // The order is crucial: multiplyQuaternions(A, B) applies B first, then A.
    // We want to roll the ball in its local space (rollQuat) THEN align it to the world (alignQuat).
    figure.quaternion.multiplyQuaternions(alignQuat, rollQuat);

    // 8. Set Position
    figure.position.set(
        pos.x + (newZ.x * r),
        pos.y + (newZ.y * r),
        pos.z + (newZ.z * r)
    );
}

/**
 * @param {THREE.Mesh} figure - Your single ball mesh
 * @param {THREE.Vector3} pos - Current position vector
 * @param {THREE.Vector3} vel - Current velocity vector (can change instantly!)
 * @param {THREE.Vector3} newZ - Surface normal (Up)
 * @param {number} r - Radius of the ball
 * @param {number} deltaTime - Time passed since last frame (seconds)
 */
function updateBallTransform(figure, pos, vel, stepSize, newZ, r) {

    // 1. Always set the correct position on the sphere surface first
    figure.position.set(
        pos.x + (newZ.x * r),
        pos.y + (newZ.y * r),
        pos.z + (newZ.z * r)
    );

    // 2. Calculate current speed
    const speed = vel.length();
    if (speed < 0.0001) return; // If standing still, do nothing

    // 3. Calculate the physical rolling axis in WORLD space
    // A ball rolls around an axis perpendicular to its velocity and the surface normal
    const rollAxis = new THREE.Vector3().crossVectors(vel, newZ).normalize();

    // 4. Calculate how much it rolled during this specific frame
    // Angular distance (radians) = linear distance / radius
    const deltaAngle = (speed * stepSize) / r;


    // 5. Create a small delta quaternion for just this frame's rotation
    const deltaQuat = new THREE.Quaternion().setFromAxisAngle(rollAxis, -deltaAngle);

    // 6. Combine this delta with the ball's EXISTING rotation
    // CRITICAL: We use 'premultiply' because our rollAxis is in WORLD coordinates.
    figure.quaternion.premultiply(deltaQuat);

    // 7. Prevent floating-point drift
    // Successive quaternion multiplications introduce tiny mathematical errors over time.
    // Normalizing it every frame keeps the rotation matrix perfect.
    figure.quaternion.normalize();
}

/**
 * Vypočítá 3D pružnou srážku dvou koulí a modifikuje jejich vektory rychlostí.
 * 
 * @param {THREE.Vector3} v1 - Vektor rychlosti první koule (bude modifikován)
 * @param {THREE.Vector3} v2 - Vektor rychlosti druhé koule (bude modifikován)
 * @param {number} m1 - Hmotnost první koule
 * @param {number} m2 - Hmotnost druhé koule
 * @param {THREE.Vector3} normal - Jednotkový vektor směřující ze středu koule 2 do středu koule 1
 */
function resolveElasticCollision3D(v1, v2, m1, m2, normal) {
    // 1. Výpočet celkové hmotnosti systému
    const totalMass = m1 + m2;

    // 2. Výpočet relativní rychlosti (v1 - v2)
    const relVelocity = new THREE.Vector3().subVectors(v1, v2);

    // 3. Skalární součin relativní rychlosti a normály: (v1 - v2) . n
    const speedAlongNormal = relVelocity.dot(normal);

    // Pokud se koule pohybují od sebe, srážku netřeba řešit (zamezí zásekům)
    if (speedAlongNormal > 0) return;

    // 4. Výpočet skalárního impulsu podle odvozeného vzorce
    // Pro v1: - (2 * m2 / totalMass) * speedAlongNormal
    // Pro v2: - (2 * m1 / totalMass) * (-speedAlongNormal) -> znaménko se otočí
    const impulseScalar1 = - (2 * m2 / totalMass) * speedAlongNormal;
    const impulseScalar2 = - (2 * m1 / totalMass) * (-speedAlongNormal);

    // 5. Vytvoření vektorů impulsů ve směru normály
    const impulseVector1 = normal.clone().multiplyScalar(impulseScalar1);
    const impulseVector2 = normal.clone().multiplyScalar(impulseScalar2);

    // 6. Přímá modifikace původních vektorů rychlostí (přičtení impulsu)
    v1.add(impulseVector1);
    v2.add(impulseVector2);
}


function createTwistMaterial(baseColorHex) {
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: true,
        metalness: 0.4,
        roughness: 0.5
    });

    material.userData.uTime1 = { value: 0 };
    material.userData.uTwistStrength2 = { value: 0 };
    material.userData.uTwistStrength = { value: 0.0 };
    material.userData.uSelectedId = { value: -1.0 }; // Start with -1 so nothing is selected
    material.userData.uSelectedId1 = { value: -1.0 }; // Start with -1 so nothing is selected
    material.userData.uHighlightColor = { value: new THREE.Color(0xffd700) }; // Use Color Object!
    material.userData.uHighlightColor1 = { value: new THREE.Color(0xffffff) }; // Use Color Object!

    material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime1 = material.userData.uTime1;
        shader.uniforms.uTwistStrength2 = material.userData.uTwistStrength2;
        shader.uniforms.uTwistStrength = material.userData.uTwistStrength;
        shader.uniforms.uSelectedId = material.userData.uSelectedId;
        shader.uniforms.uHighlightColor = material.userData.uHighlightColor;
        shader.uniforms.uSelectedId1 = material.userData.uSelectedId1;
        shader.uniforms.uHighlightColor1 = material.userData.uHighlightColor1;

        // 1. Inject Declarations
        shader.vertexShader = `
            uniform float uTime1;
            uniform float uTwistStrength2;
            uniform float uTwistStrength;
            uniform float uSelectedId;
            uniform vec3 uHighlightColor;
            uniform float uSelectedId1;
            uniform vec3 uHighlightColor1;
            attribute float aPartId;
        ` + shader.vertexShader;

        // 2. Handle Color Selection (Replace color_vertex instead of begin_vertex)
        shader.vertexShader = shader.vertexShader.replace(
            `#include <color_vertex>`,
            `
            #include <color_vertex> 
            // This chunk sets vColor = color; 
            // Now we override it if the ID matches:
            if (abs(aPartId - uSelectedId) < 0.1) {
                vColor.rgb = uHighlightColor;
            }
            if (abs(aPartId - uSelectedId1) < 0.1) {
                vColor.rgb = uHighlightColor1;
            }
            `
        );

        // 3. Handle Twist (In begin_vertex)
        shader.vertexShader = shader.vertexShader.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            
            float angle = (1.0 - smoothstep(-0.005, 0.025, transformed.z)) * transformed.x * uTwistStrength; 
            float s = sin(angle);
            float c = cos(angle);
            mat2 rotationMatrix = mat2(c, -s, s, c);
            transformed.yz = rotationMatrix * transformed.yz;

            angle = 1.1 * smoothstep(0.0, 0.03, transformed.z) * sin(uTime1);
            s = sin(angle); c = cos(angle);
            rotationMatrix = mat2(c, -s, s, c);
            transformed.xy = rotationMatrix * transformed.xy;

            angle = 0.58 * smoothstep(0.0, 0.03, transformed.z)  * uTwistStrength2;// (0.7 + sin(uTwistStrength2) +0.4*sin(2.0 * uTwistStrength2));
            s = sin(angle); c = cos(angle);
            rotationMatrix = mat2(c, -s, s, c);
            transformed.yz = rotationMatrix * transformed.yz;
            `
        );
    };

    return material;
}

function penguinColors(geometry, color) {
    const pos = geometry.attributes.position;
    const originalColors = geometry.attributes.color;
    const count = pos.count;
    const newColors = new Float32Array(count * 3);
    const partIds = new Float32Array(count);


    const tcolor = new THREE.Color(color);
    const tempColor = new THREE.Color();

    const colorYellow = new THREE.Color(0xffff00);
    const colorSnow = new THREE.Color(0xffffff);
    const colorBlack = new THREE.Color(0x000000);

    const leg1 = new THREE.Vector3(-0.38, -0.5, -1.06);
    const leg2 = new THREE.Vector3(0.38, -0.5, -1.06);
    const beak = new THREE.Vector3(0.0, -0.72, 0.4);
    const navel = new THREE.Vector3(0.0, -0.8, -0.3); 
    const eye1 = new THREE.Vector3(-0.3, -0.35, 0.565);
    const eye2 = new THREE.Vector3(0.3, -0.35, 0.565);


    for (let i = 0; i < count; i++) {

        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        const rVal = originalColors.getX(i);
        const gVal = originalColors.getY(i);
        const bVal = originalColors.getZ(i);

        // Test for pure white with a safe floating-point threshold
        const isWhite = (rVal > 0.999 && gVal > 0.999 && bVal > 0.999);

        partIds[i] = isWhite ? 1.0 : 0.0;

        if (isWhite) {
            tempColor.set(colorSnow);
        } else {

            let de = Math.min(
                Math.sqrt((x - eye1.x) ** 2 + (y - eye1.y) ** 2 + (z - eye1.z) ** 2),
                Math.sqrt((x - eye2.x) ** 2 + (y - eye2.y) ** 2 + (z - eye2.z) ** 2)
            );

            if (de < 0.08) {
                partIds[i] = 2.0;
            }

            if (de < 0.03) {
                tempColor.set(0x000000);
            } else if (de < 0.05) {
                const t = (de - 0.03) / 0.02;
                tempColor.lerpColors(colorBlack, colorSnow, t);
            } else if (de < 0.07) {
                tempColor.set(colorSnow);
            } else if (de < 0.08) {
                const t = (de - 0.07) / 0.01;
                tempColor.lerpColors(colorSnow, tcolor, t);
            } else {

                let dn = Math.sqrt((x - navel.x) ** 2 + (y - navel.y) ** 2 + (z - navel.z) ** 2);

                if (dn < 0.35) {
                    tempColor.set(colorSnow);
                } if (dn < 0.60) {
                    const t = (dn - 0.35) / 0.25;
                    tempColor.lerpColors(colorSnow, tcolor, t);
                } else {

                    let d = Math.min(
                        Math.sqrt((x - leg1.x) ** 2 + (y - leg1.y) ** 2 + (z - leg1.z) ** 2),
                        Math.sqrt((x - leg2.x) ** 2 + (y - leg2.y) ** 2 + (z - leg2.z) ** 2),
                        Math.sqrt((x - beak.x) ** 2 + (y - beak.y) ** 2 + (z - beak.z) ** 2)
                    );

                    if (d < 0.22) {
                        tempColor.set(colorYellow);
                    } else if (d > 0.30) {
                        tempColor.set(tcolor);
                    } else {
                        const t = (d - 0.22) / 0.08;
                        tempColor.lerpColors(colorYellow, tcolor, t);
                    }
                }
            }
        }

        newColors[i * 3] = tempColor.r;
        newColors[i * 3 + 1] = tempColor.g;
        newColors[i * 3 + 2] = tempColor.b;

    }

    geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));
    geometry.setAttribute('aPartId', new THREE.BufferAttribute(partIds, 1));
    geometry.attributes.color.needsUpdate = true;
}