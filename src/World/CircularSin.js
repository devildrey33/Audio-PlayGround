import CircularVertexShader from "../Shaders/Circular/CircularVertexShader.glsl"
//import CircularFragmentShaderR from "../Shaders/Circular/CircularFragmentShaderR.glsl"
import CircularSinFragmentShader from "../Shaders/Circular/CircularSinFragmentShader.glsl"
//import CircularDistorsionFragmentShader from "../Shaders/Circular/CircularDistorsionFragmentShader.glsl"

import Experience from "../Experience";
import * as THREE from 'three'

export default class CircularSin {
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
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize },
                uTime          : { value : 0 },
                uHover         : { value : 0.0 },
            },
            vertexShader    : CircularVertexShader,
            fragmentShader  : CircularSinFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide
        });

        this.material.alphaTest = 0;

        // Plane for the red channel circular shader
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = -Math.PI * 0.5;
        this.mesh.position.y += 7;
        this.mesh.position.x -= 3;
        this.mesh.name = "CircularSin";
        this.scene.add(this.mesh);

    }


    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }

    update() {
        this.material.uniforms.uTime.value += this.time.delta;
    }
}