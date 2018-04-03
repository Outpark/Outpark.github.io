var vrDisplay, vrControls, arView;
var canvas, camera, scene, renderer;
var vrFrameData;

var model;
var OBJ_PATH = '../assets/model.obj';
var MTL_PATH = '../assets/model.mtl';
var SCALE = 0.1;

// NEW
var source; // We'll store a reference to our audio source
var audioElement; // We'll save a reference to our audio DOM element
var resonanceAudioScene;

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

    light = new THREE.AmbientLight();
    scene.add(light);

    THREE.ARUtils.loadModel({
        objPath: OBJ_PATH,
        mtlPath: MTL_PATH,
        OBJLoader: undefined, // uses window.THREE.OBJLoader by default
        MTLLoader: undefined, // uses window.THREE.MTLLoader by default
    }).then(function(group) {
        model = group;

        var SCALE = 0.3;
        model.scale.set(SCALE, SCALE, SCALE);
        model.position.set(10000, 10000, 10000);

        scene.add(model);
    });

    vrControls = new THREE.VRControls(camera);

    setupAudio();

    window.addEventListener('resize', onWindowResize, false);

    window.addEventListener('touchstart', onClick, false);

    update();
}

function setupAudio() {
    // NEW AUDIO
    // Step 1: Create an AudioContext
    var audioContext = new AudioContext();

    // Create a (first-order Ambisonic) Resonance Audio scene and pass it
    // the AudioContext.
    resonanceAudioScene = new ResonanceAudio(audioContext);
    // Connect the scene’s binaural output to stereo out.
    resonanceAudioScene.output.connect(audioContext.destination);

    // Step 2: Add a room
    // Resonance Audio room modelling helps you create realistic spatial audio reflections and reverberation for your scene.
    // Define room dimensions.
    // By default, room dimensions are undefined (0m x 0m x 0m).
    var roomDimensions = {
        width: 3.1,
        height: 2.5,
        depth: 3.4,
    };

    // Define materials for each of the room’s six surfaces.
    // Room materials have different acoustic reflectivity.
    var roomMaterials = {
        // Room wall materials
        left: 'brick-bare',
        right: 'curtain-heavy',
        front: 'marble',
        back: 'glass-thin',
        // Room floor
        down: 'grass',
        // Room ceiling
        up: 'transparent',
    };
    // Add the room definition to the scene.
    resonanceAudioScene.setRoomProperties(roomDimensions, roomMaterials);

    // Step 3: Load the audio element
    // Create an AudioElement.
    audioElement = document.createElement('audio');
    // Load an audio file into the AudioElement.

    audioElement.src = '../assets/santigold.wav';
    // Generate a MediaElementSource from the AudioElement.

    var audioElementSource = audioContext.createMediaElementSource(audioElement);
    // Add the MediaElementSource to the scene as an audio input source.

    // Configure source options
    // More info here: https://developers.google.com/resonance-audio/reference/web/Source#~SourceOptions
    var SOURCE_OPTIONS = {
        minDistance: 0.1,
        maxDistance: 1,
        rolloff: 'logarithmic'
        // alpha: 0,
        // sharpness: 1,
        // sourceWidth: 0,
        // gain: 5
    };

    // You could also not have source options
    // source = resonanceAudioScene.createSource();
    source = resonanceAudioScene.createSource(SOURCE_OPTIONS);
    audioElementSource.connect(source.input);

    console.log("Done setting up audio");
    console.log(source);
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

    // NEW
    // Update the position of the resonance audio object given the camera's position
    var pose = vrFrameData.pose;
    var pos = new THREE.Vector3(
        pose.position[0],
        pose.position[1],
        pose.position[2]
    );
    resonanceAudioScene.setListenerPosition(pos.x, pos.y, pos.z);
    // Can you figure out how to setListenerOrientation??
    // https://developers.google.com/resonance-audio/reference/web/ResonanceAudio#setListenerOrientation

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
function onClick(e) {
    var x = e.touches[0].pageX / window.innerWidth;
    var y = e.touches[0].pageY / window.innerHeight;

    var hits = vrDisplay.hitTest(x, y);

    if (hits && hits.length) {
        var hit = hits[0];

        THREE.ARUtils.placeObjectAtHit(model, hit, 1, true);

        var angle = Math.atan2(
            camera.position.x - model.position.x,
            camera.position.z - model.position.z
        );
        model.rotation.set(0, angle, 0);

        var axis = new THREE.Vector3(0.0, 1, 0);
        model.rotateOnAxis(axis, THREE.Math.degToRad(180));

        // NEW
        // Set the audio source to the position where the model is
        source.setPosition(model.position.x, model.position.y, model.position.z);

        // Play the audio.
        audioElement.play();

    }
}