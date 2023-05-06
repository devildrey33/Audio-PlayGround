import OnionVertexShader from "./Shaders/OnionVertexShader.glsl"
import OnionFragmentShader from "./Shaders/OnionFragmentShader.glsl"
import DepthVertexShader from "./Shaders/DepthVertexShader.glsl"
import OnionDepthFragmentShader from "./Shaders/OnionDepthFragmentShader.glsl"

import CodepenThreeAudio from "./CodepenThreeAudio.js";
import * as THREE from 'three'
import * as lil from 'lil-gui'


class Onion extends CodepenThreeAudio {
    // lil.gui data
    onionOptions = {
        audioStrength : 0.3,
        audioZoom     : 1.6,
        lineSize      : 0.1,
        color         : "#c57eec",
        radius        : 0.25
    }
    
    // Main
    constructor() {
        // Call CodepenThreeAudio constructor
        super();

        // Setup the scene 
        this.setupScene();
        // Setup the debug ui
        this.setupDebug();
    }

    /*
     * Setup world objects
     */ 
    setupScene() {                
        this.geometry = new THREE.PlaneGeometry(6,6);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.onionOptions.audioStrength },
                uAudioZoom     : { value : this.onionOptions.audioZoom },
                uSize          : { value : this.onionOptions.lineSize },
                uRadius        : { value : this.onionOptions.radius },
                uColor         : { value : new THREE.Color(this.onionOptions.color)},
            },
            vertexShader    : OnionVertexShader,
            fragmentShader  : OnionFragmentShader,
            transparent     : true,
            side            : THREE.DoubleSide,
            depthWrite      : false
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.rotation.z = -Math.PI * 0.5;
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.onionOptions.audioStrength };
            shader.uniforms.uAudioZoom     = { value : this.onionOptions.audioZoom };
            shader.uniforms.uSize          = { value : this.onionOptions.lineSize };
            shader.uniforms.uRadius        = { value : this.onionOptions.radius };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = OnionDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.scene.add(this.mesh);

        this.loading = false;
    }

    /*
    * Setup the lil.gui debug UI 
    */ 
    setupDebug() {
        this.ui = new lil.GUI();
        // Color
        this.ui.addColor(this.onionOptions, "color").name("Color").onChange(() => {
            this.material.uniforms.uColor.value = new THREE.Color(this.onionOptions.color);
        });
        // Osciloscope audio strength
        this.ui.add(this.onionOptions, "audioStrength").min(0.1).max(1).step(0.01).name("Audio strength").onChange(() => {
            this.material.uniforms.uAudioStrength.value = this.onionOptions.audioStrength;
            this.mesh.customDepthMaterial.uniforms.uAudioStrength.value = this.onionOptions.audioStrength;
        });            
        // Osciloscope audio zoom
        this.ui.add(this.onionOptions, "audioZoom").min(1).max(16).step(0.1).name("Audio zoom").onChange(() => {
            this.material.uniforms.uAudioZoom.value = this.onionOptions.audioZoom;
            this.mesh.customDepthMaterial.uniforms.uAudioZoom.value = this.onionOptions.audioZoom;
        });            
        // Osciloscope line size
        this.ui.add(this.onionOptions, "lineSize").min(0.001).max(0.5).step(0.001).name("Line size").onChange(() => {
            this.material.uniforms.uSize.value = this.onionOptions.lineSize;
            this.mesh.customDepthMaterial.uniforms.uSize.value = this.onionOptions.lineSize;
        });
        // Osciloscope radius
        this.ui.add(this.onionOptions, "radius").min(0.001).max(0.5).step(0.001).name("Radius").onChange(() => {
            this.material.uniforms.uRadius.value = this.onionOptions.radius;
            this.mesh.customDepthMaterial.uniforms.uRadius.value = this.onionOptions.radius;
        });
    }


    /* 
     * Update function called on each frame, overwrites the CodepenThreeAudio::update function
     * that is a empty virtual function
     */
    update(time, delta) {
        if (this.songLoaded === true) {
            // Change line size to get bigger with average frequency 
//            this.material.uniforms.uSize.value = this.onionOptions.lineSize + (this.averageFrequency[4] * 0.0005);
            this.mesh.customDepthMaterial.uniforms.uSize.value = this.material.uniforms.uSize.value;
        }
    }
}

const newExample = new Onion();