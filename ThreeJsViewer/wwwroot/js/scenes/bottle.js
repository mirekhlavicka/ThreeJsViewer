import { smoothAnim } from '../utils.js';
import * as THREE from 'three';

export function createBottleLidScene(name, f1, f2, maxShift = 0.25) {
    return {
        name: "Bottle/" + name,
        sceneBackgroundColor: 0x000000,
        //color: 0xFFEFC1,
        setup: (camera) => {
            camera.position.set(3.5, 1.0, 2.5);
        },
        models: [
            {
                path: `assets/Bottle/${f1}.ply`,
                animate: (m, t) => {
                    let v = smoothAnim(t, 6, 1.8, 2.4);
                    m.rotation.z = 0.09 * v;
                },
                color: 0xaaffaa,
                createMaterial: () => new THREE.MeshPhysicalMaterial({
                    thickness: 0.8,        // Depth of the glass
                    roughness: 0.25,        
                    metalness: 0.2,
                    transmission: 1.0,     // 100% of light passes through
                    ior: 1.5,             // Index of Refraction (1.5 is standard for glass)
                    opacity: 1,           // Keep this at 1; transmission handles transparency
                    transparent: true,    // Must be true for transmission to work
                    envMapIntensity: 1.5,
                    color: 0xaaffaa,
                    side: THREE.DoubleSide
                })
            },
            {
                path: `assets/Bottle/${f2}.ply`,
                animate: (m, t) => {
                    let v = smoothAnim(t, 6, 0.25, 2.0);
                    m.position.z = -maxShift * v;

                    v = smoothAnim(t, 6, 0.25, 2.5);
                    m.rotation.z = -0.3 + v;

                    v = smoothAnim(t, 6, 1.8, 2.4);
                    m.scale.set(1, 1, 1 - v/20);

                    /*let v = smoothAnim(t, 10, 1.5, 4.5);
                    m.rotation.z = sign * (Math.PI / 2) * v;
                    m.position.x = -0.6 * v;*/

                },
                color: 0xC2A278, // Deep Walnut Brown
                createMaterial: (useVertexColors) => createWoodMaterial()

                /*new THREE.MeshStandardMaterial({
                    //color: 0xC2A278,      // The "Cork" hex
                    roughness: 0.9,       // Very high - wood/cork is matte
                    metalness: 0.0,       // Absolutely zero
                    color: useVertexColors ? 0xffffff : 0xC2A278
                })*/
            }
        ]
    };
}       

function createWoodMaterial(baseColorHex = 0xC2A278) {
    const material = new THREE.MeshStandardMaterial({
        color: baseColorHex,
        roughness: 0.8,
        flatShading: false
    });

    material.onBeforeCompile = (shader) => {
        // 1. Inject Variables and Noise Functions into the Fragment Shader
        shader.fragmentShader = `
            varying vec3 vLocalPosition;
            
            float hash(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }

            float noise(vec3 x) {
                //return 0.0;
                vec3 i = floor(x);
                vec3 f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                               mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                           mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                               mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
            }
        ` + shader.fragmentShader;

        // 2. Inject the Color Logic (Organic Grain Math)
        shader.fragmentShader = shader.fragmentShader.replace(
            `#include <color_fragment>`,
            `
            #include <color_fragment>
            
            // Base coordinates for rings
            float dist = length(vLocalPosition.xz);
            //float dist = vLocalPosition.x;
            
            // Add turbulence to the rings
            float n = noise(vLocalPosition * 10.0);
            //dist += n * 0.2;

            // 1. Large-scale wobble (The shape of the tree)
            dist += noise(vLocalPosition * 0.5) * 0.5;

            // 2. Your discovery: Micro-jitter (The texture of the wood fibers)
            dist += noise(vLocalPosition * 10.0) * 0.1;
            
            // Create irregular spacing (the "Rainy Year" effect)
            float spacing = noise(vec3(dist * 0.8, 0.0, 0.0)) * 50.0;
            
            // Calculate final ring pattern
            float rings = sin(dist * 150.0 + spacing + n * 8.0);
            
            // Add fine vertical fibers
            float fibers = noise(vLocalPosition * vec3(20.0, 0.5, 20.0)) * 0.1;
            
            float finalGrain = smoothstep(-0.4, 0.4, rings) + fibers;
            
            // Apply the grain to the final color
            diffuseColor.rgb *= mix(0.85, 1.0, finalGrain);
            `
        );

        // 3. Setup Vertex Shader to pass Local Position
        shader.vertexShader = `
            varying vec3 vLocalPosition;
        ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            vLocalPosition = position;
            `
        );
    };

    return material;
}