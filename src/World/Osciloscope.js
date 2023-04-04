import Experience from "../Experience";
import * as THREE from 'three'
import OsciloscopeVertexShader from "../Shaders/Osciloscope/OsciloscopeVertexShader.glsl"
import OsciloscopeFragmentShader from "../Shaders/Osciloscope/OsciloscopeFragmentShader.glsl"


export default class Osciloscope {
    constructor(world) {
        this.experience           = new Experience();
        this.scene                = this.experience.scene;
        this.sizes                = this.experience.sizes;
        this.world                = world;
        
        this.setup();
    }

    setup() {

        this.geometry = new THREE.PlaneGeometry(7, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.osciloscopeAudioStrength },
                uAudioZoom     : { value : this.experience.debugOptions.osciloscopeAudioZoom },
                uSize          : { value : this.experience.debugOptions.osciloscopeLineSize },
                uAlpha         : { value : this.experience.debugOptions.osciloscopeAlpha }
//                uTime         : { value : 0 }
            },
            vertexShader    : OsciloscopeVertexShader,
            fragmentShader  : OsciloscopeFragmentShader,
            transparent     : true
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        this.mesh.position.y += 7;
        this.mesh.position.x -= 5;
        this.material.side = THREE.DoubleSide;

    }

/*    resize() {
    }*/

/*    update() {
    }*/
    

}