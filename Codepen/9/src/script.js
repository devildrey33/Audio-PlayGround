import AudioHoleFragmentShader from "./Shaders/AudioHoleFragmentShader.glsl"
import AudioHoleVertexShader from "./Shaders/AudioHoleVertexShader.glsl"
import StarsFragmentShader from "./Shaders/StarsFragmentShader.glsl"
import StarsVertexShader from "./Shaders/StarsVertexShader.glsl"

import CodepenThreeAudio from "./CodepenThreeAudio.js";
import * as THREE from 'three'
import * as lil from 'lil-gui'


class AudioHole extends CodepenThreeAudio {
    // lil.gui data
    debugOptions = {
        spiralAudioStrength              : 0.4,
        spiralAudioZoom                  : 2.0,
        spiralAudioStrengthSin           : 1.0,
        spiralAudioZoomSin               : 1.0,
//        spiralRotateSpeed                : 0.5,
        spiralSpeed                      : 0.12,
        spiralFrequency                  : 0.1,   // 0.1 are 10 lines, 0.01 are 100 lines
        spiralThickness                  : 0.1, 
        spiralSpeedSin                   : 0.75,
        spiralFrequencySin               : 0.5,   // 0.1 are 10 lines, 0.01 are 100 lines
        spiralThicknessSin               : 0.01,  // not in debug, controled by update
    }
    
    // Main
    constructor() {
        // Call CodepenThreeAudio constructor
        super();

        // Setup the scene 
        this.setupScene();

        // Setup lil.gui values
        this.setupDebug();
    }

    /*
     * Setup world objects
     */ 
    setupScene() {                
        // Make a cone geometry
        this.geometry = new THREE.CylinderGeometry( 0.01, 2, 64, 256, 1, true );
        // Shader material for the cone
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture      : { value : this.bufferCanvasLinear.texture },
                uAudioStrength     : { value : this.debugOptions.spiralAudioStrength },
                uAudioZoom         : { value : this.debugOptions.spiralAudioZoom },
                uAudioStrengthSin  : { value : this.debugOptions.spiralAudioStrengthSin },
                uAudioZoomSin      : { value : this.debugOptions.spiralAudioZoomSin },
                uTime              : { value : 0 },
                uFrequency         : { value : this.debugOptions.spiralFrequency },
                uSpeed             : { value : this.debugOptions.spiralSpeed },
                uThickness         : { value : this.debugOptions.spiralThickness },
                uFrequencySin      : { value : this.debugOptions.spiralFrequencySin },
                uSpeedSin          : { value : this.debugOptions.spiralSpeedSin },
                uThicknessSin      : { value : this.debugOptions.spiralThicknessSin }
            },
            vertexShader    : AudioHoleVertexShader,
            fragmentShader  : AudioHoleFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,

        });
        // Create the cone
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Rotate the cone to put the camera inside him
        this.mesh.rotation.x = Math.PI * 0.5;
        // Put the cone back 
        this.mesh.position.z = 22;
        this.scene.add(this.mesh);

        // Test 2D plane
