import Experience from "../Experience";
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import BarsVertexShader from "../Shaders/Bars/BarsVertexShader.glsl"
import BarsDepthVertexShader from "../Shaders/Bars/BarsDepthVertexShader.glsl"
import BarsFragmentShader from "../Shaders/Bars/BarsFragmentShader.glsl"

/*
 * Bars are merged and uses ShaderMaterial
 */

export default class Bars {
    
    constructor(world) {
        this.experience      = new Experience();
        this.fftSize         = this.experience.audioAnalizer.analizer.fftSize;
        this.scene           = this.experience.scene;
        this.data            = this.experience.audioAnalizer.analizerData;
        this.world           = world;
        
        // Could be a square but makes no sense with the floor
        this.createBars(256,1);
    }

    visible(show) {
        if (show === true) this.scene.add(this.bars);
        else               this.scene.remove(this.bars);
    }

    createBars(width, height) {
        if (typeof(this.bars) !== "undefined") {
            this.scene.remove(this.bars);
            this.geometry.dispose();
            this.material.dispose();
        }

        let   size       = width * height;

        let cubeGeometries = [];

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.barsAudioStrength },
//                uTime         : { value : 0 }
            },
            vertexShader    : BarsVertexShader,
            fragmentShader  : BarsFragmentShader,
//            transparent     : true
        });


//        let counter = 0;

        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const geometry = new THREE.BoxGeometry(0.08, 0.1, 0.08);

                const nx = (-(width * 0.5) + x) * 0.1;
                const nz = (-(height * 0.5) + z) * 0.1;

                geometry.translate(nx, 0, nz);

                cubeGeometries.push(geometry);
            }
        }

        const numPos = 24;
        this.idArray  = new Float32Array(size * numPos);        
        this.geometry = BufferGeometryUtils.mergeGeometries(cubeGeometries);
        let count = 0;
        // fill each cube with his id
        for (let g = 0; g < size * numPos; g+= numPos) {
            for (let n = 0; n < numPos; n++) {
                this.idArray[g + n] = count / size;
            }            
            count++;
        }
        this.geometry.setAttribute('aId', new THREE.BufferAttribute(this.idArray, 1));

        // clear cube geometries used to create the merged geometry
        for (let i = 0; i < size; i++) {
            cubeGeometries[i].dispose();
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = this.experience.debugOptions.shadows;

        this.mesh.position.z += 4.5;
        this.mesh.name = "Bars";

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.world.frequencyTexture.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.barsAudioStrength };
            shader.vertexShader            = BarsDepthVertexShader;
        }

        this.scene.add(this.mesh);
    }

    
    update() {
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}