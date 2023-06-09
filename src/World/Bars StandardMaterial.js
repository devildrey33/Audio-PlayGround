import Experience from "../Experience";
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import BarsStandardVertexShader from "../Shaders/Bars/BarsStandardVertexShader.glsl"
import BarsVertexShader from "../Shaders/Bars/BarsVertexShader.glsl"
import BarsFragmentShader from "../Shaders/Bars/BarsFragmentShader.glsl"


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

        this.cubeGeometries = [];

        this.material = new THREE.MeshStandardMaterial({
            color : new THREE.Color("#dd0000"),
            onBeforeCompile : (shader) => {
                // Add uniforms
                shader.uniforms.uAudioTexture  = { value : this.world.frequencyTexture.bufferCanvasLinear.texture };
                shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.barsAudioStrength };
                // New vertex shader
                shader.vertexShader = BarsStandardVertexShader;                
            }
        })


/*        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.barsAudioStrength },
//                uTime         : { value : 0 }
            },
            vertexShader    : BarsVertexShader,
            fragmentShader  : BarsFragmentShader,
//            transparent     : true
        });*/


//        let counter = 0;

        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const geometry = new THREE.BoxGeometry(0.07, 0.1, 0.07);

                const nx = (-(width * 0.5) + x) * 0.1;
                const nz = (-(height * 0.5) + z) * 0.1;

                geometry.translate(nx, 0, nz);

                this.cubeGeometries.push(geometry);
            }
        }

        const numPos = 24;
        this.idArray  = new Float32Array(size * numPos);        
        this.geometry = BufferGeometryUtils.mergeBufferGeometries(this.cubeGeometries);
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
            this.cubeGeometries[i].dispose();
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.bars.castShadow = true;
        this.bars.receiveShadow = true;

        this.mesh.position.z += 3;
        this.mesh.name = "Bars";

        this.scene.add(this.mesh);
    }

    
    update() {
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}