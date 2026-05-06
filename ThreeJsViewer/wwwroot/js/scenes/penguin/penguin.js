import { icosaVertices } from './icosa.js';
import * as THREE from 'three';

export function createPenguinScene(pcount, ecount0, ecount1, name ) {

    let vertices = structuredClone(icosaVertices);
    let eggs = [];
    let penguins = [];
    let selectedPenguin = null;
    let selectedVertex = -1;
    let verticesHighlight = vertices.map(() => ({
        t0: 0,
        t1: 1,
        wPrev: 0,
        w: 0
    }));

    function createPenguin(params = {}) {
        let index = params.index;
        let fromVertex = params.startFrom;
        let toVertex = params.startTo;
        let nextVertex = 0;
        let speed = params.speed;
        let initspeed = params.speed;
        let color = params.color;
        let t0 = -1;
        let t1 = -1;
        let animType = params.animType;
        let animChange = params.animChange;
        let fromEgg = false;
        let toEgg = false;
        let withEgg = false;
        let nextFromEgg = false;
        let nextToEgg = false;
        let nextWithEgg = false;
        let lastPos = null;
        let selectionStateChanged = false;


        function progress(t) {
            if (t0 < 0) {
                t0 = t;
                t1 = t + 1.0 / speed;
            }

            let tt = 0;

            if (Math.abs(t1 - t0) < 0.00001) {
                tt = 2.0;
            } else {
                tt = (t - t0) / (t1 - t0);
            }

            if (tt > 1) {
                t0 = t;
                t1 = t + 1.0 / speed;
                tt = 0;

                animType = (animType + 1) % 3;
                animChange = true;
            }

            return tt;
        }

        function inVertex() {
            return toVertex;
        }

        function setSelected(selected) {
            if (selected) {
                penguin.mesh.material.userData.uSelectedId.value = 1.0;
                penguin.mesh.material.userData.uHighlightColor1.value = new THREE.Color(color);

                penguin.mesh.material.metalness = 0.7;
                penguin.mesh.material.roughness = 0.3;

                speed = 0.6;
            } else {
                penguin.mesh.material.userData.uSelectedId.value = -1.0;
                penguin.mesh.material.roughness = 0.5;
                penguin.mesh.material.metalness = 0.4;

                speed = initspeed;
            }
            penguin.mesh.material.needsUpdate = true;
            selectionStateChanged = true;

            selectAudio.play();
        }

        let penguin = {
            path: 'assets/OnSphere/penguinEgg.ply',
            //color: 0xa0a0a0,
            createMaterial: () => createTwistMaterial(color),
            prepareGeometry: g => {
                penguinColors(g, color)
                g.rotateZ(Math.PI);
                g.scale(0.07, 0.07, 0.07);
            },
            prepareMesh: m => {
                m.castShadow = true;
            },
            animate: (m, t) => {

                let tt = progress(t);
                let da = 0.105;

                let toZero = v => {

                    if (Math.abs(v) < 0.01) {
                        return 0;
                    }
                    return 0.95 * v;
                }

                if (animType == 0) {
                    if (animChange) {
                        if (nextWithEgg) {
                            eggs[vertices[toVertex].egg].setSpeed(speed);
                            eggs[vertices[toVertex].egg].startMoveTo(nextVertex);
                        }

                        fromVertex = toVertex;
                        toVertex = nextVertex;
                        fromEgg = nextFromEgg;
                        toEgg = nextToEgg;
                        withEgg = nextWithEgg;
                        animChange = false;
                        m.material.userData.uTime1.value = 0;
                    }

                    let x1 = vertices[fromVertex].x;
                    let y1 = vertices[fromVertex].y;
                    let z1 = vertices[fromVertex].z;

                    let x2 = vertices[toVertex].x;
                    let y2 = vertices[toVertex].y;
                    let z2 = vertices[toVertex].z;

                    let da1 = withEgg ? -da : (fromEgg ? da : 0.0);
                    let da2 = toEgg ? da : 0.0;

                    if (withEgg && lastPos != null) {
                        let stt = (2.0 * Math.sqrt(tt) + tt) / 3.0;
                        x1 = stt * x1 + (1 - stt) * lastPos.x;
                        y1 = stt * y1 + (1 - stt) * lastPos.y;
                        z1 = stt * z1 + (1 - stt) * lastPos.z;
                        //stt = tt ** (1 / 3); 
                        da1 = stt * da1;
                    }

                    let pos = getGeodesicState(x1, y1, z1, x2, y2, z2, tt, da1, da2);
                    updateFigureTransform(m, pos.x, pos.y, pos.z, pos.v1, pos.v2, pos.v3, 0.043);
                    m.material.userData.uTwistStrength.value = 30.0 * oscillation1(tt, 80);

                    if (selectedPenguin == penguin) {
                        m.material.userData.uTwistStrength2.value = toZero(m.material.userData.uTwistStrength2.value);
                        m.material.userData.uSelectedId1.value = -1.0;
                    }

                    if (tt > 0.1 && vertices[fromVertex].penguin == index && !toEgg) {
                        vertices[fromVertex].penguin = -1;
                    }
                }

                if (animType == 1) {
                    if (selectionStateChanged) {
                        t0 = -1;
                        animChange = true;
                        selectionStateChanged = false;
                        return;
                    }

                    if (animChange) {
                        if (selectedPenguin != penguin) {
                            t1 = t0 + 0.5 * (t1 - t0);
                        } else {
                            t1 = t0 + 3.0 * (t1 - t0);
                        }
                        animChange = false;
                    }

                    let x1 = vertices[fromVertex].x;
                    let y1 = vertices[fromVertex].y;
                    let z1 = vertices[fromVertex].z;

                    let x2 = vertices[toVertex].x;
                    let y2 = vertices[toVertex].y;
                    let z2 = vertices[toVertex].z;

                    let pos = getGeodesicState(x1, y1, z1, x2, y2, z2, 1.0, withEgg ? -da : (fromEgg ? da : 0.0), toEgg ? da : 0.0);
                    updateFigureTransform(m, pos.x, pos.y, pos.z, pos.v1, pos.v2, pos.v3, 0.043);
                    m.material.userData.uTime1.value = (selectedPenguin == penguin ? toZero(m.material.userData.uTime1.value) : 2 * Math.PI * tt);
                    m.material.userData.uTwistStrength2.value = (selectedPenguin != penguin ? toZero(m.material.userData.uTwistStrength2.value) : (Math.sin(Math.PI * tt) + 0.4 * Math.sin(2.0 * Math.PI * tt)));
                    m.material.userData.uSelectedId1.value = (selectedPenguin != penguin || Math.abs(tt - 0.35) > 0.25 ? -1.0 : 2.0);

                    lastPos = pos;

                    if (selectedPenguin == penguin && selectedVertex != -1) {
                        animType = 2;
                        //m.material.userData.uTwistStrength2.value = 0;
                        t0 = -1;
                        animChange = true;
                        return;
                    }
                }

                if (animType == 2) {
                    if (animChange) {

                        let testSelected = (v) => selectedPenguin != penguin || v == selectedVertex ;

                        if (toEgg) {
                            let followEgg = false;
                            if (vertices[toVertex].egg != -1 && !eggs[vertices[toVertex].egg].isInMove() && (selectedPenguin == penguin || eggs[vertices[toVertex].egg].type == 0 || Math.random() < 0.25)) {
                                opositeVertex(fromVertex, toVertex).forEach(moveTo => {
                                    if (moveTo < 0 || !testSelected(moveTo) || followEgg) {
                                        return;
                                    }

                                    if (vertices[moveTo].egg == -1 && vertices[moveTo].penguin == -1) {
                                        nextVertex = moveTo;
                                        nextToEgg = true;
                                        nextFromEgg = false;
                                        nextWithEgg = true;
                                        followEgg = true;
                                        vertices[toVertex].penguin = index;
                                        //vertices[nextVertex].penguin = index;
                                        vertices[fromVertex].penguin = -1;
                                        eggs[vertices[toVertex].egg].initMoveTo(moveTo);
                                    }
                                });
                            }
                            if (!followEgg) {
                                if (selectedPenguin != penguin || selectedVertex == fromVertex || vertices[toVertex].egg == -1 || eggs[vertices[toVertex].egg].isInMove()) {
                                    nextVertex = fromVertex;
                                    nextToEgg = false;
                                    nextFromEgg = true;
                                    nextWithEgg = false;
                                    vertices[nextVertex].penguin = index; //not needed, allready set
                                } else {
                                    animType = 1;
                                    t0 = -1;
                                    animChange = true;
                                    if (selectedVertex != -1 && selectedPenguin == penguin) {
                                        noAudio.play();
                                    }
                                    selectedVertex = -1;
                                    return;
                                }
                            }
                        } else {

                            let n = -1;

                            if (!fromEgg || selectedPenguin == penguin) {
                                n = randomIndexWhere(vertices[toVertex].vertices, vi => (testSelected(vi) && vertices[vi].penguin == -1 || vertices[vi].penguin == index) && (vertices[vi].egg != -1 /*&& (selectedPenguin == penguin || eggs[vertices[vi].egg].type == 0)*/));
                            }

                            if (n < 0) {
                                n = randomIndexWhere(vertices[toVertex].vertices, vi => (testSelected(vi) && vertices[vi].penguin == -1 || vertices[vi].penguin == index) && vertices[vi].egg == -1);
                            }

                            if (n < 0) {
                                animType = 1;
                                t0 = -1;
                                animChange = true;
                                if (selectedVertex != -1 && selectedPenguin == penguin) {
                                    noAudio.play();
                                }
                                selectedVertex = -1;
                                return;
                            } else {
                                nextVertex = vertices[toVertex].vertices[n];
                                nextWithEgg = false;
                                nextToEgg = vertices[nextVertex].egg != -1;
                                nextFromEgg = false;

                                if (!nextToEgg) {
                                    vertices[nextVertex].penguin = index;
                                }
                            }
                        }

                        if (selectedPenguin == penguin) {
                            selectedVertex = -1;
                        }
                    }

                    let x1 = vertices[fromVertex].x;
                    let y1 = vertices[fromVertex].y;
                    let z1 = vertices[fromVertex].z;

                    let x2 = vertices[toVertex].x;
                    let y2 = vertices[toVertex].y;
                    let z2 = vertices[toVertex].z;

                    let x3 = vertices[nextVertex].x;
                    let y3 = vertices[nextVertex].y;
                    let z3 = vertices[nextVertex].z;

                    let pos1 = getGeodesicState(x1, y1, z1, x2, y2, z2, 1.0, withEgg ? -da : (fromEgg ? da : 0.0), toEgg ? da : 0.0);
                    let pos2 = getGeodesicState(x2, y2, z2, x3, y3, z3, 0.0, nextWithEgg ? -da : (nextFromEgg ? da : 0.0), nextToEgg ? da : 0.0);

                    let posv = getGeodesicState(pos1.v1, pos1.v2, pos1.v3, pos2.v1, pos2.v2, pos2.v3, tt, 0, 0, new THREE.Vector3(x2, y2, z2));

                    if (animChange) {
                        animChange = false;
                        t1 = t0 + 0.5 * (t1 - t0) * Math.abs(posv.totalAngle) / Math.PI;
                    }

                    updateFigureTransform(m, pos1.x, pos1.y, pos1.z, posv.x, posv.y, posv.z, 0.043);

                    m.material.userData.uTwistStrength.value = 20.0 * oscillation1(tt, 80 * (t1 - t0) * speed);
                }

                selectionStateChanged = false;
            },
            inVertex,
            setSelected
        }

        return penguin;
    }

    function createEgg(params = {}) {
        let index = params.index;
        let fromVertex = params.startFrom;
        let toVertex = params.startTo;
        let speed = params.speed;
        let t0 = -1;
        let t1 = -1;
        let animType = params.animType;
        let animChange = params.animChange;
        let moveState = -1;

        function progress(t) {
            if (t0 < 0) {
                t0 = t;
                t1 = t + 1.0 / speed;
            }

            let tt = 0;

            if (Math.abs(t1 - t0) < 0.00001) {
                tt = 2.0;
            } else {
                tt = (t - t0) / (t1 - t0);
            }

            if (tt > 1) {
                t0 = t;
                t1 = t + 1.0 / speed;
                tt = 0;

                if (animType == 0) {
                    animType = 1;
                }
                animChange = true;
            }

            return tt;
        }

        function setSpeed(newSpeed) {
            speed = newSpeed;
        }

        function isInMove() {
            return moveState != -1;
        }

        function inVertex() {
            return toVertex;
        }

        function initMoveTo(nextVertex) {
            if (moveState != -1) {
                return;
            }

            vertices[nextVertex].egg = index;
            moveState = 0;
        }
        function startMoveTo(nextVertex) {
            fromVertex = toVertex;
            toVertex = nextVertex;

            if (!vertices[fromVertex].vertices.includes(toVertex)) {
                console.log('chyba');
            }

            t0 = -1;
            animType = 0;
            moveState = 1;
        }


        return {
            type: params.type,
            path: params.type == 0 ? 'assets/OnSphere/openedegg.ply': 'assets/OnSphere/egg.ply',
            //color: params.color,
            setupMaterial: m => {

                if (params.type == 1) {
                    m.metalness = 0.7;
                    m.roughness = 0.3;
                    //m.emissive = 0xffa500;
                    //m.emissiveIntensity = 0.1;
                    m.color = 0xffd700;
                } else {
                    m.color = params.color;
                    m.vertexColors = false;
                    m.roughness = 0.1;
                    m.metalness = 0.3;
                }
            },
            //createMaterial: () => createTwistMaterial(params.color),
            prepareGeometry: g => {
                g.rotateZ(Math.PI);
                g.scale(0.08, 0.08, 0.08);
            },
            prepareMesh: m => {
                m.castShadow = true;
            },
            animate: (m, t) => {

                let tt = progress(t);

                if (animType == 0) {
                    if (animChange) {
                        animChange = false;
                    }

                    let x1 = vertices[fromVertex].x;
                    let y1 = vertices[fromVertex].y;
                    let z1 = vertices[fromVertex].z;

                    let x2 = vertices[toVertex].x;
                    let y2 = vertices[toVertex].y;
                    let z2 = vertices[toVertex].z;

                    let pos = getGeodesicState(x1, y1, z1, x2, y2, z2, tt);
                    updateFigureTransform(m, pos.x, pos.y, pos.z, 0, 0, 0, 0.04);

                    /*if (tt > 0.1 && vertices[fromVertex].egg == index) {
                        vertices[fromVertex].egg = -1;
                    }*/
                }

                if (animType == 1) {
                    if (animChange) {
                        animChange = false;
                        if (moveState == 1) {
                            if (vertices[fromVertex].egg == index) {
                                vertices[fromVertex].egg = -1;
                            }
                            moveState = -1;
                        }

                        //vertices.filter(v => v.egg == index).forEach(v => v.egg = -1);
                        //vertices[toVertex].egg = index;

                        //inMove = false;
                    }

                    let x1 = vertices[fromVertex].x;
                    let y1 = vertices[fromVertex].y;
                    let z1 = vertices[fromVertex].z;

                    let x2 = vertices[toVertex].x;
                    let y2 = vertices[toVertex].y;
                    let z2 = vertices[toVertex].z;

                    let pos = getGeodesicState(x1, y1, z1, x2, y2, z2, 1.0);
                    updateFigureTransform(m, pos.x, pos.y, pos.z, 0, 0, 0, 0.04);
                }
            },
            initMoveTo,
            startMoveTo,
            isInMove,
            inVertex,
            setSpeed
        }
    }

    function opositeVertex(fromVertex, toVertex) {

        let toNeighbor = vertices[toVertex].vertices;
        let intersection = vertices[fromVertex].vertices.filter(x => toNeighbor.includes(x));

        let p0 = fromVertex;
        let p = intersection[0];
        let p1 = -1;

        for (var i = 0; i < (vertices[toVertex].vertices.length == 6 ? 3 : 2); i++) {

            intersection = vertices[p].vertices.filter(x => toNeighbor.includes(x));

            if (i == 2) {
                if (p0 == intersection[0]) {
                    p1 = intersection[1];
                } else {
                    p1 = intersection[0];
                }
            } else {
                if (p0 == intersection[0]) {
                    p0 = p;
                    p = intersection[1];
                } else {
                    p0 = p;
                    p = intersection[0];
                }
            }
        }

        return vertices[toVertex].vertices.length == 6 ? [p, p0, p1] : [p0, p];
    }

    function testWin() {
        let eggVert = vertices.filter(v => v.egg != -1 && eggs[v.egg].type == 1);

        const intersection = eggVert.reduce((acc, obj) => {
            return acc.filter(value => obj.vertices.includes(value));
        }, eggVert[0].vertices)[0] ?? -1;

        return intersection;
    }

    let scene = {
        reset: () => {
            if (scene.used) {
                return createPenguinScene(pcount, ecount0, ecount1, name);
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
                selectedVertex = -1;
                return true;
            }

            if (selectedPenguin == null) {
                return false;
            }

            let v = -1
            i = eggs.indexOf(m.userData);
            if (i >= 0) {
                let egg = m.userData;
                if (!egg.isInMove()) {
                    v = egg.inVertex();
                }
            }

            if (m.userData == scene.models[0]) {
                let d = findNearestVertex(p, vertices)
                if (d.distance < 0.15) {
                    v = d.index;
                }
            }

            if (v != -1 && vertices[selectedPenguin.inVertex()].vertices.indexOf(v) != -1) {
                selectedVertex = v;
                goAudio.play();
                //return true;
            }

            return false;

        },
        setup: (camera, dirLight) => {
            camera.position.set(-1.5, 0.0, 1.0);
            dirLight.position.set(1, 1, 1);
            //dirLight.target.position.set(-1, -1, -1);
        },
        gameMode: {
            audio: "assets/OnSphere/magellano-penguins.wav",
            sceneBackgroundTexture: "assets/OnSphere/milky_way_penguin.png",
            title: "Penguin planet",
            description: "Help the penguins collect the golden eggs in the hexagon. Click to choose which penguin to control. And click again to choose where to march or which egg to push. But the place may be occupied..."
        },
        //shadowMapType: THREE.VSMShadowMap, //THREE.VSMShadowMap, THREE.PCFShadowMap
        name: "Penguins/" + name,
        models: [
            {
                path: 'assets/OnSphere/geodesicSphereIcosa.ply',
                createMaterial: () => {
                    let m = createHighlightMaterial(vertices.length);
                    const pointsArray = m.userData.uHighlightPoints.value;
                    for (var i = 0; i < pointsArray.length; i++) {                        
                        pointsArray[i].set(vertices[i].x, vertices[i].y, vertices[i].z, 0.0);
                    }                    

                    return m;
                },
                prepareMesh: m => {
                    m.receiveShadow = true;
                    m.castShadow = false;
                },
                animate: (m, t) => {
                    const pointsArray = m.material.userData.uHighlightPoints.value;

                    let win = testWin(); //t > 10 ? 0 : -1; 

                    if (win != -1 && !scene.gameOver) {
                        scene.gameOver = true;
                        winAudio.play();
                        setTimeout(() => {
                            scene.showModal("So you've done some real hard work! The penguins are thrilled.");
                        }, 5000);
                    }

                    for (var i = 0; i < pointsArray.length; i++) {
                        let w = 0;
                        if (win != - 1 && (i == win || (vertices[i].egg != -1 && eggs[vertices[i].egg].type == 1))) {
                            w = 1.0 * Math.sin(4 * t) - 1.0;
                            pointsArray[i].w = w;
                        } else {
                            w = vertices[i].penguin == -1 ? (vertices[i].egg != -1 && eggs[vertices[i].egg].isInMove() ? -1.0 : 0) : (penguins[vertices[i].penguin] == selectedPenguin ? -1.0 : 1.0);
                            let vh = verticesHighlight[i];
                            if (vh.w != w) {
                                vh.wPrev = vh.w;
                                vh.w = w
                                vh.t0 = t;
                                vh.t1 = t + 0.5;
                            }
                            let tt = THREE.MathUtils.smoothstep(t, vh.t0, vh.t1);
                            pointsArray[i].w = (1 - tt) * vh.wPrev + tt * vh.w;
                        }
                    }                    
                }
            }
        ]
    };

    vertices.forEach(v => {
        v.penguin = -1;
        v.egg = -1;
    });

    for (let i = 0; i < ecount0 + ecount1; i++) {

        let startTo = randomIndexWhere(vertices, v => v.penguin == -1 && v.egg == -1);
        let startFrom = vertices[startTo].vertices[0];
        vertices[startTo].egg = i;

        let egg = createEgg({
            type: i < ecount0 ? 0 : 1,
            index: i,
            startFrom,
            startTo,
            animType: 1,
            animChange: true,
            speed: 0.2,
            color: 0xffffff
        });

        scene.models.push(egg);
        eggs.push(egg);
    }

    for (let i = 0; i < pcount; i++) {

        let startTo = randomIndexWhere(vertices, v => v.penguin == -1 && v.egg == -1); 
        let startFrom = vertices[startTo].vertices[0];
        vertices[startTo].penguin = i;

        let clrspeed = /*0.5 * */(pcount == 1 ? 1 : i / (pcount - 1));

        const value = 48 + Math.floor(clrspeed * (150 - 48));
        const grayColor = (value << 16) | (value << 8) | value;

        let penguin = createPenguin({
            index: i,
            startFrom,
            startTo,
            animType: 1,
            animChange: true,
            speed: 0.25 + 0.25 * clrspeed,
            color: grayColor
        });

        scene.models.push(penguin);
        penguins.push(penguin);
    }

    let selectAudio = new Audio('assets/OnSphere/851556__coghezzi__ui-menu-click-reverb-soft-confirm-click.wav');
    selectAudio.loop = false;
    selectAudio.volume = 1.0;    

    let goAudio = new Audio('assets/OnSphere/21695__ice9ine__right-foot.wav');
    goAudio.loop = false;
    goAudio.volume = 1.0;    

    let noAudio = new Audio('assets/OnSphere/771167__valhallaproject__sci-fi-grenade-launcher.ogg');
    noAudio.loop = false;
    noAudio.volume = 1.0;    

    let winAudio = new Audio('assets/OnSphere/456966__funwithsound__success-fanfare-trumpets.mp3');
    winAudio.loop = false;
    winAudio.volume = 1.0;    


    return scene;
}

