import AudioHoleFragmentShader from "./Shaders/AudioHoleFragmentShader.glsl"
import AudioHoleVertexShader from "./Shaders/AudioHoleVertexShader.glsl"

import CodepenThreeAudio from "./CodepenThreeAudio.js";
import * as THREE from 'three'
import * as lil from 'lil-gui'


class AudioHole extends CodepenThreeAudio {
    // lil.gui data
    spiralOptions = {
        spiralAudioStrength              : 0.2,
        spiralAudioZoom                  : 2.0,
        spiralAudioStrengthSin           : 1.0,
        spiralAudioZoomSin               : 1.0,
//        spiralRotateSpeed                : 0.5,
        spiralSpeed                      : 0.32,
        spiralFrequency                  : 0.5, // 0.1 are 10 lines, 0.01 are 100 lines
        spiralThickness                  : 0.2, 
        spiralSpeedSin                   : 0.95,
        spiralFrequencySin               : 1.0, // 0.1 are 10 lines, 0.01 are 100 lines
        spiralThicknessSin               : 0.05, 
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
       
        this.geometry = new THREE.CylinderGeometry( 0.01, 2, 16, 256, 1, true );
        this.geometry2D = new THREE.PlaneGeometry(3, 16);

//        console.log(this.experience.debugOptions.perlinSunColorFrequency);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture      : { value : this.bufferCanvasLinear.texture },
                uAudioStrength     : { value : this.spiralOptions.spiralAudioStrength },
                uAudioZoom         : { value : this.spiralOptions.spiralAudioZoom },
                uAudioStrengthSin  : { value : this.spiralOptions.spiralAudioStrengthSin },
                uAudioZoomSin      : { value : this.spiralOptions.spiralAudioZoomSin },
                uTime              : { value : 0 },
                uFrequency         : { value : this.spiralOptions.spiralFrequency },
                uSpeed             : { value : this.spiralOptions.spiralSpeed },
                uThickness         : { value : this.spiralOptions.spiralThickness },
                uFrequencySin      : { value : this.spiralOptions.spiralFrequencySin },
                uSpeedSin          : { value : this.spiralOptions.spiralSpeedSin },
                uThicknessSin      : { value : this.spiralOptions.spiralThicknessSin }
            },
            vertexShader    : AudioHoleVertexShader,
            fragmentShader  : AudioHoleFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
//            depthFunc       : THREE.AlwaysDepth,
//            depthWrite      : false,
//            blending        : THREE.AdditiveBlending

        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = Math.PI * 0.5;
        this.scene.add(this.mesh);

        this.mesh2D = new THREE.Mesh(this.geometry2D, this.material);
        this.mesh2D.rotation.z = Math.PI * 1.0;
        this.mesh2D.position.x = 10;
        //this.mesh2D.rotation.x = Math.PI * 0.5;
        this.scene.add(this.mesh2D);
        
        
        this.loading = false;
    }

    /*
    * Setup the lil.gui debug UI 
    */ 
    setupDebug() {
        this.ui = new lil.GUI();

        this.debugBars = this.ui.addFolder("Spiral Bars").open(true);
        // Spiral audio strength
        this.debugBars.add(this.spiralOptions, "spiralAudioStrength").min(0).max(10).step(0.01).name("Audio strength").onChange(() => {
            this.material.uniforms.uAudioStrength.value = this.spiralOptions.spiralAudioStrength;
        });            
        // Spiral audio zoom
        this.debugBars.add(this.spiralOptions, "spiralAudioZoom").min(1).max(8).step(0.01).name("Audio zoom").onChange(() => {
            this.material.uniforms.uAudioZoom.value = this.spiralOptions.spiralAudioZoom;
        });            
        // Spiral frequency
        this.debugBars.add(this.spiralOptions, "spiralFrequency").min(0.025).max(1).step(0.1).name("Frequency").onChange(() => {
            this.material.uniforms.uFrequency.value = this.spiralOptions.spiralFrequency;
        });            
        // Spiral speed
        this.debugBars.add(this.spiralOptions, "spiralSpeed").min(0.01).max(4).step(0.01).name("Speed").onChange(() => {
            this.material.uniforms.uSpeed.value = this.spiralOptions.spiralSpeed;
        });            
        // Spiral thickness
        this.debugBars.add(this.spiralOptions, "spiralThickness").min(0.01).max(0.75).step(0.01).name("Thickness").onChange(() => {
            this.material.uniforms.uThickness.value = this.spiralOptions.spiralThickness;
        });            
        this.debugOsciloscope = this.ui.addFolder("Spiral Osciloscope").open(true);
        // Spiral audio strength sin
        this.debugOsciloscope.add(this.spiralOptions, "spiralAudioStrengthSin").min(0).max(10).step(0.01).name("Audio strength Sin").onChange(() => {
            this.material.uniforms.uAudioStrengthSin.value = this.spiralOptions.spiralAudioStrengthSin;
        });            
        // Spiral audio zoom sin
        this.debugOsciloscope.add(this.spiralOptions, "spiralAudioZoomSin").min(1).max(8).step(0.01).name("Audio zoom Sin").onChange(() => {
            this.material.uniforms.uAudioZoomSin.value = this.spiralOptions.spiralAudioZoomSin;
        });            
        // Spiral frequency sin
        this.debugOsciloscope.add(this.spiralOptions, "spiralFrequencySin").min(0.025).max(1).step(0.1).name("Frequency Sin").onChange(() => {
            this.material.uniforms.uFrequencySin.value = this.spiralOptions.spiralFrequencySin;
        });            
        // Spiral speed sin
        this.debugOsciloscope.add(this.spiralOptions, "spiralSpeedSin").min(0.01).max(4).step(0.01).name("Speed Sin").onChange(() => {
            this.material.uniforms.uSpeedSin.value = this.spiralOptions.spiralSpeedSin;
        });            
        // Spiral thickness sin
        this.debugOsciloscope.add(this.spiralOptions, "spiralThicknessSin").min(0.01).max(0.75).step(0.01).name("Thickness Sin").onChange(() => {
            this.material.uniforms.uThicknessSin.value = this.spiralOptions.spiralThicknessSin;
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
        // Bloom Radius
/*        this.debugBloom.add(this.options, "bloomRadius").min(-20).max(20).step(0.01).name("Radius").onChange(() => {
            this.bloomPass.radius = this.options.bloomRadius;
        });
        // Bloom Strength
        this.debugBloom.add(this.options, "bloomStrength").min(0).max(1).step(0.01).name("Strength").onChange(() => {
            this.bloomPass.strength = this.options.bloomStrength;
        });     */
        
    }



    update(time, delta) {
        const advance = delta / 1000;
        // update time on perlin sun
        this.material.uniforms.uTime.value += advance;   

        // update cylinder rotation
        this.mesh.rotation.y += advance;

        // update time on perlin sun shadow
//        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;


        // make the perlin sun look at the camera
//        this.groupLookAt.lookAt(this.camera.position);

    }
}

const newExample = new AudioHole();