/*        this.geometry2D = new THREE.PlaneGeometry(3, 16);
        this.mesh2D = new THREE.Mesh(this.geometry2D, this.material);
        this.mesh2D.rotation.z = Math.PI * 1.0;
        this.mesh2D.position.x = 10;
        this.scene.add(this.mesh2D);*/
        
        // Create particles for the stars
        const count = 300;
        this.starsGeometry       = new THREE.BufferGeometry();
        this.starsPositionArray  = new Float32Array(count * 3);
        this.starsRadiusArray    = new Float32Array(count);
        this.starsAngleArray     = new Float32Array(count);
        this.starsSpeedArray     = new Float32Array(count);

        // Fill the attributes
        for (let i = 0; i < count; i++) {
            const radius = 5 + Math.random() * 4.0;
            const angle  = Math.random() * Math.PI * 2.0;

            this.starsRadiusArray[i] = radius;
            this.starsAngleArray[i] = angle;

            this.starsSpeedArray[i]  = 5 + Math.random() * 25.0;

            this.starsPositionArray[i * 3 + 0] = 0;
            this.starsPositionArray[i * 3 + 1] = 0;
            this.starsPositionArray[i * 3 + 2] = 0;

        }

        this.starsGeometry.setAttribute('position', new THREE.BufferAttribute(this.starsPositionArray, 3));
        this.starsGeometry.setAttribute('aRadius', new THREE.BufferAttribute(this.starsRadiusArray, 1));
        this.starsGeometry.setAttribute('aAngle', new THREE.BufferAttribute(this.starsAngleArray, 1));
        this.starsGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(this.starsSpeedArray, 1));


        this.starsMaterial = new THREE.ShaderMaterial({
            transparent     : true,
            blending        : THREE.AdditiveBlending,   // Fusionate colors with the scene
            depthWrite      : false,                    // deactivate depthWrite to show objects behind
            uniforms        : {
                uTime           : { value : 0 },
                uPixelRatio     : { value : Math.min(window.devicePixelRatio, 2) },
                uSize           : { value : 200.0 },
                uAudioStrength  : { value : 0.1 }
/*                uColor          : { value : new THREE.Color("#ffffff") },*/
            },
            vertexShader    : StarsVertexShader,
            fragmentShader  : StarsFragmentShader
        });
        
        // Points
        this.stars = new THREE.Points(this.starsGeometry, this.starsMaterial);
        this.scene.add(this.stars);        

        this.loading = false;
    }

    /*
    * Setup the lil.gui debug UI 
    */ 
    setupDebug() {
        this.ui = new lil.GUI();
        this.ui.open(false);

        this.debugBars = this.ui.addFolder("Spiral Bars").open(true);
        // Spiral audio strength
        this.debugBars.add(this.debugOptions, "spiralAudioStrength").min(0).max(10).step(0.01).name("Audio strength").onChange(() => {
            this.material.uniforms.uAudioStrength.value = this.debugOptions.spiralAudioStrength;
        });            
        // Spiral audio zoom
        this.debugBars.add(this.debugOptions, "spiralAudioZoom").min(1).max(8).step(0.01).name("Audio zoom").onChange(() => {
            this.material.uniforms.uAudioZoom.value = this.debugOptions.spiralAudioZoom;
        });            
        // Spiral frequency
        this.debugBars.add(this.debugOptions, "spiralFrequency").min(0.025).max(1).step(0.1).name("Frequency").onChange(() => {
            this.material.uniforms.uFrequency.value = this.debugOptions.spiralFrequency;
        });            
        // Spiral speed
        this.debugBars.add(this.debugOptions, "spiralSpeed").min(0.01).max(1).step(0.01).name("Speed").onChange(() => {
            this.material.uniforms.uSpeed.value = this.debugOptions.spiralSpeed;
        });            
        // Spiral thickness
        this.debugBars.add(this.debugOptions, "spiralThickness").min(0.01).max(0.75).step(0.01).name("Thickness").onChange(() => {
            this.material.uniforms.uThickness.value = this.debugOptions.spiralThickness;
        });            
        this.debugOsciloscope = this.ui.addFolder("Spiral Osciloscope").open(true);
        // Spiral audio strength sin
        this.debugOsciloscope.add(this.debugOptions, "spiralAudioStrengthSin").min(0).max(10).step(0.01).name("Audio strength Sin").onChange(() => {
            this.material.uniforms.uAudioStrengthSin.value = this.debugOptions.spiralAudioStrengthSin;
        });            
        // Spiral audio zoom sin
        this.debugOsciloscope.add(this.debugOptions, "spiralAudioZoomSin").min(1).max(8).step(0.01).name("Audio zoom Sin").onChange(() => {
            this.material.uniforms.uAudioZoomSin.value = this.debugOptions.spiralAudioZoomSin;
        });            
        // Spiral frequency sin
        this.debugOsciloscope.add(this.debugOptions, "spiralFrequencySin").min(0.025).max(1).step(0.1).name("Frequency Sin").onChange(() => {
            this.material.uniforms.uFrequencySin.value = this.debugOptions.spiralFrequencySin;
        });            
        // Spiral speed sin
        this.debugOsciloscope.add(this.debugOptions, "spiralSpeedSin").min(0.01).max(2).step(0.01).name("Speed Sin").onChange(() => {
            this.material.uniforms.uSpeedSin.value = this.debugOptions.spiralSpeedSin;
        });         

        /*
         * Bloom PostProcessing
         */
        this.debugBloom = this.ui.addFolder("Postprocessing").open(true);
        // Enable / disable color Correction
        this.debugBloom.add(this.options, "colorCorrectionEnabled").name("Color correction enabled").onChange(() => {
            this.colorCorrectionPass.enabled = this.options.colorCorrectionEnabled;
        });
        // Enable / disable bloom
        this.debugBloom.add(this.options, "bloomEnabled").name("Bloom enabled").onChange(() => {
            this.bloomPass.enabled = this.options.bloomEnabled;
        });
        // Bloom Threshold
        this.debugBloom.add(this.options, "bloomThreshold").min(-20).max(20).step(0.01).name("Bloom Threshold").onChange(() => {
            this.bloomPass.threshold = this.options.bloomThreshold;
        });
        
    }



    update(time, delta) {
        const advance = delta / 1000;
        // update time on perlin sun
        this.material.uniforms.uTime.value += advance;   

        // update cylinder rotation
        this.mesh.rotation.y += advance;

        if (this.songLoaded === true) {
            // get average frequency
            this.averageFrequency = this.getAverageFrequency();
            // Modify bloom strenght using low sound average frequency (bass) 
            this.bloomPass.strength = (this.averageFrequency[2] / 255);
            // Set bloom radius using a sine wave and time to go from -1.5 to 3.5
            this.bloomPass.radius = -1.5 + (Math.sin(time / 10000) * 5.5);
            // Set osciloscope line thickness applying the low sound average frequency
            this.material.uniforms.uThicknessSin.value = 0.01 + ((this.averageFrequency[2] / 255) * 0.05);

//            this.starsMaterial.uniforms.uAudioStrength.value = 0.5 + ((this.averageFrequency[2]  * 0.025));
        }

        // Update time for stars
        this.starsMaterial.uniforms.uTime.value += advance;

    }
}

const newExample = new AudioHole();