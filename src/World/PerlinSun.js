import Experience from "../Experience";
import PerlinSunVertexShader from "../Shaders/PerlinSun/PerlinSunVertexShader.glsl"
import PerlinSunFragmentShader from "../Shaders/PerlinSun/PerlinSunFragmentShader.glsl"
import * as THREE from "three"

export default class PerlinSun {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.time          = this.experience.time;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.world         = world;
        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(7, 7);

        console.log(this.experience.debugOptions.perlinSunColorFrequency);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture   : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
//                uHighFrequency  : { value : 0 },
//                uLowFrequency   : { value : 0 },
                uTime           : { value : 0 },
                uAlpha          : { value : this.experience.debugOptions.yinYangAlpha },
                uRotate         : { value : 1.0 },
                uHover          : { value : 0.0 },
//                uColorStrength  : { value : 0   },
                uColorFrequency : { value : this.experience.debugOptions.perlinSunColorFrequency },
                uColorSin       : { value : this.experience.debugOptions.perlinSunColorSin }
            },
            vertexShader    : PerlinSunVertexShader,
            fragmentShader  : PerlinSunFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthFunc       : THREE.AlwaysDepth,
            depthWrite      : false
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
//        this.mesh.rotation.z = -Math.PI;
        this.mesh.rotation.z = -Math.PI * 0.5;
        this.mesh.position.y += 5;
        this.mesh.position.x += 7;
        this.mesh.name = "PerlinSun";
        this.scene.add(this.mesh);
    }

    update() {
        // Divided by 1024 to get values from 0.0 to 0.25
//        this.material.uniforms.uHighFrequency.value = this.audioAnalizer.averageFrequency[0] / 255;
//        this.material.uniforms.uLowFrequency.value  = this.audioAnalizer.averageFrequency[2] / 255;
//        this.material.uniforms.uColorStrength.value = 0.125 + this.audioAnalizer.averageFrequency[2] / 192;
        this.material.uniforms.uTime.value         += this.time.delta / 1000;    }
}