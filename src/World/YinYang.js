import Experience from "../Experience";
import YinYangVertexShader from "../Shaders/YinYang/YinYangVertexShader.glsl"
import YinYangFragmentShader from "../Shaders/YinYang/YinYangFragmentShader.glsl"
import * as THREE from "three"

export default class YinYang {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.time          = this.experience.time;
        this.world         = world;
        
        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uHighFrequency : { value : 0 },
                uLowFrequency  : { value : 0 },
                uTime          : { value : 0 },
                uAlpha         : { value : this.experience.debugOptions.yinYangAlpha },
                uRotate        : { value : 1.0 },
                uHover         : { value : 0.0 },
                uColorStrength : { value : 0   }
            },
            vertexShader    : YinYangVertexShader,
            fragmentShader  : YinYangFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthWrite      : false,

        });


        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = -Math.PI;
        this.mesh.position.y += 3;
        this.mesh.position.x += 1;
        this.mesh.castShadow = true;
        this.mesh.name = "YinYang";
        
        this.scene.add(this.mesh);


    }

    update() {
        // Divided by 1024 to get values from 0.0 to 0.25
        this.material.uniforms.uHighFrequency.value = (255 - this.audioAnalizer.averageFrequency[2]) / 5024;
        this.material.uniforms.uLowFrequency.value  = this.audioAnalizer.averageFrequency[2] / 5024;
        this.material.uniforms.uColorStrength.value = 0.125 + this.audioAnalizer.averageFrequency[2] / 192;
        this.material.uniforms.uTime.value         += this.time.delta / 1000;
    }
}