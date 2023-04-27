import SunsetVertexShader from "./Shaders/SunsetVertexShader.glsl"
import SunsetFragmentShader from "./Shaders/SunsetFragmentShader.glsl"
import DepthVertexShader from "./Shaders/DepthVertexShader.glsl"
import SunsetDepthFragmentShader from "./Shaders/SunsetDepthFragmentShader.glsl"

import CodepenThreeAudio from "./CodepenThreeAudio.js";
import * as THREE from 'three'
import * as lil from 'lil-gui'


class Sunset extends CodepenThreeAudio {
    // lil.gui data
    osciloscopeOptions = {
        audioStrength : 0.6,
        audioZoom     : 1,
        lineSize      : 0.08,
        color         : "#ed840c",
        radius        : 0.13
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
                uAudioStrength : { value : this.osciloscopeOptions.audioStrength },
                uAudioZoom     : { value : this.osciloscopeOptions.audioZoom },
                uSize          : { value : this.osciloscopeOptions.lineSize },
                uRadius        : { value : this.osciloscopeOptions.radius },
                uColor         : { value : new THREE.Color(this.osciloscopeOptions.color)},
            },
            vertexShader    : SunsetVertexShader,
            fragmentShader  : SunsetFragmentShader,
            transparent     : true,
            side            : THREE.DoubleSide,
            depthWrite      : false
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.rotation.z = Math.PI * 0.5;
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.osciloscopeOptions.audioStrength };
            shader.uniforms.uAudioZoom     = { value : this.osciloscopeOptions.audioZoom };
            shader.uniforms.uSize          = { value : this.osciloscopeOptions.lineSize };
            shader.uniforms.uRadius        = { value : this.osciloscopeOptions.radius };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = SunsetDepthFragmentShader;
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
        this.ui.addColor(this.osciloscopeOptions, "color").name("Color").onChange(() => {
            this.material.uniforms.uColor.value = new THREE.Color(this.osciloscopeOptions.color);
        });
        // Osciloscope audio strength
        this.ui.add(this.osciloscopeOptions, "audioStrength").min(0.1).max(1).step(0.01).name("Audio strength").onChange(() => {
            this.material.uniforms.uAudioStrength.value = this.osciloscopeOptions.audioStrength;
            this.mesh.customDepthMaterial.uniforms.uAudioStrength.value = this.osciloscopeOptions.audioStrength;
        });            
        // Osciloscope audio zoom
        this.ui.add(this.osciloscopeOptions, "audioZoom").min(1).max(16).step(0.1).name("Audio zoom").onChange(() => {
            this.material.uniforms.uAudioZoom.value = this.osciloscopeOptions.audioZoom;
            this.mesh.customDepthMaterial.uniforms.uAudioZoom.value = this.osciloscopeOptions.audioZoom;
        });            
        // Osciloscope line size
        this.ui.add(this.osciloscopeOptions, "lineSize").min(0.001).max(0.5).step(0.001).name("Line size").onChange(() => {
            this.material.uniforms.uSize.value = this.osciloscopeOptions.lineSize;
            this.mesh.customDepthMaterial.uniforms.uSize.value = this.osciloscopeOptions.lineSize;
        });
        // Osciloscope radius
        this.ui.add(this.osciloscopeOptions, "radius").min(0.001).max(0.5).step(0.001).name("Radius").onChange(() => {
            this.material.uniforms.uRadius.value = this.osciloscopeOptions.radius;
            this.mesh.customDepthMaterial.uniforms.uRadius.value = this.osciloscopeOptions.radius;
        });
    }


    /* 
     * Update function called on each frame, overwrites the CodepenThreeAudio::update function
     * that is a empty virtual function
     */
    update(time, delta) {
        if (this.songLoaded === true) {
            // Change line size to get bigger with average frequency 
            this.material.uniforms.uSize.value = this.osciloscopeOptions.lineSize + (this.averageFrequency[4] * 0.0005);
            this.mesh.customDepthMaterial.uniforms.uSize.value = this.material.uniforms.uSize.value;
        }
    }
}

const newExample = new Sunset();