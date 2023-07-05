import * as THREE from "three"
import Experience from "../Experience";
import SpiralVertexShader from "../Shaders/Spiral/SpiralVertexShader.glsl"
import SpiralFragmentShader from "../Shaders/Spiral/SpiralFragmentShader.glsl"




export default class Spiral {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.time          = this.experience.time;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.world         = world;
        this.setup();
    }

    
    setup() {
        this.geometry = new THREE.CylinderGeometry( 2, 2, 40, 32, 1, true );
        //this.geometry = new THREE.PlaneGeometry(3, 3);

//        console.log(this.experience.debugOptions.perlinSunColorFrequency);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture   : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uAudioStrength  : { value : this.experience.debugOptions.spiralAudioStrength },
                uAudioZoom      : { value : this.experience.debugOptions.spiralAudioZoom },
                uTime           : { value : 0 },
                uHover          : { value : 0.0 },
            },
            vertexShader    : SpiralVertexShader,
            fragmentShader  : SpiralFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
//            depthFunc       : THREE.AlwaysDepth,
/*            depthWrite      : false,*/
//            blending        : THREE.AdditiveBlending

        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = Math.PI * 0.5;
        this.mesh.rotation.z = Math.PI * 1.0;
/*        this.mesh.position.y = 0;
        this.mesh.position.x = -12;
        this.mesh.position.z = -2;*/
        this.mesh.name = "Spiral";
        this.mesh.castShadow =  this.experience.debugOptions.shadows;

        this.mesh.position.set(5, 3, 0);
        this.scene.add(this.mesh);

    }

    update() {
        //
        const advance = this.time.delta / 1000;
        // update time on spiral
        this.material.uniforms.uTime.value         += advance;   
        // update time on perlin sun shadow
//        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;

    }
}