import Experience from "../Experience.js";
import BufferCanvas from "../Utils/BufferCanvas.js";
import * as THREE from 'three'
import FrequencyTextureVertexShader from "../Shaders/FrequencyTexture/FrequencyTextureVertexShader.glsl"
//import FrequencyTextureFragmentShader from "../Shaders/FrequencyTexture/FrequencyTextureFragmentShader.glsl"
import FrequencyTextureFragmentShaderR from "../Shaders/FrequencyTexture/FrequencyTextureFragmentShaderR.glsl"
import FrequencyTextureFragmentShaderG from "../Shaders/FrequencyTexture/FrequencyTextureFragmentShaderG.glsl"
import FrequencyTextureDepthFragmentShader from "../Shaders/FrequencyTexture/FrequencyTextureDepthFragmentShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"

export default class FrequencyTexture {
    constructor() {
        this.experience                 = new Experience();
        this.scene                      = this.experience.scene;
        this.audioAnalizer              = this.experience.audioAnalizer;
        this.square                     = this.audioAnalizer.square;
        this.bufferCanvasSquare         = new BufferCanvas(this.square, this.square);
        this.bufferCanvasSquare.texture = new THREE.CanvasTexture(this.bufferCanvasSquare.canvas);
        this.imageDataSquare            = this.bufferCanvasSquare.context.createImageData(this.square, this.square);
        this.bufferCanvasLinear         = new BufferCanvas(1024, 1);
        this.bufferCanvasLinear.texture = new THREE.CanvasTexture(this.bufferCanvasLinear.canvas);
        this.imageDataLinear            = this.bufferCanvasLinear.context.createImageData(1024, 1);


        this.bufferCanvasSquare.texture.generateMipMaps = false;
        this.bufferCanvasSquare.texture.minFilter = THREE.NearestFilter;
        this.bufferCanvasSquare.texture.magFilter = THREE.NearestFilter;

        this.bufferCanvasLinear.texture.generateMipMaps = false;
        this.bufferCanvasLinear.texture.minFilter = THREE.NearestFilter;
        this.bufferCanvasLinear.texture.magFilter = THREE.NearestFilter;

//        this.setup();
    }

    /* 
     * Creates the audio texture pannels, one red with frequency data and one green with time domain data.
     */
    setup() {
        // Plane geometry of 3x3
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.materialR = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture : { value : this.bufferCanvasSquare.texture },
                uHover        : { value : 0.0 },
            },
            vertexShader    : FrequencyTextureVertexShader,
            fragmentShader  : FrequencyTextureFragmentShaderR,
            transparent     : true,
            depthWrite      : false
        });

        // Red channel pannel
        this.meshR = new THREE.Mesh(this.geometry, this.materialR);       
        this.meshR.material.side = THREE.DoubleSide;
        this.meshR.position.y += 3;
        this.meshR.position.x -= 11;
        this.meshR.name = "FrequencyTexture";
        this.meshR.castShadow =  this.experience.debugOptions.shadows;


        // Custom depth material
        this.meshR.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.meshR.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uHover         = { value : 0.0 };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = FrequencyTextureDepthFragmentShader;
            this.meshR.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.scene.add(this.meshR);



        this.materialG = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture : { value : this.bufferCanvasSquare.texture },
                uHover        : { value : 0.0 },
            },
            vertexShader    : FrequencyTextureVertexShader,
            fragmentShader  : FrequencyTextureFragmentShaderG,
            transparent     : true,
            depthWrite      : false
        });

        // Green channel
        this.meshG = new THREE.Mesh(this.geometry, this.materialG);       
        this.meshG.material.side = THREE.DoubleSide;
        this.meshG.position.y += 7;
        this.meshG.position.x -= 11;
        this.meshG.name = "FrequencyTextureSin";
        this.meshG.castShadow = this.experience.debugOptions.shadows;


        // Custom depth material
        this.meshG.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.meshG.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uHover         = { value : 0.0 };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = FrequencyTextureDepthFragmentShader;
            this.meshG.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.scene.add(this.meshG);
    }


    // Updates internal audio data textures
    // For the floor whe need a 32x32 texture, and for the rest of the effects a 1024x1 texture
    // Red channel is the Frequency data, and the Green channel is the time domain data
    update() {
        for (let y = 0; y < this.audioAnalizer.square; y++) {
            for (let x = 0; x < this.audioAnalizer.square * 2; x++) {
                // position for a 1024 array
                let pos = (x + y * this.audioAnalizer.square);
                // set red channel with the frequency, and the green channel with time domain
                let rValue = Math.clamp(this.audioAnalizer.analizerData[pos], 0, 255);       // R
                let gValue = Math.clamp(this.audioAnalizer.analizerDataSin[pos], 0, 255);
                // position for a 4098 array
                pos = pos * 4;
                // fill the 32*32 image
                this.imageDataSquare.data[pos]     = rValue;
                this.imageDataSquare.data[pos + 1] = gValue;
                this.imageDataSquare.data[pos + 2] = 0;
                this.imageDataSquare.data[pos + 3] = 255;
                // fill the 1024*1 image
                this.imageDataLinear.data[pos]     = rValue;
                this.imageDataLinear.data[pos + 1] = gValue;
                this.imageDataLinear.data[pos + 2] = 0;
                this.imageDataLinear.data[pos + 3] = 255;
//                console.log(Math.clamp(this.audioAnalizer.analizerDataSin[x + y * this.audioAnalizer.square] + 128, 0, 255))
            }
        }
        this.bufferCanvasSquare.context.putImageData(this.imageDataSquare, 0, 0, 0, 0, 32, 32);
        this.bufferCanvasSquare.texture.needsUpdate = true;

        this.bufferCanvasLinear.context.putImageData(this.imageDataLinear, 0, 0, 0, 0, 1024, 1);
        this.bufferCanvasLinear.texture.needsUpdate = true;
    }
}