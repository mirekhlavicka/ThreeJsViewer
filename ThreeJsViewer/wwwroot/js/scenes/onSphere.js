import { smoothAnim } from '../utils.js';
import * as THREE from 'three';

export const onSphereScene = {
    name: "Games/On sphere",
    models: [
        {
            path: 'assets/OnSphere/ball.ply',
            color: 0xffd700,
            setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = true;
            }/*,
            prepareGeometry: prepareGeometry,
            animate: (m, t) => {
                earthquake(m, t);

                if (t > 11 && t < 22) {
                    m.rotation.z = -4 * Math.PI * THREE.MathUtils.smoothstep(t, 11, 22);
                }
            }*/
        },
        {
            path: 'assets/OnSphere/penguin.ply',
            color: 0xffd700,
            createMaterial: () => createTwistMaterial(0xF8E47E),
            /*setupMaterial: m => {
                m.color = 0xffffff;
                m.vertexColors = false;
            },*/
            prepareGeometry: g => {
                /*m.rotation.x = Math.PI / 2;
                m.scale.set(0.19, 0.19, 0.19);*/
                // 1. Bake rotation into the vertices
                g.rotateZ(-Math.PI / 2);

                // 2. Bake scale into the vertices
                g.scale(0.06, 0.06, 0.06);
                g.translate(0, 0, 1.005);
            },
            animate: (m, t) => {
                m.material.userData.uTime.value = t;
                //updateDragonAnimation(m, t);
            }
        }
    ]
}

function createTwistMaterial(baseColorHex) {
    // 1. Create standard material (keeps your lighting/colors)
    const material = new THREE.MeshStandardMaterial({
        color: baseColorHex,
        flatShading: false,
        vertexColors: false,
        metalness: 0.7,
        roughness: 0.3
    });

    // 2. Define uniforms to pass data from JS to the Shader
    material.userData.uTime = { value: 0 };
    material.userData.uTwistStrength = { value: 1.5 };

    material.onBeforeCompile = (shader) => {
        // Pass our JS uniforms into the shader
        shader.uniforms.uTime = material.userData.uTime;
        shader.uniforms.uTwistStrength = material.userData.uTwistStrength;

        // 3. Inject uniform declarations into Vertex Shader
        shader.vertexShader = `
            uniform float uTime;
            uniform float uTwistStrength;
        ` + shader.vertexShader;

        // 4. Inject the deformation math
        // 'transformed' is the standard Three.js variable for vertex position
        shader.vertexShader = shader.vertexShader.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            
            // Calculate angle based on height (y) and time
            // sin(uTime) makes it breathe back and forth
            float angle =
                //smoothstep(-0.5, 0.2, transformed.z) *
                (1.0 - smoothstep(1.0, 1.05, transformed.z)) *
                0.1 * transformed.y * uTwistStrength * sin(uTime * 4.0 - (transformed.x * 0.5));
            
            float s = sin(angle);
            float c = cos(angle);
            
            // Apply 2D rotation matrix to X and Z coordinates
            mat2 rotationMatrix = mat2(c, -s, s, c);
            transformed.xz = rotationMatrix * transformed.xz;


            angle = 0.4 *
                smoothstep(1.0, 1.05, transformed.z) *
                //(1.0 - smoothstep(0.2, 0.5, transformed.x)) *
                sin(uTime * 2.0);
            s = sin(angle);
            c = cos(angle);

            // Apply 2D rotation matrix to X and Z coordinates
            rotationMatrix = mat2(c, -s, s, c);

            transformed.xy = rotationMatrix * transformed.xy;

            `
        );
    };

    return material;
}