function randomIndexWhere(arr, predicate) {
    const eligible = arr.reduce((acc, el, i) => {
        if (predicate(el)) acc.push(i);
        return acc;
    }, []);

    if (eligible.length === 0) return -1; // or null, or throw
    return eligible[Math.floor(Math.random() * eligible.length)];
}

function oscillation1(t, m) {
    const phi = m * (1 - Math.cos(Math.PI * t)) / Math.PI;
    return Math.sin(phi) * t * (1 - t);
}

/*function oscillation2(t, m) {
    const phi = m * (t / 2 - Math.sin(2 * Math.PI * t) / (4 * Math.PI));
    return Math.sin(phi) * t * (1 - t);
}*/

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

/**
 * @param {THREE.Object3D} figure - Your character mesh/model
 * @param {number} x, y, z - Coordinates on the sphere surface
 * @param {number} v1, v2, v3 - Velocity components (direction of movement)
 * @param {number} shift - Distance to offset figure so it stands on surface
 */
function updateFigureTransform(figure, x, y, z, v1, v2, v3, shift) {

    // 1. Create Vectors from inputs
    const pos = new THREE.Vector3(x, y, z);
    const vel = (v1 == 0 && v2 == 0 && v3 == 0 ? getOrthogonalVector(pos) : new THREE.Vector3(v1, v2, v3));

    // 2. Define the Basis Vectors
    // Z-axis (Normal): Points from center through the position
    const newZ = pos.clone().normalize();

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
        x + (newZ.x * shift),
        y + (newZ.y * shift),
        z + (newZ.z * shift)
    );
}

