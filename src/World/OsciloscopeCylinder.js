import Experience from "../Experience";
import * as THREE from 'three'
//import OsciloscopeVertexShader from "../Shaders/Osciloscope/OsciloscopeVertexShader.glsl"
import OsciloscopeCylinderFragmentShader from "../Shaders/Osciloscope/Cylinder/OsciloscopeCylinderFragmentShader.glsl"
import OsciloscopeCylinderVertexShader from "../Shaders/Osciloscope/Cylinder/OsciloscopeCylinderVertexShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"
import OsciloscopeDepthFragmentShader from "../Shaders/Osciloscope/OsciloscopeDepthFragmentShader.glsl"




export default class OsciloscopeCylinder {

    constructor(world, group, rotation = new THREE.Vector3(0, 0, 0), color) {
        this.experience           = new Experience();
        this.scene                = this.experience.scene;
        this.sizes                = this.experience.sizes;
        this.audioAnalizer        = this.experience.audioAnalizer;
        this.world                = world;
        this.time                 = this.experience.time;
        
        this.setup(group, rotation, color);
    }


    setup(group, rotation, color) {
        this.geometry = new THREE.CylinderGeometry(4, 4, 6, 32, 32, true);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.osciloscopeCylinderAudioStrength },
                uAudioZoom     : { value : this.experience.debugOptions.osciloscopeCylinderAudioZoom },
                uSize          : { value : this.experience.debugOptions.osciloscopeCylinderLineSize },
                uAlpha         : { value : this.experience.debugOptions.osciloscopeCylinderAlpha },
                uColor         : { value : new THREE.Color(color) },
                uHover         : { value : 0.0 },
                uTime          : { value : 0.0 }
            },
            vertexShader    : OsciloscopeCylinderVertexShader,
            fragmentShader  : OsciloscopeCylinderFragmentShader,
            transparent     : true,
            side            : THREE.DoubleSide,
            depthWrite      : false,
//            renderOrder     : 1
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
//        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        this.mesh.name = "OsciloscopeCilinder";
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

//        this.mesh.scale.set(0.01, 0.01, 1.0);

        group.add(this.mesh);

    }

/*    resize() {
    }*/

    update() {
        this.material.uniforms.uTime.value         += this.time.delta / 1000;
    }
    

}