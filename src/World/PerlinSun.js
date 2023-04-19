import Experience from "../Experience";
import PerlinSunVertexShader from "../Shaders/PerlinSun/PerlinSunVertexShader.glsl"
import PerlinSunFragmentShader from "../Shaders/PerlinSun/PerlinSunFragmentShader.glsl"
import PerlinSunDepthFragmentShader from "../Shaders/PerlinSun/PerlinSunDepthFragmentShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"
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

//        console.log(this.experience.debugOptions.perlinSunColorFrequency);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture   : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uTime           : { value : 0 },
                uAlpha          : { value : this.experience.debugOptions.perlinSunAlpha },
                uRotate         : { value : 1.0 },
                uHover          : { value : 0.0 },
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
        this.mesh.castShadow =  this.experience.debugOptions.shadows;
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Create a pseudo uniforms before depth material is compiled, to not crash the update function
        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0 } };

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture   = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uTime           = { value : 0 };
            shader.uniforms.uAlpha          = { value : this.experience.debugOptions.perlinSunAlpha };
            shader.uniforms.uRotate         = { value : 1.0 };
            shader.uniforms.uHover          = { value : 0.0 };
            shader.uniforms.uColorFrequency = { value : this.experience.debugOptions.perlinSunColorFrequency };
            shader.uniforms.uColorSin       = { value : this.experience.debugOptions.perlinSunColorSin };

            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = PerlinSunDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }
        
        this.scene.add(this.mesh);
    }

    update() {
        // Divided by 1024 to get values from 0.0 to 0.25
//        this.material.uniforms.uHighFrequency.value = this.audioAnalizer.averageFrequency[0] / 255;
//        this.material.uniforms.uLowFrequency.value  = this.audioAnalizer.averageFrequency[2] / 255;
//        this.material.uniforms.uColorStrength.value = 0.125 + this.audioAnalizer.averageFrequency[2] / 192;
        this.material.uniforms.uTime.value         += this.time.delta / 1000;    
        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;
    }
}