/**
 * Calculates position and eased velocity along a great circle path.
 * @param {number} x1, y1, z1 - Start point (t=0)
 * @param {number} x2, y2, z2 - End point (t=1)
 * @param {number} t - Linear time (0 to 1)
 * @returns {Object} {x, y, z, v1, v2, v3, v}
 */
function getGeodesicState(x1, y1, z1, x2, y2, z2, t, da1 = 0, da2 = 0, axis1 = null) {
    // 1. Setup Vectors
    const p1 = new THREE.Vector3(x1, y1, z1);
    const p2 = new THREE.Vector3(x2, y2, z2);

    // 2. Define the rotation axis (perpendicular to the path)
    let axis = new THREE.Vector3().crossVectors(p1, p2);

    // Handle cases where points are identical or polar opposites
    //if (axis.lengthSq() < 0.000001) {
    //    return { x: x1, y: y1, z: z1, v1: 0, v2: 0, v3: 0 };
    //}
    // --- STABLE ANTIPODAL HANDLING ---
    if (axis.lengthSq() < 0.000001) {
        // Case: Points are identical
        if (p1.distanceTo(p2) < 0.0001) {
            return { x: x1, y: y1, z: z1, v1: 0, v2: 0, v3: 0, speed: 0, totalAngle: 0 };
        }

        if (axis1 != null) {
            axis = axis1;
        } else {
            // Case: Points are opposites. 
            // We need an axis perpendicular to p1. 
            // Logic: find the smallest component of p1 and cross with that basis vector.
            // This is deterministic and won't flip-flop.
            const ax = Math.abs(p1.x);
            const ay = Math.abs(p1.y);
            const az = Math.abs(p1.z);

            if (ax <= ay && ax <= az) axis.set(0, -p1.z, p1.y);
            else if (ay <= ax && ay <= az) axis.set(-p1.z, 0, p1.x);
            else axis.set(-p1.y, p1.x, 0);
        }
    }
    axis.normalize();

    // 3. Calculate Easing using Three.js built-in utility
    // This transforms linear t into a curved t
    const easedT = THREE.MathUtils.smoothstep(t, 0, 1);

    // 4. Calculate Position at eased time
    const totalAngle = p1.angleTo(p2) - da1 - da2;
    const currentAngle = easedT * totalAngle;
    const posAtT = p1.clone().applyAxisAngle(axis, da1).clone().applyAxisAngle(axis, currentAngle);

    // 5. Calculate Velocity (Direction * Speed)
    // The derivative of smoothstep (3t^2 - 2t^3) is (6t - 6t^2)
    const speed = (6 * t - 6 * t * t) * totalAngle;

    // Get the normalized direction vector (tangent to sphere)
    const direction = new THREE.Vector3().crossVectors(axis, posAtT).normalize();

    // If we are at the very start/end, speed is 0. 
    // We return the direction vector so the character still "points" the right way.
    //const velocity = direction.clone().multiplyScalar(Math.max(speed, 0.0001));

    return {
        x: posAtT.x,
        y: posAtT.y,
        z: posAtT.z,
        v1: direction.x,
        v2: direction.y,
        v3: direction.z,
        v: speed,
        totalAngle: totalAngle 
    };
}

