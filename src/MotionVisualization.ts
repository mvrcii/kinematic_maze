import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Reactor} from "./events";
import {Sky} from "three/examples/jsm/objects/Sky";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import Papa from "papaparse";
import {PlaybackController} from './PlaybackController';

function sleep(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class MotionVisualization {
    csvPath: string;

    isAutoRotateEnabled = true;

    rendererDom: HTMLElement
    scene: THREE.Scene
    reactor: Reactor
    renderer: THREE.WebGLRenderer
    camera!: THREE.PerspectiveCamera
    cameraControls!: OrbitControls
    clock: THREE.Clock

    settings: { [key: string]: any } = {};
    meshes: { [key: string]: THREE.Mesh | THREE.Group } = {};
    mixers: { [key: string]: THREE.AnimationMixer } = {};
    actions: { [key: string]: any } = {};
    state: { [key: string]: any } = {};
    canvas: HTMLCanvasElement;
    playerDom: HTMLDivElement;
    canvasContainer: HTMLDivElement;

    constructor(playerDom: HTMLDivElement) {
        this.playerDom = playerDom;
        this.canvas = document.createElement("canvas");
        this.canvasContainer = document.createElement("div");
        this.canvasContainer.classList.add("canvas-container")
        this.canvasContainer.appendChild(this.canvas);
        this.playerDom.appendChild(this.canvasContainer);
        this.csvPath = this.playerDom.dataset["sourcePath"] as string;

        if (this.playerDom.dataset["progressbar"] == "true") {
            new PlaybackController(this);
        }
        this.scene = new THREE.Scene();
        this.reactor = new Reactor()
        this.reactor.registerEvent('step');
        this.reactor.registerEvent('sweep');

        this.renderer = new THREE.WebGLRenderer(
            {
                canvas: this.canvas,
                antialias: true,
                precision: "highp"
            });
        this.rendererDom = this.renderer.domElement

        this._setupCameraAndControls()
        this._addKeyListeners()
        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.setupScene();

        this.clock = new THREE.Clock();

        const material = new THREE.MeshStandardMaterial({color: 0x00ff00});
        this.meshes["HMDIndicator"] = new THREE.Mesh(new THREE.SphereGeometry(.02), material);
        this.meshes["leftControllerIndicator"] = new THREE.Mesh(new THREE.SphereGeometry(.02), material);
        this.meshes["rightControllerIndicator"] = new THREE.Mesh(new THREE.SphereGeometry(.02), material);

        this.mixers["HMDIndicator"] = new THREE.AnimationMixer(this.meshes["HMDIndicator"]);
        this.mixers["leftControllerIndicator"] = new THREE.AnimationMixer(this.meshes["leftControllerIndicator"]);
        this.mixers["rightControllerIndicator"] = new THREE.AnimationMixer(this.meshes["rightControllerIndicator"]);

        this.state = {}

        this.setup()

        this.onWindowResize()

        // Activate shadows
        for (const key in this.meshes) {
            if (this.meshes.hasOwnProperty(key)) {
                console.log("Activating shadow for", key)
                const mesh = this.meshes[key];
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        }

    }

    async setup() {
        const modelMapping = {
            HMD: "generic_hmd",
            leftController: "vr_controller_vive_1_5",
            rightController: "vr_controller_vive_1_5",
        }

        for (const [objectName, modelName] of Object.entries(modelMapping)) {
            new OBJLoader().load(
                "models/" + modelName + "/" + modelName + ".obj",
                (meshGroup) => {

                    const material = new THREE.MeshLambertMaterial({color: 0x444444});

                    meshGroup.traverse((child: THREE.Object3D) => {
                        if ((child as any).isMesh) {
                            const mesh = child as THREE.Mesh;
                            mesh.material = material;
                            mesh.castShadow = true;
                        }
                    });

                    meshGroup.scale.set(2, 2, 2)
                    meshGroup.position.set(0, 0, 0);
                    this.scene.add(meshGroup)

                    this.meshes[objectName] = meshGroup;
                    this.mixers[objectName] = new THREE.AnimationMixer(this.meshes[objectName]);
                },
                (xhr) => {
                },
                (error) => { // onError callback
                    console.error('An error happened', error);
                });
        }

        while (!this.allObjectsLoaded()) {
            console.log("waiting for objects to be loaded...")
            await sleep(250);
        }

        await this._loadAndBuildAnimations()
    }

    _setupCameraAndControls() {
        this.camera = new THREE.PerspectiveCamera(40, this.rendererDom.offsetWidth / this.rendererDom.offsetHeight, 0.1, 8000);

        this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.cameraControls.enableDamping = true;
        this.cameraControls.dampingFactor = 0.25;
        this.cameraControls.screenSpacePanning = false;
        this.cameraControls.autoRotate = false;
        this.cameraControls.autoRotateSpeed = 0.15;
        this.cameraControls.target.set(0, 1.2, 0);

        const radius = 3;
        const theta = Math.PI / 4; // 45 degrees in radians
        const offsetX = radius * Math.sin(theta);
        const thirdPersonOffsetY = 5;
        const thirdPersonOffsetZ = -3;
        this.camera.position.set(offsetX, thirdPersonOffsetY, thirdPersonOffsetZ);
        this.cameraControls.minPolarAngle = 0.5 * Math.PI / 3; // How low the camera can go
        this.cameraControls.maxPolarAngle = Math.PI / 3; // How high the camera can go
        this.cameraControls.enablePan = false;
        this.cameraControls.minAzimuthAngle = -Infinity; // radians
        this.cameraControls.maxAzimuthAngle = Infinity;
        this.cameraControls.enableRotate = true;
        this.cameraControls.update();

        this.cameraControls.addEventListener('change', () => {
            this.camera.position.y = thirdPersonOffsetY;
        });
    }

    _addKeyListeners() {
        // Toggle camera auto rotate when pressing space
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                this.isAutoRotateEnabled = !this.isAutoRotateEnabled;
                this.cameraControls.autoRotate = this.isAutoRotateEnabled;
                event.preventDefault();
            }
        });
    }

    async _loadAndBuildAnimations() {

        try {
            const response = await fetch(this.csvPath);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const csvData = await response.text();

            Papa.parse(csvData, {
                fastMode: true,
                header: true,
                skipEmptyLines: true,
                complete: (results: any) => {
                    const data = results.data;
                    const numRows = data.length;
                    const times = new Array(numRows);

                    const HeadPositions = new Array(numRows * 3);
                    const leftHandPositions = new Array(numRows * 3);
                    const rightHandPositions = new Array(numRows * 3);

                    const HeadRotations = new Array(numRows * 4);
                    const leftHandRotations = new Array(numRows * 4);
                    const rightHandRotations = new Array(numRows * 4);

                    const initialRow = data[0];

                    const yOffset = 2.0;

                    let row;
                    for (let i = 0; i < numRows; i++) {
                        row = data[i];
                        times[i] = Number(row.delta_time_ms) / 1000.0;
                        HeadPositions[i * 3 + 0] = Number(row.head_pos_x - initialRow.head_pos_x) / 50;
                        HeadPositions[i * 3 + 1] = Number(row.head_pos_y - initialRow.head_pos_y) / 50 + yOffset;
                        HeadPositions[i * 3 + 2] = Number(row.head_pos_z - initialRow.head_pos_z) / 50;

                        leftHandPositions[i * 3 + 0] = Number(row.left_hand_pos_x - initialRow.head_pos_x) / 50;
                        leftHandPositions[i * 3 + 1] = Number(row.left_hand_pos_y - initialRow.head_pos_y) / 50 + yOffset;
                        leftHandPositions[i * 3 + 2] = Number(row.left_hand_pos_z - initialRow.head_pos_z) / 50;

                        rightHandPositions[i * 3 + 0] = Number(row.right_hand_pos_x - initialRow.head_pos_x) / 50;
                        rightHandPositions[i * 3 + 1] = Number(row.right_hand_pos_y - initialRow.head_pos_y) / 50 + yOffset;
                        rightHandPositions[i * 3 + 2] = Number(row.right_hand_pos_z - initialRow.head_pos_z) / 50;

                        HeadRotations[i * 4 + 0] = Number(row.head_rot_x);
                        HeadRotations[i * 4 + 1] = Number(row.head_rot_y);
                        HeadRotations[i * 4 + 2] = Number(row.head_rot_z);
                        HeadRotations[i * 4 + 3] = Number(row.head_rot_w);

                        leftHandRotations[i * 4 + 0] = Number(row.left_hand_rot_x);
                        leftHandRotations[i * 4 + 1] = Number(row.left_hand_rot_y);
                        leftHandRotations[i * 4 + 2] = Number(row.left_hand_rot_z);
                        leftHandRotations[i * 4 + 3] = Number(row.left_hand_rot_w);

                        rightHandRotations[i * 4 + 0] = Number(row.right_hand_rot_x);
                        rightHandRotations[i * 4 + 1] = Number(row.right_hand_rot_y);
                        rightHandRotations[i * 4 + 2] = Number(row.right_hand_rot_z);
                        rightHandRotations[i * 4 + 3] = Number(row.right_hand_rot_w);
                    }

                    const HeadPositionKFT = new THREE.VectorKeyframeTrack(".position", times, HeadPositions)
                    const leftHandPositionKFT = new THREE.VectorKeyframeTrack(".position", times, leftHandPositions)
                    const rightHandPositionKFT = new THREE.VectorKeyframeTrack(".position", times, rightHandPositions)

                    const HeadRotationKFT = new THREE.QuaternionKeyframeTrack(".quaternion", times, HeadRotations)
                    const leftHandRotationKFT = new THREE.QuaternionKeyframeTrack(".quaternion", times, leftHandRotations)
                    const rightHandRotationKFT = new THREE.QuaternionKeyframeTrack(".quaternion", times, rightHandRotations)

                    const animateHead = new THREE.AnimationClip('AnimateHMD', -1, [HeadPositionKFT, HeadRotationKFT])
                    this.actions["HMD"] = this.mixers["HMD"].clipAction(animateHead);
                    this.actions["HMDIndicator"] = this.mixers["HMDIndicator"].clipAction(animateHead);

                    const animateLeftHand = new THREE.AnimationClip('AnimateLeftController', -1, [leftHandPositionKFT, leftHandRotationKFT])
                    this.actions["leftController"] = this.mixers["leftController"].clipAction(animateLeftHand);
                    this.actions["leftControllerIndicator"] = this.mixers["leftControllerIndicator"].clipAction(animateLeftHand);

                    const animateRightHand = new THREE.AnimationClip('AnimateRightController', -1, [rightHandPositionKFT, rightHandRotationKFT])
                    this.actions["rightController"] = this.mixers["rightController"].clipAction(animateRightHand);
                    this.actions["rightControllerIndicator"] = this.mixers["rightControllerIndicator"].clipAction(animateRightHand);

                    this.state["currentSessionDuration"] = animateHead.duration;

                    this.onSetupFinished();
                },
                error: (error: any) => {
                    console.error('Error parsing CSV:', error.message);
                }
            });
        } catch (error) {
            console.error('Error fetching and parsing CSV:', error);
        }
    }

    onSetupFinished() {
        this.activateAllActions();
        this.animate();
    }

    isEverythingLoadedAndReady() {
        // console.log(this.mixers)
        return "HMD" in this.mixers;
    }

    progress() {
        // console.log(this.actions)
        return this.actions["HMD"].time / this.state["currentSessionDuration"];
    }

    getCurrentTimestamp() {
        // console.log(this.actions)
        return this.actions["HMD"].time * 1000;
    }

    pauseContinue() {
        this.state["singleStepMode"] = false;

        if (this.state["run"]) {
            this.pauseAllActions();
        } else {
            this.unPauseAllActions();
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        let delta;

        if (this.state["singleStepMode"]) {
            delta = this.state["sizeOfNextStep"];
            this.state["sizeOfNextStep"] = 0;

        } else {
            delta = this.clock.getDelta();
        }

        if ("HMD" in this.actions) {
            this.state["playbackPosition"] = this.actions["HMD"].time;
        }

        for (const [_, mixer] of Object.entries(this.mixers)) {
            mixer.update(delta)
        }

        if (this.cameraControls.autoRotate) {
            this.cameraControls.update();
        }

        this.reactor.dispatchEvent("step")
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    activateAllActions() {
        this.state["run"] = true;
        for (const action of Object.values(this.actions)) {
            action.play();
        }
    }

    // allObjectsLoaded()
    //     :
    //     boolean {
    //     const requiredSubstrings = ['HMD', 'leftController', 'rightController'];
    //     const keys = Object.keys(this.meshes);
    //
    //     return requiredSubstrings.every(substring =>
    //         keys.some(key => key.includes(substring))
    //     );
    // }

    allObjectsLoaded() {
        return "HMD" in this.meshes && "leftController" in this.meshes && "rightController" in this.meshes
    }

    pauseAllActions() {
        this.state["run"] = false;
        for (const action of Object.values(this.actions)) {
            action.paused = true;
        }
    }

    unPauseAllActions() {
        this.state["run"] = true;
        for (const action of Object.values(this.actions)) {
            action.paused = false;
        }
    }

    sweep(position: any) {
        const animationTime = this.state["currentSessionDuration"] * position;

        const wasPaused = !this.state["run"];
        this.unPauseAllActions();

        for (const mixer of Object.values(this.mixers)) {
            console.log(animationTime)
            mixer.setTime(animationTime);
        }

        if (wasPaused) {
            this.pauseAllActions();
        }

        this.reactor.dispatchEvent("sweep");
    }

    setupScene() {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
        this.scene.fog = new THREE.Fog(this.scene.background, 1, 5000);

        // LIGHT
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(1, 1, 0.95);
        dirLight.position.set(-20, 60, -20);
        dirLight.target.position.set(0, 0, 0);
        this.scene.add(dirLight);

        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.left = -50;
        dirLight.shadow.camera.right = 50;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -50;
        dirLight.shadow.camera.far = 100;
        dirLight.shadow.bias = -0.0001;

        // GROUND
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa, side: THREE.DoubleSide});
        groundMat.opacity = 0.4;
        groundMat.transparent = true;
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = 0;
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const grid = new THREE.GridHelper(100, 25)
        grid.position.y = 0.1; // Lower it just a bit
        this.scene.add(grid);

        this.addAxeArrows();

        // SKY DOME
        const sky = new Sky();
        sky.scale.setScalar(450000);
        this.scene.add(sky);

        const sun = new THREE.Vector3();

        /// GUI
        const skySettings = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 30,
            azimuth: 180,
            exposure: this.renderer.toneMappingExposure
        };

        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = skySettings.turbidity;
        uniforms['rayleigh'].value = skySettings.rayleigh;
        uniforms['mieCoefficient'].value = skySettings.mieCoefficient;
        uniforms['mieDirectionalG'].value = skySettings.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - skySettings.elevation);
        const theta = THREE.MathUtils.degToRad(skySettings.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        uniforms['sunPosition'].value.copy(sun);

        this.renderer.toneMappingExposure = skySettings.exposure;
    }

    addAxeArrows() {
        const dirX = new THREE.Vector3(-1, 0, 0);
        const dirY = new THREE.Vector3(0, 1, 0);
        const dirZ = new THREE.Vector3(0, 0, -1);

        const origin = new THREE.Vector3(1, 0, 1);
        const length = 3;
        const radius_cylinder = 0.02;
        const headLength = 0.1 * length;
        const headWidth = 0.05 * length;

        const addAxis = (direction: THREE.Vector3, color: number) => {
            const cylinderLength = length - headLength;

            // Cylinder for the shaft of the arrow
            const cylinderGeometry = new THREE.CylinderGeometry(radius_cylinder, radius_cylinder, cylinderLength, 64);
            const cylinderMaterial = new THREE.MeshBasicMaterial({color: color});
            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

            // Positioning and orienting the cylinder
            cylinder.position.copy(origin.clone().add(direction.clone().normalize().multiplyScalar(cylinderLength / 2)));
            cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

            // Arrowhead
            const arrowHelper = new THREE.ArrowHelper(direction, origin, length, color, headLength, headWidth);

            this.scene.add(cylinder);
            this.scene.add(arrowHelper);
        };

        addAxis(dirX, 0xff0000); // Red for X-axis
        addAxis(dirY, 0x00d400); // Green for Y-axis
        addAxis(dirZ, 0x0000ff); // Blue for Z-axis
    }


    onWindowResize() {
        const rect = this.canvasContainer.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height);
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.cameraControls.update()
    }
}
