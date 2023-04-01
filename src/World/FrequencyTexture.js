import Experience from "../Experience.js";
import BufferCanvas from "../Utils/BufferCanvas.js";
import * as THREE from 'three'


export default class FrequencyTexture {
    constructor() {
        this.experience           = new Experience();
        this.scene                = this.experience.scene;
        this.audioAnalizer        = this.experience.audioAnalizer;
        this.square               = this.audioAnalizer.square;
        this.bufferCanvas         = new BufferCanvas(this.square, this.square);
        this.bufferCanvas.texture = new THREE.CanvasTexture(this.bufferCanvas.canvas);
        this.imageData            = this.bufferCanvas.context.createImageData(this.square, this.square);

        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);
        this.material = new THREE.MeshBasicMaterial({ map: this.bufferCanvas.texture });
        this.mesh = new THREE.Mesh(this.geometry, this.material);       
        this.mesh.material.side = THREE.DoubleSide;
        this.mesh.position.y += 3;
        
        this.scene.add(this.mesh);
    }

    update() {
        for (let y = 0; y < this.audioAnalizer.square; y++) {
            for (let x = 0; x < this.audioAnalizer.square * 2; x++) {
                let pos = (x + y * this.audioAnalizer.square) * 4;
                // set red channel with the frequency, and the green channel with time domain
                this.imageData.data[pos]     = Math.clamp(this.audioAnalizer.analizerData[x + y * this.audioAnalizer.square] * 0.33, 0, 255);       // R
                this.imageData.data[pos + 1] = Math.clamp(this.audioAnalizer.analizerDataSin[x + y * this.audioAnalizer.square], 0, 255);
                this.imageData.data[pos + 2] = 0;
                this.imageData.data[pos + 3] = 255;

//                console.log(Math.clamp(this.audioAnalizer.analizerDataSin[x + y * this.audioAnalizer.square] + 128, 0, 255))
            }
        }
        this.bufferCanvas.context.putImageData(this.imageData, 0, 0, 0, 0, 32, 32);
        this.bufferCanvas.texture.needsUpdate = true;
    }
}