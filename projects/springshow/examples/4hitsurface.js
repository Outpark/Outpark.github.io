var vrDisplay, vrControls, arView;
var canvas, camera, scene, renderer;
var boxesAdded = false;
var vrFrameData;

/**
 * Use the `getARDisplay()` utility to leverage the WebVR API
 * to see if there are any AR-capable WebVR VRDisplays. Returns
 * a valid display if found. Otherwise, display the unsupported
 * browser message.
 */
THREE.ARUtils.getARDisplay().then(function(display) {
    if (display) {
        vrFrameData = new VRFrameData();
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

    // NEW: change the debug options!
    var arDebug = new THREE.ARDebug(vrDisplay, scene, {
        showLastHit: true, 
        showPoseStatus: true,
        showPlanes: true,
    });
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

    vrDisplay.getFrameData(vrFrameData);

    vrControls.update();

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

var BOX_SIZE = 0.1;

/**
 * Return a cube object
 */
function createCube() { // NEW
    var geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    var material = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh(geometry, material);

    // Sometimes folks like to initialize their objects to be very far away
    // cube.position.set(10000, 10000, 10000);

    scene.add(cube);

    return cube;
}

/**
 * When clicking on the screen, fire a ray from where the user clicked
 * on the screen and if a hit is found, place a cube there.
 */
function onClick(e) { // NEW
    // Inspect the event object and generate normalize screen coordinates
    // (between 0 and 1) for the screen position.
    var x = e.touches[0].pageX / window.innerWidth;
    var y = e.touches[0].pageY / window.innerHeight;

    // Send a ray from the point of click to the real world surface
    // and attempt to find a hit. `hitTest` returns an array of potential
    // hits.
    var hits = vrDisplay.hitTest(x, y);

    // If a hit is found, just use the first one
    if (hits && hits.length) {
        var hit = hits[0];
    
        // Create a cube object which has already been added to a scene
        var cube = createCube();

        console.log(hit);

        // Use the `placeObjectAtHit` utility to position
        // the cube where the hit occurred
        // cube - The object to place
        // hit - The VRHit object to move the cube to
        // 1 - Easing value from 0 to 1; we want to move the cube directly to the hit position
        // true -  Whether or not we also apply orientation
        THREE.ARUtils.placeObjectAtHit(cube, hit, 1, true);
    }
}