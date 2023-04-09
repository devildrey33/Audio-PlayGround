import Experience from "../Experience.js";
import BufferCanvas from "../Utils/BufferCanvas.js";
import * as THREE from 'three'
import FrequencyTextureVertexShader from "../Shaders/FrequencyTexture/FrequencyTextureVertexShader.glsl"
//import FrequencyTextureFragmentShader from "../Shaders/FrequencyTexture/FrequencyTextureFragmentShader.glsl"
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


        this.bufferCanvasSquare.texture.generateMipMaps = false;
        this.bufferCanvasSquare.texture.minFilter = THREE.NearestFilter;
        this.bufferCanvasSquare.texture.magFilter = THREE.NearestFilter;

        this.bufferCanvasLinear.texture.generateMipMaps = false;
        this.bufferCanvasLinear.texture.minFilter = THREE.NearestFilter;
        this.bufferCanvasLinear.texture.magFilter = THREE.NearestFilter;

        this.setup();
    }

    setup() {
        // Stuff to create a plus and equal simbols
/*        this.simbolMaterial = new THREE.MeshBasicMaterial( { color : new THREE.Color("#ffff00") });
        this.simbolGeometry = new THREE.BoxGeometry(0.125, 0.125, 0.1);

        // Create two boxes to make a plus simbol
        this.plus1 = new THREE.Mesh(this.simbolGeometry, this.simbolMaterial);
        this.plus1.scale.x = 4.0;
        this.plus2 = new THREE.Mesh(this.simbolGeometry, this.simbolMaterial);
        this.plus2.scale.y = 4.0;
        // Group for plus meshes
        this.plus = new THREE.Group();
        this.plus.add(this.plus1, this.plus2);
        // Move plus to its position
        this.plus.position.y += 5;
        this.plus.position.x -= 11;
        // Add plus group to the scene
        this.scene.add(this.plus);

        // Create two boxes to make an equal simbol
        this.equal1 = new THREE.Mesh(this.simbolGeometry, this.simbolMaterial);
        this.equal1.scale.x = 4.0;
        this.equal1.position.y = 0.125;
        this.equal2 = new THREE.Mesh(this.simbolGeometry, this.simbolMaterial);
        this.equal2.scale.x = 4.0;
        this.equal2.position.y = -0.125;
        // Group for equal meshes
        this.equal = new THREE.Group();
        this.equal.add(this.equal1, this.equal2);
        // Move equal to its position
        this.equal.position.y += 3;
        this.equal.position.x -= 9;
        // Add equal group to the scene
        this.scene.add(this.equal);*/



        this.geometry = new THREE.PlaneGeometry(3, 3);
/*        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture : { value : this.bufferCanvasSquare.texture },
            },
            vertexShader    : FrequencyTextureVertexShader,
            fragmentShader  : FrequencyTextureFragmentShader,
        });*/

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

        // Red channel
        this.meshR = new THREE.Mesh(this.geometry, this.materialR);       
        this.meshR.material.side = THREE.DoubleSide;
        this.meshR.position.y += 3;
        this.meshR.position.x -= 11;
        this.meshR.name = "FrequencyTexture";

        this.scene.add(this.meshR);
        // Green channel
        this.meshG = new THREE.Mesh(this.geometry, this.materialG);       
        this.meshG.material.side = THREE.DoubleSide;
        this.meshG.position.y += 7;
        this.meshG.position.x -= 11;
        this.meshG.name = "FrequencyTextureSin";
        this.scene.add(this.meshG);
        // Both channels
/*        this.mesh = new THREE.Mesh(this.geometry, this.material);       
        this.mesh.material.side = THREE.DoubleSide;
        this.mesh.position.y += 3;
        this.mesh.position.x -= 7;
        this.scene.add(this.mesh);*/
    }

    visible(show) {
        if (show === true) {
            this.scene.add(this.plus);
            this.scene.add(this.equal);
            this.scene.add(this.meshR);
            this.scene.add(this.meshG);
            this.scene.add(this.mesh);
        }
        else {
            this.scene.remove(this.plus);
            this.scene.remove(this.equal);
            this.scene.remove(this.meshR);
            this.scene.remove(this.meshG);
            this.scene.remove(this.mesh);
        }   
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