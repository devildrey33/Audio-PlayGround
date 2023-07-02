import * as THREE from 'three'
import Experience from "./Experience";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import DisplacementVertexShader from "./Shaders/PostProcessing/Displacement/DisplacementVertexShader.glsl"
import DisplacementFragmentShader from "./Shaders/PostProcessing/Displacement/DisplacementFragmentShader.glsl"

export default class Renderer {
    // Costructor
    constructor() {
        // Get the experience instance
        this.experience = new Experience();
        this.canvas     = this.experience.canvas;
        this.sizes      = this.experience.sizes;
        this.scene      = this.experience.scene;
        this.camera     = this.experience.camera;
        this.time       = this.experience.time;

        this.setInstance();
    }

    // PostProcessing Displacement Pass
    DisplacementPass = {
        uniforms: {
            tDiffuse   : { value : null },
            uTime      : { value : 0 },
            uAmplitude : { value : null },
            uFrequency : { value : null }
        },
        vertexShader   : DisplacementVertexShader,
        fragmentShader : DisplacementFragmentShader
    }

    /**
     * Create the renderer instance and set his configuration
    */
    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas      : this.canvas, 
            antialias   : this.experience.optionsExperienceByDefault.antialias
        })
        
//        this.instance.physicallyCorrectLights = true;
        this.instance.useLegacyLights = true;
        this.instance.outputColorSpace = THREE.SRGBColorSpace;
//        this.instance.outputEncoding = THREE.sRGBEncoding;
        this.instance.toneMapping = THREE.CineonToneMapping;
        this.instance.toneMappingExposure = 1.75;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.setClearColor('#211d20');
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);

        /**
         * Post processing
         */
        this.effectComposer = new EffectComposer(this.instance);
        this.effectComposer.setSize(this.sizes.width, this.sizes.height);
        this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // first pass 
        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.effectComposer.addPass(this.renderPass);

        this.bloomPass = new UnrealBloomPass( new THREE.Vector2( this.sizes.width, this.sizes.height ), 1.5, 0.4, 0.85 );
        this.bloomPass.threshold = this.experience.debugOptions.bloomThreshold;
        this.bloomPass.strength  = this.experience.debugOptions.bloomStrength;
        this.bloomPass.radius    = this.experience.debugOptions.bloomRadius;        
        this.bloomPass.enabled   = this.experience.debugOptions.bloomEnabled;     

        this.effectComposer.addPass(this.bloomPass);   

        this.displacementPass = new ShaderPass(this.DisplacementPass);
        this.displacementPass.material.uniforms.uAmplitude.value = this.experience.debugOptions.displacementAmplitude;
        this.displacementPass.material.uniforms.uFrequency.value = this.experience.debugOptions.displacementFrequency;
        this.displacementPass.material.uniforms.uAmplitude.value = new THREE.Vector2(
            this.experience.debugOptions.displacementAmplitudeX, 
            this.experience.debugOptions.displacementAmplitudeY
        );
        this.displacementPass.material.uniforms.uFrequency.value = new THREE.Vector2(
            this.experience.debugOptions.displacementFrequencyX, 
            this.experience.debugOptions.displacementFrequencyY
        );

        this.displacementPass.enabled   = this.experience.debugOptions.displacementEnabled;     
        this.effectComposer.addPass(this.displacementPass);
        
    }

    /**
     * Function called on resize
    */
    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    /**
     * Function called on update
    */
    update() {
        const advance = this.time.delta / 1000;
        this.displacementPass.material.uniforms.uTime.value += advance;

        this.effectComposer.render();
        //this.instance.render(this.scene, this.camera.instance)
    }
}