var vrDisplay, vrControls, arView;
var canvas, camera, scene, renderer;
var boxesAdded = false;
var vrFrameData; //NEW

/**
 * Use the `getARDisplay()` utility to leverage the WebVR API
 * to see if there are any AR-capable WebVR VRDisplays. Returns
 * a valid display if found. Otherwise, display the unsupported
 * browser message.
 */
THREE.ARUtils.getARDisplay().then(function(display) {
    if (display) {
        vrFrameData = new VRFrameData(); //NEW
        vrDisplay = display;
        init();
    } else {
        THREE.ARUtils.displayUnsupportedMessage();
    }
});

function init() {
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    canvas = renderer.domElement;
    document.body.appendChild(canvas);
    scene = new THREE.Scene();

    var arDebug = new THREE.ARDebug(vrDisplay);
    document.body.appendChild(arDebug.getElement());

    arView = new THREE.ARView(vrDisplay, renderer);

    camera = new THREE.ARPerspectiveCamera(
        vrDisplay,
        60,
        window.innerWidth / window.innerHeight,
        vrDisplay.depthNear,
        vrDisplay.depthFar
    );


    vrControls = new THREE.VRControls(camera);

    window.addEventListener('resize', onWindowResize, false);

    // NEW onClick function
    window.addEventListener('touchstart', onClick, false);

    update();
}

/**
 * The render loop, called once per frame. Handles updating
 * our scene and rendering.
 */
function update() {
    renderer.clearColor();

    arView.render();

    camera.updateProjectionMatrix();

    // NEW
    // From the WebVR API, populate `vrFrameData` with
    // updated information for the frame
    vrDisplay.getFrameData(vrFrameData);

    vrControls.update();

    if (!boxesAdded && !camera.position.y) {
        var ori = new THREE.Quaternion(0, 0, 0, 0);
        var pos = new THREE.Vector3(0, 0, -1.5);

        addBox(pos, ori);
    }

    renderer.clearDepth();
    renderer.render(scene, camera);

    vrDisplay.requestAnimationFrame(update);
}

/**
 * On window resize, update the perspective camera's aspect ratio,
 * and call `updateProjectionMatrix` so that we can get the latest
 * projection matrix provided from the device
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Once we have position information applied to our camera,
 * create some boxes at the same height as the camera
 */
function addBox(position, orientation) {
    // console.log(position);
    var BOX_SIZE = 0.25;

    var geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    var material = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh(geometry, material);

    cube.position.set(position.x, position.y, position.z);
    cube.quaternion.copy(orientation);

    scene.add(cube);

    boxesAdded = true;
}

/**
 * When clicking on the screen, create a cube at the user's
 * current position.
 */
function onClick() { //NEW
    // Fetch the pose data from the current frame
    var pose = vrFrameData.pose;
    // Convert the pose orientation and position into
    // THREE.Quaternion and THREE.Vector3 respectively

    // This is the current position of the camera
    var ori = new THREE.Quaternion(
        pose.orientation[0],
        pose.orientation[1],
        pose.orientation[2],
        pose.orientation[3]
    );
    var pos = new THREE.Vector3(
        pose.position[0],
        pose.position[1],
        pose.position[2]
    );

    var dirMtx = new THREE.Matrix4();
    dirMtx.makeRotationFromQuaternion(ori);

    var push = new THREE.Vector3(0, 0, -1);
    push.transformDirection(dirMtx);

    // push the box a little out in space. Change 1 to 0 to spawn at camera
    pos.addScaledVector(push, 1);

    addBox(pos, ori);
}