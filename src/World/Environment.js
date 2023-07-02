import * as THREE from 'three'
import Experience from "../Experience";

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene      = this.experience.scene; 
        this.resources  = this.experience.resources;
        this.debug      = this.experience.debug;


        this.setSunLight();
//        this.setSunLight2();
//        this.setEnvironmentMap();
        this.setSpotLight();
    }

    setSpotLight() {
        this.spotLight = new THREE.SpotLight(0xcccccc, this.experience.debugOptions.spotLightIntensity, 100, Math.PI * 0.1, 0.25, 0.25);
//        this.spotLight.position.set(1, 20, 27);
        this.spotLight.position.set(this.experience.debugOptions.spotLightPosX, this.experience.debugOptions.spotLightPosY, this.experience.debugOptions.spotLightPosZ);
//        this.spotLight.target.position.set(-1, 0, 1)
        this.spotLight.castShadow = this.experience.debugOptions.shadows;

        //Set up shadow properties for the light
        this.spotLight.shadow.mapSize.set(1024, 1024);
        this.spotLight.shadow.camera.near = 0.1; // default
        this.spotLight.shadow.camera.far = 1; // default
        this.spotLight.shadow.focus = 1; // default
        
        this.spotLight.visible = this.experience.debugOptions.spotLightVisible;

        this.scene.add(this.spotLight, this.spotLight.target);

        if (this.debug.active) {
            this.splhelper = new THREE.SpotLightHelper(this.spotLight);
            this.splhelper.visible = this.experience.debugOptions.spotLightVisible; 
            this.scene.add(this.splhelper);  
        }

    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', this.experience.debugOptions.sunLightIntensity)
        this.sunLight.castShadow = this.experience.debugOptions.shadows;
        this.sunLight.shadow.camera.far = 64;
        this.sunLight.shadow.mapSize.set(1024, 1024);
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.shadow.camera.bottom = -16;
        this.sunLight.shadow.camera.top    =  16;
        this.sunLight.shadow.camera.left   = -16;
        this.sunLight.shadow.camera.right  =  16;
        this.sunLight.position.set(-5, 18, 27);

        this.sunLight.visible = this.experience.debugOptions.sunLightVisible;

        this.scene.add(this.sunLight)

        //debug
        if (this.debug.active) {
            this.sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 1);
            this.sunLightHelper.visible = this.experience.debugOptions.sunLightVisible;
            this.scene.add(this.sunLightHelper);
        }
    }

    setSunLight2() {
        this.sunLight2 = new THREE.DirectionalLight('#ffffff', 2);
        this.sunLight2.castShadow = true
        this.sunLight2.shadow.camera.far = 64;
        this.sunLight2.shadow.mapSize.set(1024, 1024);
        this.sunLight2.shadow.normalBias = 0.05;
        this.sunLight2.shadow.camera.bottom = -16;
        this.sunLight2.shadow.camera.top    =  16;
        this.sunLight2.shadow.camera.left   = -16;
        this.sunLight2.shadow.camera.right  =  16;
        this.sunLight2.position.set(5, 12, 18);
        this.scene.add(this.sunLight2);

        //debug
        if (this.debug.active) {
            this.sunLightHelper2 = new THREE.DirectionalLightHelper(this.sunLight2, 1);
            this.scene.add(this.sunLightHelper2);
        }
        
/*        //debug
        if (this.debug.active) {
            this.debugFolder.add(this.sunLight2, 'intensity').min(0).max(10).step(0.001);
            this.debugFolder.add(this.sunLight2.position, 'x').name('sunLightX').min(-5).max(5).step(0.001);
            this.debugFolder.add(this.sunLight2.position, 'y').name('sunLightY').min(-5).max(5).step(0.001);
            this.debugFolder.add(this.sunLight2.position, 'z').name('sunLightZ').min(-5).max(5).step(0.001);
            this.sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight2, 1);
            this.scene.add(this.sunLightHelper);
        }*/
    }

    setEnvironmentMap() {
        this.environmentMap                     = {};
        this.environmentMap.intensity           = 0.5;
        this.environmentMap.texture             = this.resources.items.environmentMapTexture;
        this.environmentMap.texture.encoding    = THREE.sRGBEncoding;

      // this.scene.background  = this.environmentMap.texture;
        this.scene.environment = this.environmentMap.texture;

        this.environmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMap           = this.environmentMap.texture;
                    child.material.envMapIntensity  = this.environmentMap.intensity;
                    child.material.needsUpdate      = true;
                }
            })
        }
        this.environmentMap.updateMaterials();


        //debug
/*        if (this.debug.active) {
            this.debugFolder.add(this.environmentMap, 'intensity').name('envMapIntensity').min(0).max(4).step(0.001).onChange(this.environmentMap.updateMaterials)
        }*/

    }
}