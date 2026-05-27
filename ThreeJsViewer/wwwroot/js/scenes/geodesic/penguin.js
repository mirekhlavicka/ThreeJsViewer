import * as THREE from 'three';
import { ImplicitGeodesicPro, calculateRepulsiveForce } from './implicitGeodesic.js';

export function createGeoPenguinScene(name, model, impF, pcount, shadow = false, scale = 1.0 ) {

    let penguins = [];

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

        const penguinPosition = new THREE.Vector3(1000, 1000, 1000);
        const penguinVelocity = new THREE.Vector3();
        const penguinNormal = new THREE.Vector3();

        let stepTime = 0;

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

                while (penguins.some(pp => pp.position.distanceTo(p) < 0.3)) {
                    p = getRandomVertex();
                    console.log("next pos");
                }

                penguinPosition.copy(p);
                penguinVelocity.copy(geodesicSolver.randomVelocity(impFunc, penguinPosition));
                penguinVelocity.multiplyScalar(speed); 
            },
            animate: (m, t, delta, animationSpeed) => {

                geodesicSolver.step(
                    impFunc,
                    penguinPosition,
                    penguinVelocity,
                    penguinNormal,
                    animationSpeed * 0.02,
                );                

                /*if (penguins.some(pp => pp != penguin && pp.position.distanceTo(penguinPosition) < 0.1)) {
                    penguinVelocity.multiplyScalar(-1); 
                }*/

                updateFigureTransform(m, penguinPosition, penguinVelocity, penguinNormal, 0.068);

                let f = calculateRepulsiveForce(penguinPosition, penguins.filter(pp => pp != penguin).map(pp => pp.position), penguinNormal);
                //f.projectOnPlane(penguinNormal);
                penguinVelocity.addScaledVector(f, animationSpeed * 0.003).normalize().multiplyScalar(speed);

                //speed = penguinVelocity.length();

                stepTime += animationSpeed * speed * 0.9;

                m.material.userData.uTwistStrength.value = 8 * Math.sin(stepTime);
                m.material.userData.uTime1.value = 0.2 * stepTime;
                m.material.userData.uTwistStrength2.value = 0.5 *(1 + Math.sin(0.1 * stepTime)) + 0.4 * Math.sin(0.1 * 2.0 * stepTime);

                m.material.userData.uSelectedId1.value = (Math.abs(Math.sin(0.3 * stepTime)) < 0.8 ? -1.0 : 2.0);
            },

            position: penguinPosition
        }

        return penguin;
    }
    
    let scene = {
        reset: () => {
            if (scene.used) {
                return createGeoPenguinScene(name, model, impF, pcount, shadow, scale);
            } else {
                return scene;
            }
        },
        setup: (camera, dirLight) => {
            camera.position.set(-2.5, 0.0, 1.0);
            dirLight.position.set(1, 1, 1);
        },
        hideGrid: true,
        sceneBackgroundTexture: "assets/OnSphere/milky_way_penguin.png",
        shadowMapType: shadow ? THREE.VSMShadowMap : null, 
        name: "Geodesic/" + name,
        models: [
            {
                path: `assets/Geodesic/${model}.ply`,
                setupMaterial: m => {
                    m.color = 0xffffff;
                    m.vertexColors = false;
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

        const value = 48 + Math.floor(clrspeed * (150 - 48));
        const grayColor = (value << 16) | (value << 8) | value;

        let penguin = createPenguin({
            color: grayColor,
            speed: 0.1 + 0.5 * clrspeed
        });

        scene.models.push(penguin);
        penguins.push(penguin);
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