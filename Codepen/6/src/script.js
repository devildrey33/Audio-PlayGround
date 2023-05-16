import YinYangPunkVertexShader from "./Shaders/YinYangPunkVertexShader.glsl"
import YinYangPunkFragmentShader from "./Shaders/YinYangPunkFragmentShader.glsl"
import DepthVertexShader from "./Shaders/DepthVertexShader.glsl"
import YinYangPunkDepthFragmentShader from "./Shaders/YinYangPunkDepthFragmentShader.glsl"

import CodepenThreeAudio from "./CodepenThreeAudio.js";
import * as THREE from 'three'
import * as lil from 'lil-gui'


class YinYangPunk extends CodepenThreeAudio {
    // lil.gui data
    yinYangOptions = {
        audioStrength : 0.75,
        audioZoom     : 1.4,
        lineSize      : 0.1,
        color         : "#f2a464",
        color2        : "#7f2929",
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
                uAudioStrength : { value : this.yinYangOptions.audioStrength },
                uAudioZoom     : { value : this.yinYangOptions.audioZoom },
                uColor         : { value : new THREE.Color(this.yinYangOptions.color)},
                uColor2        : { value : new THREE.Color(this.yinYangOptions.color2)},
                uTime          : { value : 0.0 }
            },
            vertexShader    : YinYangPunkVertexShader,
            fragmentShader  : YinYangPunkFragmentShader,
            transparent     : true,
            side            : THREE.DoubleSide,
            depthWrite      : false
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.rotation.z = -Math.PI * 0.5;
        //this.mesh.position.z += 2;
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.yinYangOptions.audioStrength };
            shader.uniforms.uAudioZoom     = { value : this.yinYangOptions.audioZoom };
            shader.uniforms.uTime          = { value : 0 };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = YinYangPunkDepthFragmentShader;
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
        this.ui.addColor(this.yinYangOptions, "color").name("Color").onChange(() => {
            this.material.uniforms.uColor.value = new THREE.Color(this.yinYangOptions.color);
        });
        // Color2
        this.ui.addColor(this.yinYangOptions, "color2").name("Color 2").onChange(() => {
            this.material.uniforms.uColor2.value = new THREE.Color(this.yinYangOptions.color2);
        });
        // Osciloscope audio strength
        this.ui.add(this.yinYangOptions, "audioStrength").min(0.1).max(1).step(0.01).name("Audio strength").onChange(() => {
            this.material.uniforms.uAudioStrength.value = this.yinYangOptions.audioStrength;
            this.mesh.customDepthMaterial.uniforms.uAudioStrength.value = this.yinYangOptions.audioStrength;
        });            
        // Osciloscope audio zoom
        this.ui.add(this.yinYangOptions, "audioZoom").min(1).max(16).step(0.1).name("Audio zoom").onChange(() => {
            this.material.uniforms.uAudioZoom.value = this.yinYangOptions.audioZoom;
            this.mesh.customDepthMaterial.uniforms.uAudioZoom.value = this.yinYangOptions.audioZoom;
        });            
    }


    /* 
     * Update function called on each frame, overwrites the CodepenThreeAudio::update function
     * that is a empty virtual function
     */
    update(time, delta) {
        this.material.uniforms.uTime.value = time;
        if (this.songLoaded === true) {
            this.mesh.customDepthMaterial.uniforms.uTime.value = time;
        }
    }
}

const newExample = new YinYangPunk();