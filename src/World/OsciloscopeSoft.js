import Experience from "../Experience";
import * as THREE from 'three'
import BufferCanvas from "../Utils/BufferCanvas";


export default class OsciloscopeSoft {
    constructor(world) {
        this.experience           = new Experience();
        this.scene                = this.experience.scene;
        this.sizes                = this.experience.sizes;
        this.bufferCanvas         = new BufferCanvas(256, 512);
        this.bufferCanvas.texture = new THREE.CanvasTexture(this.bufferCanvas.canvas);
        this.audioAnalizer        = this.experience.audioAnalizer;
        this.world                = world;
        
        // listen resize event
        this.sizes.on('resize', () => { this.resize(); })
        this.setup();
    }

    setup() {

        this.geometry = new THREE.PlaneGeometry(10, 3);


        this.material = new THREE.MeshBasicMaterial({ 
            side : THREE.DoubleSide,
            map : this.bufferCanvas.texture, 
            transparent : false, 
            opacity: 0.6 
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        this.mesh.position.y += 7;
        this.mesh.position.x -= 7;
        this.material.side = THREE.DoubleSide;

//        this.bufferCanvas.texture.wrapS = THREE.MirroredRepeatWrapping;
//        this.bufferCanvas.texture.repeat.x = 20;
    }

    resize() {
        this.material.uniforms.uResolution.value.set(this.sizes.width, this.sizes.height);
    }

    update() {
        this.drawSinWave();
    }
    

    drawSinWave() {
        this.bufferCanvas.context.fillStyle   = "rgba(0, 0, 0, 0.5)";
        this.bufferCanvas.context.strokeStyle = 'rgb(' + Math.round(128 + this.audioAnalizer.averageFrequency[4]) + ',' + Math.round(255 - this.audioAnalizer.averageFrequency[4]) +  ', 0)';
        let tam = this.audioAnalizer.fftSize / 2;
        this.bufferCanvas.context.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        let advance = 1024 / tam;
        this.bufferCanvas.context.beginPath();        
        this.bufferCanvas.context.moveTo(0, this.bufferCanvas.height / 2);
        let x = 0, y = 0;
        for (let i = 0; i < tam; i++) {
            y = (this.bufferCanvas.height / 4) + this.audioAnalizer.analizerDataSin[i];
            this.bufferCanvas.context.lineTo(x, y);
            x += advance;
        }
        // Parche para bajas precisiones que no terminan la onda al final del canvas
        this.bufferCanvas.context.lineTo(this.width, y);
        // Pinto la onda
        this.bufferCanvas.context.stroke();
        // Actualizo la textura
        this.bufferCanvas.texture.needsUpdate = true;
    }
}