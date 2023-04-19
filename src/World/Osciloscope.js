import Experience from "../Experience";
import * as THREE from 'three'
import OsciloscopeVertexShader from "../Shaders/Osciloscope/OsciloscopeVertexShader.glsl"
import OsciloscopeFragmentShader from "../Shaders/Osciloscope/OsciloscopeFragmentShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"
import OsciloscopeDepthFragmentShader from "../Shaders/Osciloscope/OsciloscopeDepthFragmentShader.glsl"


export default class Osciloscope {
    constructor(world) {
        this.experience           = new Experience();
        this.scene                = this.experience.scene;
        this.sizes                = this.experience.sizes;
        this.audioAnalizer        = this.experience.audioAnalizer;
        this.world                = world;
        
        this.setup();
    }


    setup() {

        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
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

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.osciloscopeAudioStrength };
            shader.uniforms.uAudioZoom     = { value : this.experience.debugOptions.osciloscopeAudioZoom },
            shader.uniforms.uAlpha         = { value : this.experience.debugOptions.osciloscopeAlpha };
            shader.uniforms.uSize          = { value : this.experience.debugOptions.osciloscopeLineSize };
            shader.uniforms.uTime          = { value : 0 };
            shader.uniforms.uHover         = { value : 0.0 };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = OsciloscopeDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }


        this.scene.add(this.mesh);

    }

/*    resize() {
    }*/

/*    update() {
    }*/
    

}