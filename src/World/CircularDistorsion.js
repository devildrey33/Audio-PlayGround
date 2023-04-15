import CircularVertexShader from "../Shaders/Circular/CircularVertexShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"
import CircularDistorsionFragmentShader from "../Shaders/Circular/Distorsion/CircularDistorsionFragmentShader.glsl"
import CircularDistorisionDepthFragmentShader from "../Shaders/Circular/Distorsion/CircularDistorisionDepthFragmentShader.glsl"

import Experience from "../Experience";
import * as THREE from 'three'

export default class CircularDistorsion {
    constructor(world) {
        this.experience = new Experience();
        this.scene      = this.experience.scene;
        this.world      = world;
        this.time       = this.experience.time;

        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength * 0.6 },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize },
                uTime          : { value : 0 },
                uHover         : { value : 0.0 },
            },
            vertexShader    : CircularVertexShader,
            fragmentShader  : CircularDistorsionFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthWrite      : false,
        });

//        this.material.alphaTest = 0;

        // Plane for the green channel circular distorsion shader
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = Math.PI * 0.5;
        this.mesh.position.y += 3;
        this.mesh.position.x -= 7;
        this.mesh.name = "CircularDistorsion";
        this.mesh.castShadow = this.experience.debugOptions.shadows;
        

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.world.frequencyTexture.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.circularAudioStrength * 0.75  };
            shader.uniforms.uAlpha         = { value : this.experience.debugOptions.circularAlpha };
            shader.uniforms.uSize          = { value : this.experience.debugOptions.circularLineSize };
            shader.uniforms.uTime          = { value : 0 };
            shader.uniforms.uHover         = { value : 0.0 };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = CircularDistorisionDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.scene.add(this.mesh);

    }

    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }

    update() {
        this.material.uniforms.uTime.value += this.time.delta / 1000;
    }
}