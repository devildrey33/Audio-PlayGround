import * as THREE from 'three'
import Experience from "../Experience";

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene      = this.experience.scene; 
        this.resources  = this.experience.resources;
        this.debug      = this.experience.debug;


//        this.setSunLight();
        //this.setSunLight2();
//        this.setEnvironmentMap();
//        this.setSpotLight();
    }

    setSpotLight() {
        this.spotLight = new THREE.SpotLight(0xffffff, 2, 100, Math.PI * 0.1, 0.25, 0.5);
        this.spotLight.position.set(-6, 6,-7);
        this.spotLight.target.position.set(-1, 0, 1)
/*        this.spotLight.castShadow = true;

        //Set up shadow properties for the light
        this.spotLight.shadow.mapSize.width = 512; // default
        this.spotLight.shadow.mapSize.height = 512; // default
        this.spotLight.shadow.camera.near = 0.5; // default
        this.spotLight.shadow.camera.far = 20; // default
        this.spotLight.shadow.focus = 1; // default*/

        this.scene.add(this.spotLight, this.spotLight.target);

/*        if (this.debug.active) {
            this.splhelper = new THREE.SpotLightHelper(this.spotLight);
            this.splhelper.visible = true; 
            this.scene.add(this.splhelper);  
        }*/

    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 2)
        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = 100
        this.sunLight.shadow.mapSize.set(1024, 1024);
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.position.set(-6, 12, 14);
        this.scene.add(this.sunLight)

        //debug
        if (this.debug.active) {
            this.sunLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 1);
            this.scene.add(this.sunLightHelper);
        }
    }

    setSunLight2() {
        this.sunLight2 = new THREE.DirectionalLight('#ffffff', 0.6)
        this.sunLight2.castShadow = true
        this.sunLight2.shadow.camera.far = 20
        this.sunLight2.shadow.mapSize.set(256, 256)
        this.sunLight2.shadow.normalBias = 0.05
        this.sunLight2.position.set(6, 5, -7)
        this.sunLight2.visible = false;
        this.scene.add(this.sunLight2)

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