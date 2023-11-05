import * as THREE from 'three';
import {ParsedData, VRDeviceData, VRDeviceObject} from "./csv-handler";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

let currentTimestampIndex = 0;
let timestamps: string[] = [];
let parsedData: ParsedData = {};

export function initializeThreeJS(parsedDataInput: ParsedData) {
    const scene = new THREE.Scene();

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 10); // for example, position it at x=10, y=10, z=10
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // look at the origin, or any other point of interest

    // Adding renderer
    const canvasElement = document.getElementById('threeCanvas') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({canvas: canvasElement});
    renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);

    // Adding controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    // Store the parsed data and create a sorted list of timestamps
    parsedData = parsedDataInput;
    timestamps = Object.keys(parsedData).sort();

    addLight(scene)

    // Add grid
    const gridHelper = new THREE.GridHelper(50, 50);
    gridHelper.position.y = -0.1; // Lower it just a bit
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    addAxes(scene)

    // Transparent background
    renderer.setClearColor(0x000000, 0);

    // Initialize VR device objects and add them to the scene
    Object.values(parsedData).forEach(dataArray => {
        dataArray.forEach(data => {
            initializeVRDeviceObjects(scene, data);
        });
    });


    const animate = function () {
        requestAnimationFrame(animate);

        // // Update the VR devices based on the current timestamp
        // const currentData = parsedData[timestamps[currentTimestampIndex]];
        // currentData.forEach(deviceData => {
        //     updateVRDeviceObject(deviceData.hmd);
        //     updateVRDeviceObject(deviceData.leftController);
        //     updateVRDeviceObject(deviceData.rightController);
        // });
        //
        // // Update timestamp index for next frame
        // currentTimestampIndex = (currentTimestampIndex + 1) % timestamps.length;
        //
        // renderer.render(scene, camera);
        // Test: manually adjust position to see movement
        const testMesh = parsedData[timestamps[0]][0].hmd.mesh;
        if (testMesh) {
            testMesh.position.x += 0.01; // This should move the object slowly along the x-axis
        }

        controls.update();

        renderer.render(scene, camera);
    };

    animate();
}

function updateVRDeviceObject(deviceData: VRDeviceObject) {
    if (deviceData.mesh) {
        deviceData.mesh.position.copy(deviceData.position);
        deviceData.mesh.quaternion.copy(deviceData.rotation);
    }
}


export function initializeVRDeviceObjects(scene: THREE.Scene, data: VRDeviceData) {
    data.hmd.mesh = initializeVRDeviceObject(data.hmd, scene);
    data.leftController.mesh = initializeVRDeviceObject(data.leftController, scene);
    data.rightController.mesh = initializeVRDeviceObject(data.rightController, scene);
}

function initializeVRDeviceObject(deviceData: VRDeviceObject, scene: THREE.Scene): THREE.Mesh {
    // Create the mesh for the VR device
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const mesh = new THREE.Mesh(geometry, material);

    // Set the initial position and orientation
    mesh.position.copy(deviceData.position);
    mesh.quaternion.copy(deviceData.rotation);

    // Add the mesh to the scene
    scene.add(mesh);

    return mesh;
}

function addLight(scene: THREE.Scene) {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
}

function addAxes(scene: THREE.Scene) {
    const axesHelper = new THREE.AxesHelper(25);
    axesHelper.renderOrder = 1;
    scene.add(axesHelper);

    addAxeArrows(scene);
}

function addAxeArrows(scene: THREE.Scene) {
    const dirX = new THREE.Vector3(1, 0, 0);
    const dirY = new THREE.Vector3(0, 1, 0);
    const dirZ = new THREE.Vector3(0, 0, 1);

    const origin = new THREE.Vector3(0, 0, 0);
    const length = 10;
    const headLength = 0.1 * length;
    const headWidth = 0.05 * length;

    const arrowHelperX = new THREE.ArrowHelper(dirX, origin, length, 0xff0000, headLength, headWidth);
    const arrowHelperY = new THREE.ArrowHelper(dirY, origin, length, 0x00ff00, headLength, headWidth);
    const arrowHelperZ = new THREE.ArrowHelper(dirZ, origin, length, 0x0000ff, headLength, headWidth);

    scene.add(arrowHelperX);
    scene.add(arrowHelperY);
    scene.add(arrowHelperZ);
}

