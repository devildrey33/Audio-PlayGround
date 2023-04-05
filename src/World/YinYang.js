import Experience from "../Experience";
import YinYangVertexShader from "../Shaders/YinYang/YinYangVertexShader.glsl"
import YinYangFragmentShaderR from "../Shaders/YinYang/YinYangFragmentShaderR.glsl"
import YinYangFragmentShaderG from "../Shaders/YinYang/YinYangFragmentShaderG.glsl"
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

        this.materialR = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uHighFrequency : { value : 0 },
                uLowFrequency  : { value : 0 },
                uTime          : { value : 0 },
                uAlpha         : { value : this.experience.debugOptions.yinYangAlpha },
                uRotate        : { value : 1.0 }
            },
            vertexShader    : YinYangVertexShader,
            fragmentShader  : YinYangFragmentShaderR,
            transparent     : true, 
            side            : THREE.DoubleSide
        });

        this.materialG = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uHighFrequency : { value : 0 },
                uLowFrequency  : { value : 0 },
                uTime          : { value : 0 },
                uAlpha         : { value : this.experience.debugOptions.yinYangAlpha },
                uRotate        : { value : 1.0 }
            },
            vertexShader    : YinYangVertexShader,
            fragmentShader  : YinYangFragmentShaderG,
            transparent     : true, 
            side            : THREE.DoubleSide
        });

        this.meshR = new THREE.Mesh(this.geometry, this.materialR);
        this.meshR.position.y += 3;
        this.meshR.position.x += 5;
        this.scene.add(this.meshR);

        this.meshG = new THREE.Mesh(this.geometry, this.materialG);
        this.meshG.position.y += 7;
        this.meshG.position.x += 5;
        this.scene.add(this.meshG);

    }

    update() {
        // Divided by 1024 to get values from 0.0 to 0.25
        this.materialR.uniforms.uHighFrequency.value = (255 - this.audioAnalizer.averageFrequency[2]) / 5024;
        this.materialR.uniforms.uLowFrequency.value  = this.audioAnalizer.averageFrequency[2] / 5024;
        this.materialR.uniforms.uTime.value         += this.time.delta;
        this.materialG.uniforms.uHighFrequency.value = this.materialR.uniforms.uHighFrequency.value;
        this.materialG.uniforms.uLowFrequency.value  = this.materialR.uniforms.uLowFrequency.value;
        this.materialG.uniforms.uTime.value          = this.materialR.uniforms.uTime.value;
    }
}