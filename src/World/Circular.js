import CircularVertexShader from "../Shaders/Circular/CircularVertexShader.glsl"
import CircularFragmentShaderR from "../Shaders/Circular/CircularFragmentShaderR.glsl"
import CircularFragmentShaderG from "../Shaders/Circular/CircularFragmentShaderG.glsl"
import CircularDistorsionFragmentShader from "../Shaders/Circular/CircularDistorsionFragmentShader.glsl"

import Experience from "../Experience";
import * as THREE from 'three'

export default class Circular {
    constructor(world) {
        this.experience = new Experience();
        this.scene      = this.experience.scene;
        this.world      = world;
        this.time       = this.experience.time;

        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.materialR = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize  }
            },
            vertexShader    : CircularVertexShader,
            fragmentShader  : CircularFragmentShaderR,
            transparent     : true, 
            side            : THREE.DoubleSide
        });

        this.materialG = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize  }
            },
            vertexShader    : CircularVertexShader,
            fragmentShader  : CircularFragmentShaderG,
            transparent     : true, 
            side            : THREE.DoubleSide
        });

        this.materialDistorsion = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength * 0.5 },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize  }
            },
            vertexShader    : CircularVertexShader,
            fragmentShader  : CircularDistorsionFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide
        });

        // Plane for the red channel circular shader
        this.meshR = new THREE.Mesh(this.geometry, this.materialR);
        this.meshR.rotation.z = -Math.PI * 0.5;
        this.meshR.position.y += 3;
        this.meshR.position.x += 1;
        this.scene.add(this.meshR);

        // Plane for the green channel circular shader
        this.meshG = new THREE.Mesh(this.geometry, this.materialG);
        this.meshG.rotation.z = -Math.PI * 0.5;
        this.meshG.position.y += 7;
        this.meshG.position.x += 1;
        this.scene.add(this.meshG);

        // Plane for the red channel circular distorsion shader
        this.meshDistorsion = new THREE.Mesh(this.geometry, this.materialDistorsion);
        this.meshDistorsion.rotation.z = Math.PI * 0.5;
        this.meshDistorsion.position.y += 3;
        this.meshDistorsion.position.x -= 3;
        this.scene.add(this.meshDistorsion);
    }

    visibleR(show) {
        if (show === true) this.scene.add(this.meshR);
        else               this.scene.remove(this.meshR);
    }

    visibleG(show) {
        if (show === true) this.scene.add(this.meshG);
        else               this.scene.remove(this.meshG);
    }

    visibleD(show) {
        if (show === true) this.scene.add(this.meshDistorsion);
        else               this.scene.remove(this.meshDistorsion);
    }

    update() {
    }
}