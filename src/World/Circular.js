import CircularVertexShader from "../Shaders/Circular/CircularVertexShader.glsl"
import CircularFragmentShader from "../Shaders/Circular/CircularFragmentShader.glsl"

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

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize },
                uTime          : { value : 0 },
                uHover         : { value : 0.0 },

/*                ambientLightColor: { value: null },
                lightProbe: { value: null },
                directionalLights: { value: null },
                directionalLightShadows : { value : null},
                spotLights: { value: null },
                spotLightShadows: { value : null },
                spotLightMatrix: { value : null },
                spotLightMap: { value : null },
                rectAreaLights: { value: null },
                pointLights: { value: null },
                pointLightShadows : { value : null },
                hemisphereLights: { value: null },
                directionalShadowMap: { value: null },
                directionalShadowMatrix: { value: null },
                spotShadowMap: { value: null },
                spotShadowMatrix: { value: null },
                pointShadowMap: { value: null },
                pointShadowMatrix: { value: null },                
                ltc_1: { value : null },
                ltc_2: { value : null }*/
            },
            vertexShader    : CircularVertexShader,
            fragmentShader  : CircularFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthWrite      : false,
//            lights          : true
        });

//        this.material.alphaTest = 0;

        // Plane for the red channel circular shader
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = -Math.PI * 0.5;
        this.mesh.position.y += 3;
        this.mesh.position.x -= 3;
        this.mesh.name = "Circular";
        this.mesh.castShadow = this.experience.debugOptions.shadows;


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