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

    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }


    setup() {

        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.osciloscopeAudioStrength },
                uAudioZoom     : { value : this.experience.debugOptions.osciloscopeAudioZoom },
                uSize          : { value : this.experience.debugOptions.osciloscopeLineSize },
                uAlpha         : { value : this.experience.debugOptions.osciloscopeAlpha },
                uHover         : { value : 0.0 },
//                uTime         : { value : 0 }
            },
            vertexShader    : OsciloscopeVertexShader,
            fragmentShader  : OsciloscopeFragmentShader,
            transparent     : true,
            side            : THREE.DoubleSide,
            depthWrite      : false
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.y += 7;
        this.mesh.position.x -= 7;
        this.mesh.name = "Osciloscope";
        this.mesh.castShadow =  this.experience.debugOptions.shadows;
        this.scene.add(this.mesh);

    }

/*    resize() {
    }*/

/*    update() {
    }*/
    

}