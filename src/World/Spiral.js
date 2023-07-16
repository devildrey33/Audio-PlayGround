import * as THREE from "three"
import Experience from "../Experience";
import SpiralVertexShader from "../Shaders/Spiral/SpiralVertexShader.glsl"
import SpiralFragmentShader from "../Shaders/Spiral/SpiralFragmentShader.glsl"
import SpiralDepthFragmentShader from "../Shaders/Spiral/SpiralDepthFragmentShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"




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
        this.geometry = new THREE.CylinderGeometry( 2, 0.5, 60, 32, 1, true );
//        this.geometry = new THREE.PlaneGeometry(3, 3);

//        console.log(this.experience.debugOptions.perlinSunColorFrequency);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture      : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uAudioStrength     : { value : this.experience.debugOptions.spiralAudioStrength },
                uAudioZoom         : { value : this.experience.debugOptions.spiralAudioZoom },
                uAudioStrengthSin  : { value : this.experience.debugOptions.spiralAudioStrengthSin },
                uAudioZoomSin      : { value : this.experience.debugOptions.spiralAudioZoomSin },
                uTime              : { value : 0 },
                uFrequency         : { value : this.experience.debugOptions.spiralFrequency },
                uSpeed             : { value : this.experience.debugOptions.spiralSpeed },
                uThickness         : { value : this.experience.debugOptions.spiralThickness },
                uFrequencySin      : { value : this.experience.debugOptions.spiralFrequencySin },
                uSpeedSin          : { value : this.experience.debugOptions.spiralSpeedSin },
                uThicknessSin      : { value : this.experience.debugOptions.spiralThicknessSin }
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
        //this.mesh.rotation.z = Math.PI * 1.0;
/*        this.mesh.position.y = 0;
        this.mesh.position.x = -12;
        this.mesh.position.z = -2;*/
        this.mesh.name = "Spiral";
        this.mesh.castShadow =  this.experience.debugOptions.shadows;

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture     = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength    = { value : this.experience.debugOptions.spiralAudioStrength };
            shader.uniforms.uAudioZoom        = { value : this.experience.debugOptions.spiralAudioZoom },
            shader.uniforms.uAudioStrengthSin = { value : this.experience.debugOptions.spiralAudioStrengthSin };
            shader.uniforms.uAudioZoomSin     = { value : this.experience.debugOptions.spiralAudioZoomSin },
            shader.uniforms.uSpeed            = { value : this.experience.debugOptions.spiralSpeed };
            shader.uniforms.uFrequency        = { value : this.experience.debugOptions.spiralFrequency };
            shader.uniforms.uThickness        = { value : this.experience.debugOptions.spiralThickness };
            shader.uniforms.uSpeedSin         = { value : this.experience.debugOptions.spiralSpeedSin };
            shader.uniforms.uFrequencySin     = { value : this.experience.debugOptions.spiralFrequencySin };
            shader.uniforms.uThicknessSin     = { value : this.experience.debugOptions.spiralThicknessSin };
            shader.uniforms.uTime             = { value : 0 };
            shader.vertexShader               = DepthVertexShader;
            shader.fragmentShader             = SpiralDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0 }};
//        this.mesh.customDepthMaterial.transparent = true;

//        this.group = new THREE.Group();
        this.mesh.position.set(5, 3, 0);
//        this.group.add(this.mesh);
        this.scene.add(this.mesh);

    }

    update() {
        // get an average advance value
        const advance = this.time.delta / 1000;
        // update rotation on the cilynder
        this.mesh.rotation.y += advance;
        // update time on spiral
        this.material.uniforms.uTime.value += advance;   
        // update time on custom depth material
        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;
    }
}