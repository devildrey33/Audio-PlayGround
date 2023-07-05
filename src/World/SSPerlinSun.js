import * as THREE from "three"
import Experience from "../Experience";
import SSPerlinSunVertexShader from "../Shaders/PerlinSun/SS/SSPerlinSunVertexShader.glsl"
import PerlinSunVertexShader from "../Shaders/PerlinSun/PerlinSunVertexShader.glsl"
import PerlinSunFragmentShader from "../Shaders/PerlinSun/PerlinSunFragmentShader.glsl"
import SSPerlinSunFragmentShader from "../Shaders/PerlinSun/SS/SSPerlinSunFragmentShader.glsl"
import SSPerlinSunDepthFragmentShader from "../Shaders/PerlinSun/SS/SSPerlinSunDepthFragmentShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"

export default class SSPerlinSun {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.time          = this.experience.time;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.world         = world;
        this.setup();
    }

    setup() {        
//        this.group = new THREE.Group();
//        this.groupLookAt = new THREE.Group();

        this.geometry = new THREE.PlaneGeometry(3, 3);

//        console.log(this.experience.debugOptions.perlinSunColorFrequency);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture   : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uTime           : { value : 0 },
                uAlpha          : { value : this.experience.debugOptions.perlinSunAlpha },
                uRotate         : { value : 1.0 },
                uHover          : { value : 0.0 },
                uColorFrequency : { value : this.experience.debugOptions.ssPerlinSunColorFrequency },
                uColorSin       : { value : this.experience.debugOptions.ssPerlinSunColorSin },
                uNoiseStrength  : { value : this.experience.debugOptions.ssPerlinSunNoiseStrength },
                uNoiseSpeed     : { value : this.experience.debugOptions.ssPerlinSunNoiseSpeed }
            },
            vertexShader    : SSPerlinSunVertexShader,
            fragmentShader  : SSPerlinSunFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
//            depthFunc       : THREE.AlwaysDepth,
/*            depthWrite      : false,*/
//            blending        : THREE.AdditiveBlending

        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
//        this.mesh.rotation.z = -Math.PI;
        this.mesh.rotation.z = -Math.PI * 0.5;
/*        this.mesh.position.y = 0;
        this.mesh.position.x = -12;
        this.mesh.position.z = -2;*/
        this.mesh.name = "SSPerlinSun";
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
            shader.uniforms.uNoiseStrength  = { value : this.experience.debugOptions.ssPerlinSunNoiseStrength }
            shader.uniforms.uNoiseSpeed     = { value : this.experience.debugOptions.ssPerlinSunNoiseSpeed }
//            shader.uniforms.uColorFrequency = { value : this.experience.debugOptions.ssPerlinSunColorFrequency };
//            shader.uniforms.uColorSin       = { value : this.experience.debugOptions.ssPerlinSunColorSin };

            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = SSPerlinSunDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }
        
        
      
        this.mesh.position.set(5, 7, 0);
        this.scene.add(this.mesh);


    }


    update() {
        //
        const advance = this.time.delta / 1000;
        // update time on perlin sun
        this.material.uniforms.uTime.value         += advance;   
        // update time on perlin sun shadow
        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;
     
    }
}