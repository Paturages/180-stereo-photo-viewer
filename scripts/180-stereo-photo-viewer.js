const STEREO_IMAGE_ID = 'stereoImage';
const LEFT_EYE_IMAGE_ID = 'leftEyeImage';
const RIGHT_EYE_IMAGE_ID = 'rightEyeImage';
const LEFT_EYE_HEMISPHERE_ID = 'leftEyeHemisphere';
const RIGHT_EYE_HEMISPHERE_ID = 'rightEyeHemisphere';

AFRAME.registerComponent('180-stereo-photo-viewer', {
    init: function () {
        this.el.sceneEl.addEventListener("renderstart", function () {
            this.camera.layers.enable(1);
        });
    }
});

AFRAME.registerComponent('stereo', {
    schema: {
        eye: {type: 'string'}
    },
    init: function () {
        let layer;
        switch (this.data.eye) {
            case 'left':
                layer = 1;
                break;
            case 'right':
                layer = 2;
                break;
            default:
                layer = 0;
        }
        let userAgent = navigator.userAgent;
        if (userAgent.includes('Edge')) {
            this.el.sceneEl.addEventListener('renderstart', () => {
                this.el.object3DMap.mesh.layers.set(layer);
            })
        } else {
            this.el.object3DMap.mesh.layers.set(layer);
        }
    }
});

AFRAME.registerComponent('file-picker', {
    init: function () {
        var tapCount = 0;
        let input = document.createElement('input');
        input.type = 'file';
        // input.accept = '.jpg, .jpeg, image/jpeg';
        document.body.appendChild(input);

        let stereoImage = document.getElementById(STEREO_IMAGE_ID);
        if (stereoImage.src === document.documentURI) {
            setVisibilityUsageText(true);
        }

        window.addEventListener('click', function () {
            if (tapCount === 0) {
                tapCount++;
                setTimeout(function () {
                    tapCount = 0;
                }, 350);
            } else {
                setVisibilityUsageText(false);
                input.click();
            }
        });

        const loadFile = file => {
            let timeout = 0;
            if (document.getElementById(STEREO_IMAGE_ID).src !== document.documentURI) {
                document.getElementById(LEFT_EYE_HEMISPHERE_ID).dispatchEvent(new Event('fadeOut'));
                document.getElementById(RIGHT_EYE_HEMISPHERE_ID).dispatchEvent(new Event('fadeOut'));
                timeout = 300;
            }
            setTimeout(() => {
                setVisibilityLoadingText(true);
                const stereoImage = document.getElementById(STEREO_IMAGE_ID);
                const hemisphereLeft = document.getElementById(LEFT_EYE_HEMISPHERE_ID);
                const hemisphereRight = document.getElementById(RIGHT_EYE_HEMISPHERE_ID);
                delete stereoImage.exifdata;
                delete stereoImage.xmpdata;
                delete stereoImage.extendedxmpdata;
                hemisphereLeft.object3D.rotation.x = 1;
                hemisphereRight.object3D.rotation.x = 1;
                hemisphereLeft.object3D.position.z = 0;
                hemisphereRight.object3D.position.z = 0;
                return loadImage(stereoImage, URL.createObjectURL(file))
                    .then(stereoImage => {
                        load180StereoImage(stereoImage);
                    })
            }, timeout);
        }
        window.addEventListener('change', () => {
            let input = document.querySelector("input");
            return loadFile(input.files[0]);
        });
        window.addEventListener('dragover', $event => {
            $event.preventDefault();
        });
        window.addEventListener('drop', $event => {
            $event.preventDefault();
            setVisibilityUsageText(false);
            if (!$event.dataTransfer.items || !$event.dataTransfer.items.length) return;
            loadFile($event.dataTransfer.items[0].getAsFile());
        });
    }
});

