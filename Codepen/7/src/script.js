import FloorStandardVertexShader from "./Shaders/FloorStandardVertexShader.glsl"
import FloorStandardFragmentShader from "./Shaders/FloorStandardFragmentShader.glsl"
import FloorDepthVertexShader from "./Shaders/FloorDepthVertexShader.glsl"
import BarsVertexShader from "./Shaders/BarsVertexShader.glsl"
import BarsFragmentShader from "./Shaders/BarsFragmentShader.glsl"
import BarsDepthVertexShader from "./Shaders/BarsDepthVertexShader.glsl"

import CodepenThreeAudio from "./CodepenThreeAudio.js";
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'



class FloorAndBars extends CodepenThreeAudio {
    // lil.gui data
    floorBarsOptions = {
        audioStrengthFloor  : 6,
        audioStrengthBars   : 2,
        color               : "#f2a464",
        color2              : "#7f2929",
    }
    
    // Main
    constructor() {
        // Call CodepenThreeAudio constructor
        super();

        // Setup the scene 
        this.setupScene();
    }

    /*
     * Setup world objects
     */ 
    setupScene() {                
        /*
         * Floor
         */
        this.geometryFloor = new THREE.PlaneGeometry(32, 32, 32, 32);    
        this.materialFloor = new THREE.MeshStandardMaterial({
            // Replace vertex shader and add more uniforms
            onBeforeCompile : (shader) => {
                // Add uniforms
                shader.uniforms.uAudioTexture  = { value : this.bufferCanvasSquare.texture };
                shader.uniforms.uAudioStrength = { value : this.floorBarsOptions.audioStrengthFloor };
                
                // New vertex shader
                shader.vertexShader = FloorStandardVertexShader;                
                // New fragment shader
                shader.fragmentShader = FloorStandardFragmentShader;
                // Make uniforms visible in the material
                this.materialFloor.uniforms = shader.uniforms;
            },
            color         : new THREE.Color("#0505e0"),
            wireframe     : false,
            side          : THREE.DoubleSide,
            transparent   : true,
            opacity       : 1,
        });        

        
        // Solid mesh
        this.floor = new THREE.Mesh(this.geometryFloor, this.materialFloor);
        this.floor.rotation.x = - Math.PI * 0.5
        this.floor.position.y = -8.00;
        this.floor.position.z = -12.00;
        this.floor.name = "Floor";
        this.floor.receiveShadow = true;
        this.floor.castShadow    = true;

        // Custom depth material
        this.floor.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.floor.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.floorBarsOptions.audioStrengthFloor };
            shader.vertexShader            = FloorDepthVertexShader;
            this.floor.customDepthMaterial.uniforms = shader.uniforms;
        }
        this.scene.add(this.floor);



        /* 
         * Bars
         */
        let width  = 256;
        let height = 1;
        let size   = width * height;

        let cubeGeometries = [];

        this.materialBars = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.floorBarsOptions.audioStrengthBars },
//                uTime         : { value : 0 }
            },
            vertexShader    : BarsVertexShader,
            fragmentShader  : BarsFragmentShader,
        });


        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const geometry = new THREE.BoxGeometry(0.09, 0.1, 0.09);

                const nx = (-(width * 0.5) + x) * 0.1;
                const nz = (-(height * 0.5) + z) * 0.1;

                geometry.translate(nx, 0, nz);

                cubeGeometries.push(geometry);
            }
        }

        const numPos = 24;
        this.idArray  = new Float32Array(size * numPos);        
        this.geometryBars = BufferGeometryUtils.mergeGeometries(cubeGeometries);
        let count = 0;
        // fill each cube with his id
        for (let g = 0; g < size * numPos; g+= numPos) {
            for (let n = 0; n < numPos; n++) {
                this.idArray[g + n] = count / size;
            }            
            count++;
        }
        this.geometryBars.setAttribute('aId', new THREE.BufferAttribute(this.idArray, 1));

        // clear cube geometries used to create the merged geometry
        for (let i = 0; i < size; i++) {
            cubeGeometries[i].dispose();
        }

        this.bars = new THREE.Mesh(this.geometryBars, this.materialBars);
        this.bars.castShadow = true;

//        this.bars.position.z += 4.5;
        this.bars.name = "Bars";

        // Custom depth material
        this.bars.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.bars.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.floorBarsOptions.audioStrengthBars };
            shader.vertexShader            = BarsDepthVertexShader;
        }

        this.scene.add(this.bars);
        
        
        this.loading = false;
    }
}

const newExample = new FloorAndBars();