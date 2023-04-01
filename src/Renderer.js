import * as THREE from 'three'
import Experience from "./Experience";

export default class Renderer {
    // Costructor
    constructor() {
        // Get the experience instance
        this.experience = new Experience();
        this.canvas     = this.experience.canvas;
        this.sizes      = this.experience.sizes;
        this.scene      = this.experience.scene;
        this.camera     = this.experience.camera;

        this.setInstance();
    }

    /**
     * Create the renderer instance and set his configuration
    */
    setInstance() {
        this.instance = new THREE.WebGL1Renderer({
            canvas      : this.canvas, 
            antialias   : true
        })
        
        this.instance.physicallyCorrectLights = true;
        this.instance.outputEncoding = THREE.sRGBEncoding;
        this.instance.toneMapping = THREE.CineonToneMapping;
        this.instance.toneMappingExposure = 1.75;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.setClearColor('#211d20');
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
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
        this.instance.render(this.scene, this.camera.instance)
    }
}