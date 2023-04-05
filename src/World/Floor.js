import * as THREE from 'three'
import Experience from "../Experience";
import FloorVertexShader from "../Shaders/Floor/PlaneVertexShader.glsl"
import FloorFragmentShader from "../Shaders/Floor/PlaneFragmentShader.glsl"

export default class Floor {
    constructor(world) {
        this.experience   = new Experience();
        this.scene        = this.experience.scene;
//        this.audioTexture = new THREE.CanvasTexture(this.experience.audioAnalizer.bufferCanvas.canvas);
        this.time         = this.experience.time;
        this.world        = world;
        this.setup();
    }

    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(32, 32, 32, 32);
        
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasSquare.texture },
                uAudioStrength : { value : this.experience.debugOptions.floorAudioStrength },
                uTime          : { value : 0 }
            },
            vertexShader    : FloorVertexShader,
            fragmentShader  : FloorFragmentShader, 
            wireframe       : true
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = - Math.PI * 0.5
//        this.mesh.receiveShadow = true;
        this.mesh.position.y = -5.050;
        this.scene.add(this.mesh);

    }

    update() {
        this.material.uniforms.uTime.value += this.time.delta;
    }
}