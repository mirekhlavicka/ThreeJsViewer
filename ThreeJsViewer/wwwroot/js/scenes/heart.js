import { triangle01, sinSmooth, smoothAnim, goldMaterial } from '../utils.js';

export const dogCatScene = {
    name: "Heart/Dog & cat Valentine's day",
    setup: (camera) => {
        camera.position.set(0, -3, 2);
    },
    models: [
        {
            path: 'assets/Labrador and cat - heart.ply',
            color: 0xff69b4, // Hot Pink
            animate: (m, t) => {
                let v = 2 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                v = sinSmooth(v, 0, 1.6);
                m.position.y = -0.75 * v;
                m.rotation.y = (2 * Math.PI) * v / 1.6;
            }
        },
        {
            path: 'assets/Labrador and cat.ply'
        }
    ]
}

export const openHeartScene = {
    name: "Heart/Open heart",
    setup: (camera) => {
        camera.position.set(0, 3, 1);
    },
    models: [
        {
            path: 'assets/heart/Open heart in.ply',
            color: 0xff69b4,
            animate: (m, t) => {
                let v = 2 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                v = sinSmooth(v, 0, 1.6);
                m.position.x = -v;
                v = Math.max(v - 0.2, 0);
                v = sinSmooth(v, 0, 1.4);
                m.rotation.z = (Math.PI / 2) * v / 1.4;
            }
        },
        {
            path: 'assets/heart/Open heart out.ply',
            color: 0xff69b4,
            animate: (m, t) => {
                let v = 2 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                v = sinSmooth(v, 0, 1.6);
                m.position.x = v;
                v = Math.max(v - 0.2, 0);
                v = sinSmooth(v, 0, 1.4);
                m.rotation.z = -(Math.PI / 2) * v / 1.4;
            }
        }
    ]
}

export const goldHeartScene = {
    name: "Heart/Gold heart",
    setup: (camera) => {
        camera.position.set(0, 3, 1);
    },
    models: [
        {
            path: 'assets/heart/Open heart in1.ply',
            //color: 0xff69b4,
            color: 0xffd700,
            setupMaterial: goldMaterial,
            animate: (m, t) => {
                let v = 2 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                v = sinSmooth(v, 0, 1.6);
                m.position.x = -v;
                v = Math.max(v - 0.2, 0);
                m.rotation.z = (Math.PI / 2) * v / 1.4;
            }
        },
        {
            path: 'assets/heart/Open heart out1.ply',
            //color: 0xff69b4,
            color: 0xffd700,
            setupMaterial: goldMaterial,
            animate: (m, t) => {
                let v = 2 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                v = sinSmooth(v, 0, 1.6);
                m.position.x = v;
                v = Math.max(v - 0.2, 0);
                m.rotation.z = -(Math.PI / 2) * v / 1.4;
            }
        }
    ]
}

export const bikeHeartScene = {
    name: "Heart/Bike in heart",
    setup: (camera) => {
        camera.position.set(-2, -1, 3);
    },
    models: [
        {
            path: 'assets/heart/BikeInHeart.ply',
            color: 0xff69b4,
            animate: (m, t) => {
                let v = 2 * triangle01(t, 10);
                v = -0.2 + Math.min(Math.max(v, 0.2), 1.8);
                v = sinSmooth(v, 0, 1.6);
                m.position.z = v;
                v = Math.max(v - 0.2, 0);
                m.rotation.x = (Math.PI / 2) * v / 1.4;
            }
        },
        {
            path: 'assets/heart/BikeInHeart1.ply',
            color: 0xff69b4
        }
    ]
}