function findNearestVertex(p, vertices) {
    let nearestIndex = -1;
    let minDistanceSq = Infinity;

    // We reuse one Vector3 object to avoid creating thousands of objects in memory
    const tempVec = new THREE.Vector3();

    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];

        // Set our temp vector to the current vertex coordinates
        tempVec.set(v.x, v.y, v.z);

        // Calculate squared distance
        const distSq = p.distanceToSquared(tempVec);

        if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            nearestIndex = i;
        }
    }

    return {
        index: nearestIndex,
        distance: Math.sqrt(minDistanceSq) // Square root only once at the very end
    };
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

/**
 * Creates a MeshStandardMaterial that darkens the mesh near specific local points.
 * @returns {THREE.MeshStandardMaterial}
 */
function createHighlightMaterial(n) {
    // 1. Initialize the data structure for n points
    // Vector4: x, y, z are local coordinates; w is the intensity (0.0 to 1.0)
    const points = [];
    for (let i = 0; i < n; i++) {
        points.push(new THREE.Vector4(0, 0, 0, 0));
    }

    const material = new THREE.MeshStandardMaterial({
        vertexColors: true, // Required for PLY vertex colors
        roughness: 0.05,
        metalness: 0.5,
        color: 0xffffff
    });

    // 2. Store uniforms in userData for easy access later
    material.userData = {
        uHighlightPoints: { value: points },
        uRadius: { value: 0.10 }
    };

    material.onBeforeCompile = (shader) => {
        // Merge our custom uniforms into the shader
        Object.assign(shader.uniforms, material.userData);

        // --- VERTEX SHADER: Pass local position ---
        shader.vertexShader = `
      varying vec3 vLocalPosition;
      ${shader.vertexShader}
    `.replace(
            '#include <begin_vertex>',
            `
      #include <begin_vertex>
      vLocalPosition = position.xyz; 
      `
        );

        // --- FRAGMENT SHADER: Calculate Darkening ---
        shader.fragmentShader = `
      varying vec3 vLocalPosition;
      uniform vec4 uHighlightPoints[${n}];
      uniform float uRadius;
      ${shader.fragmentShader}
    `.replace(
            '#include <color_fragment>',
            `
      #include <color_fragment>
      
      float totalDarkening = 0.0;
      
      for(int i = 0; i < ${n}; i++) {
          // Calculate distance in Local Space
          float dist = distance(vLocalPosition, uHighlightPoints[i].xyz);
          
          float w = uHighlightPoints[i].w;
          float ww = min(0.5 + 0.5 * abs(w),1.0);

          // Smooth transition: 1.0 at center, 0.0 at uRadius
          float mask = smoothstep(ww * uRadius, ww * uRadius - 0.01, dist);
          
          // Apply individual point intensity (the .w component)
          float pointEffect = 0.6 * mask * w;
          
          totalDarkening += pointEffect;
      }
      
      // Apply the darkening to the base color before lighting is calculated
      diffuseColor.rgb *= (1.0 - totalDarkening);
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