AFRAME.registerComponent('recenter',  {
    init: function() {
        let cameraParent = this.el;
        cameraParent.addEventListener('recenter', function () {
            const camera = cameraParent.querySelector("a-camera");
            const rotation = camera.getAttribute("rotation");
            cameraParent.setAttribute("rotation", { y: -rotation.y });
        });

        function recenter() {
            cameraParent.emit('recenter');
        }

        // for PC
        window.addEventListener('keydown', function (event) {
            if (event.key === ' ') {
                recenter();
            } else if (event.key === 'ArrowDown') {
                const hemisphereLeft = document.getElementById(LEFT_EYE_HEMISPHERE_ID);
                const hemisphereRight = document.getElementById(RIGHT_EYE_HEMISPHERE_ID);
                hemisphereLeft.object3D.rotation.x -= 0.05;
                hemisphereRight.object3D.rotation.x -= 0.05;
            } else if (event.key === 'ArrowUp') {
                const hemisphereLeft = document.getElementById(LEFT_EYE_HEMISPHERE_ID);
                const hemisphereRight = document.getElementById(RIGHT_EYE_HEMISPHERE_ID);
                hemisphereLeft.object3D.rotation.x += 0.05;
                hemisphereRight.object3D.rotation.x += 0.05;
            }
        });

        window.addEventListener('wheel', event => {
            const hemisphereLeft = document.getElementById(LEFT_EYE_HEMISPHERE_ID);
            const hemisphereRight = document.getElementById(RIGHT_EYE_HEMISPHERE_ID);
            if (event.deltaY > 0) {
                hemisphereLeft.object3D.position.z -= 5;
                hemisphereRight.object3D.position.z -= 5;
            } else {
                hemisphereLeft.object3D.position.z += 5;
                hemisphereRight.object3D.position.z += 5;
            }
        });

        // for Mobile
        let longTapTimer;

        window.addEventListener('touchstart', function () {
            longTapTimer = setTimeout(function () {
                recenter();
            }, 1000);
        });

        window.addEventListener('touchend', function () {
            clearTimeout(longTapTimer);
        })
    }
});

window.onload = () => {
    generateBothEyeImages();
    generateBothEyeHemispheres();

    let stereoImage = document.getElementById(STEREO_IMAGE_ID);
    if (stereoImage.src === document.documentURI) {
        setVisibilityLoadingText(false);
        return;
    }

    load180StereoImage(stereoImage);
};

function generateBothEyeImages() {
    let assets = document.querySelector('a-assets');
    let leftEyeImage = document.createElement('img');
    leftEyeImage.id = LEFT_EYE_IMAGE_ID;
    assets.appendChild(leftEyeImage);
    let rightEyeImage = document.createElement('img');
    rightEyeImage.id = RIGHT_EYE_IMAGE_ID;
    assets.appendChild(rightEyeImage);
}

function generateBothEyeHemispheres() {
    let scene = document.querySelector('a-scene');
    for (let i = 0; i < 2; i++) {
        let hemisphere = document.createElement('a-entity');
        hemisphere.setAttribute('geometry', 'primitive: sphere; radius:100; segmentsWidth: 64; segmentsHeight:64; phi-start: 180; phi-length: 180');
        hemisphere.setAttribute('material', 'shader: flat; color: black; side: back; npot: true');
        hemisphere.setAttribute('scale', '-1 1 1');
        hemisphere.setAttribute('animation__fade-out', 'property: components.material.material.color; type: color; from: #FFF; to: #000; dur: 300; startEvents: fadeOut');
        hemisphere.setAttribute('animation__fade-in', 'property: components.material.material.color; type: color; from: #000; to: #FFF; dur: 300; startEvents: fadeIn');

        if (i === 0) {
            hemisphere.id = LEFT_EYE_HEMISPHERE_ID;
            AFRAME.utils.entity.setComponentProperty(hemisphere, 'stereo', 'eye: left');
        } else {
            hemisphere.id = RIGHT_EYE_HEMISPHERE_ID;
            AFRAME.utils.entity.setComponentProperty(hemisphere, 'stereo', 'eye: right');
        }

        scene.appendChild(hemisphere);
    }
}

function readAsDataURLFromFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = event => {
            resolve(event.target.result);
        };
        reader.onerror = error => {
            reject(new Error(error));
        };
        reader.readAsDataURL(file);
    });
}

function getExifData(image) {
    return new Promise((resolve => {
        EXIF.enableXmp();
        EXIF.getData(image, () => {
            resolve(image);
        });
    }))
}

function loadImage(image, url) {
    return new Promise((resolve, reject) => {
        image.onload = () => {
            resolve(image);
        };
        image.onerror = error => {
            reject(new Error(error));
        };
        image.src = url;
    });
}

