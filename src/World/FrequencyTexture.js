import Experience from "../Experience.js";
import BufferCanvas from "../Utils/BufferCanvas.js";
import * as THREE from 'three'
import FrequencyTextureVertexShader from "../Shaders/FrequencyTexture/FrequencyTextureVertexShader.glsl"
import FrequencyTextureFragmentShaderR from "../Shaders/FrequencyTexture/FrequencyTextureFragmentShaderR.glsl"
import FrequencyTextureFragmentShaderG from "../Shaders/FrequencyTexture/FrequencyTextureFragmentShaderG.glsl"


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

        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);
        this.materialR = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture : { value : this.bufferCanvasSquare.texture },
            },
            vertexShader    : FrequencyTextureVertexShader,
            fragmentShader  : FrequencyTextureFragmentShaderR,
        });

        this.materialG = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture : { value : this.bufferCanvasSquare.texture },
            },
            vertexShader    : FrequencyTextureVertexShader,
            fragmentShader  : FrequencyTextureFragmentShaderG,
        });

        // Red channel
        this.meshR = new THREE.Mesh(this.geometry, this.materialR);       
        this.meshR.material.side = THREE.DoubleSide;
        this.meshR.position.y += 7;
        this.scene.add(this.meshR);
        // Green channel
        this.meshG = new THREE.Mesh(this.geometry, this.materialG);       
        this.meshG.material.side = THREE.DoubleSide;
        this.meshG.position.y += 3;
        this.scene.add(this.meshG);
    }

    update() {
        for (let y = 0; y < this.audioAnalizer.square; y++) {
            for (let x = 0; x < this.audioAnalizer.square * 2; x++) {
                // position for a 1024 array
                let pos = (x + y * this.audioAnalizer.square);
                // set red channel with the frequency, and the green channel with time domain
                let rValue = Math.clamp(this.audioAnalizer.analizerData[pos], 0, 255);       // R
                let gValue = Math.clamp(this.audioAnalizer.analizerDataSin[pos], 0, 255);
                // position for a 4098 array
                pos = pos * 4 ;
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