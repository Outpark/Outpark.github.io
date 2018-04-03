var vrDisplay, vrControls, arView;
var canvas, camera, scene, renderer;
var vrFrameData;

// New
var model; // we'll store a reference to our model in this variable
var OBJ_PATH = '../assets/model.obj';
var MTL_PATH = '../assets/model.mtl';
var SCALE = 0.1;

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

    // NEW
    // The materials in Poly models will render as a black mesh
    // without lights in our scenes. Let's add an ambient light
    // so our model can be seen

    // An ambient light globally illuminates all objects in the scene equally.
    // BUT this light cannot be used to cast shadows as it does not have a direction. 
    // For shadows you have to use a directional light. 
    // Checkout this example for how to add shadows:
    // https://github.com/google-ar/three.ar.js/blob/master/examples/load-model.html

    light = new THREE.AmbientLight();
    scene.add(light);

    // NEW
    THREE.ARUtils.loadModel({
        objPath: OBJ_PATH,
        mtlPath: MTL_PATH,
        OBJLoader: undefined, // uses window.THREE.OBJLoader by default
        MTLLoader: undefined, // uses window.THREE.MTLLoader by default
    }).then(function(group) {
        model = group;

        var SCALE = 0.3;
        model.scale.set(SCALE, SCALE, SCALE);
        // Place the model very far to initialize
        model.position.set(10000, 10000, 10000);

        scene.add(model);
    });

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

        console.log(hit);

        // Use the `placeObjectAtHit` utility to position
        // the cube where the hit occurred
        // cube - The object to place
        // hit - // The VRHit object to move the cube to
        // 1 - Easing value from 0 to 1; we want to move the cube directly to the hit position
        // true -  Whether or not we also apply orientation
        THREE.ARUtils.placeObjectAtHit(model, hit, 1, true);

        // Rotate the model to be facing the user (pretty standard if you always want model to face user)
        var angle = Math.atan2(
            camera.position.x - model.position.x,
            camera.position.z - model.position.z
        );
        model.rotation.set(0, angle, 0);
    }
}