function load180StereoImage(stereoImage) {
    let leftEyeImage = document.getElementById(LEFT_EYE_IMAGE_ID);
    let rightEyeImage = document.getElementById(RIGHT_EYE_IMAGE_ID);
    loadSBS180Image(stereoImage, leftEyeImage, rightEyeImage);
    applyZenithCorrection(stereoImage);
    // getExifData(stereoImage).then((stereoImage) => {
    //   let leftEyeImage = document.getElementById(LEFT_EYE_IMAGE_ID);
    //   let rightEyeImage = document.getElementById(RIGHT_EYE_IMAGE_ID);

    //   if ("extendedxmpdata" in stereoImage) {
    //     loadVR180Image(stereoImage, rightEyeImage);
    //   } else {
    //     loadSBS180Image(stereoImage, leftEyeImage, rightEyeImage);
    //   }

    //   applyZenithCorrection(stereoImage);
    // });
}

function loadVR180Image(leftEyeImage, rightEyeImage) {
    let gImageData = leftEyeImage.extendedxmpdata['x:xmpmeta']['rdf:RDF']['rdf:Description']['@attributes']['GImage:Data'];
    loadImage(rightEyeImage, 'data:image/jpeg;base64,' + gImageData)
        .then(rightEyeImage => updateBothEyeTextures([leftEyeImage, rightEyeImage]));
}

function loadSBS180Image(stereoImage, leftEyeImage, rightEyeImage) {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    canvas.width = stereoImage.width / 2;
    canvas.height = stereoImage.height;

    context.drawImage(stereoImage, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    context.drawImage(stereoImage, canvas.width, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        Promise.all([loadImage(leftEyeImage, url), loadImage(rightEyeImage, url)])
            .then(images => updateBothEyeTextures(images));
    }, 'image/png');
}

function updateBothEyeTextures(images) {
    for (let i = 0; i < 2; i++) {
        let entity = document.getElementById(i === 0 ? LEFT_EYE_HEMISPHERE_ID : RIGHT_EYE_HEMISPHERE_ID);
        entity.setAttribute('material', 'src: ; color: ');
        entity.setAttribute('material', `src: #${images[i].id}`);
        entity.dispatchEvent(new Event('fadeIn'));
    }

    setVisibilityLoadingText(false);
}

function applyZenithCorrection(image) {
    let leftEyeHemisphere = document.getElementById(LEFT_EYE_HEMISPHERE_ID);
    let rightEyeHemisphere = document.getElementById(RIGHT_EYE_HEMISPHERE_ID);

    if ('xmpdata' in image) {
        let poseRollDegrees = getPropertyValue(['x:xmpmeta', 'rdf:RDF', 'rdf:Description', '@attributes', 'GPano:PoseRollDegrees'], image.xmpdata);
        if (poseRollDegrees === null) {
            poseRollDegrees = '0';
        }
        let posePitchDegrees = getPropertyValue(['x:xmpmeta', 'rdf:RDF', 'rdf:Description', '@attributes', 'GPano:PosePitchDegrees'], image.xmpdata);
        if (posePitchDegrees === null) {
            posePitchDegrees = '0';
        }
        leftEyeHemisphere.setAttribute('rotation', `${posePitchDegrees} 0 ${-poseRollDegrees}`);
        rightEyeHemisphere.setAttribute('rotation', `${posePitchDegrees} 0 ${-poseRollDegrees}`);
    } else {
        leftEyeHemisphere.setAttribute('rotation', '0 0 0');
        rightEyeHemisphere.setAttribute('rotation', '0 0 0');
    }
}

function setVisibilityUsageText(visible) {
    let usageText = document.getElementById('usageText');
    if (usageText) {
        usageText.setAttribute('visible', visible);
    }
}

function setVisibilityLoadingText(visible) {
    let loadingText = document.getElementById('loadingText');
    let position = document.querySelector('a-camera').getAttribute('position');
    loadingText.setAttribute('position', `0 ${position.y} ${position.z - 1.0}`);
    if (loadingText) {
        loadingText.setAttribute('visible', visible);
    }
}

const getPropertyValue = (p, o) =>
    p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);
