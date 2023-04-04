import Experience from "../Experience";
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default class Bars {
    
    constructor() {
        this.experience      = new Experience();
        this.fftSize         = this.experience.audioAnalizer.analizer.fftSize;
        this.scene           = this.experience.scene;
        this.data            = this.experience.audioAnalizer.analizerData;
        
        // Could be a square but makes no sense with the floor
        this.createBars(256,1);
    }

    createBars(width, height) {
        if (typeof(this.bars) !== "undefined") {
            this.scene.remove(this.bars);
            this.mergedGeometry.dispose();
            this.cubeMaterial.dispose();
        }

        let   size       = 1;

        this.cubeGeometries = [];
        this.cubeMaterial = new THREE.MeshBasicMaterial({ 
            color       : new THREE.Color("rgb(10,10,90)"),
            transparent : true
        });

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

        this.mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(this.cubeGeometries);

        // clear cube geometries used to create the merged geometry
        for (let i = 0; i < this.cubeGeometries.length; i++) {
            this.cubeGeometries[i].dispose();
        }

        this.bars = new THREE.Mesh(this.mergedGeometry, this.cubeMaterial);
//        this.bars.castShadow = true;
//       this.bars.receiveShadow = true;

        this.bars.position.z += 3;
        this.scene.add(this.bars);

    }

    // Updates the bars using the analizer data
    update() {
        for (let i = 0; i < this.cubeGeometries.length; i++) {
            
            let aprox = ((this.fftSize / 4) / this.cubeGeometries.length);

            const scale = (1 + (Math.abs(this.data[Math.round(i * aprox)]) / 7.5)) * 0.05;
//            console.log(scale);

            this.mergedGeometry.attributes.position.array[(i * 72) + 1] = scale; // y
            this.mergedGeometry.attributes.position.array[(i * 72) + 4] = scale; // y

            this.mergedGeometry.attributes.position.array[(i * 72) + 13] = scale; // y
            this.mergedGeometry.attributes.position.array[(i * 72) + 16] = scale; // y

            this.mergedGeometry.attributes.position.array[(i * 72) + 49] = scale; // y
            this.mergedGeometry.attributes.position.array[(i * 72) + 52] = scale; // y

            this.mergedGeometry.attributes.position.array[(i * 72) + 61] = scale; // y
            this.mergedGeometry.attributes.position.array[(i * 72) + 64] = scale; // y

            this.mergedGeometry.attributes.position.array[(i * 72) + 25] = scale; // y
            this.mergedGeometry.attributes.position.array[(i * 72) + 28] = scale; // y

            this.mergedGeometry.attributes.position.array[(i * 72) + 31] = scale; // y
            this.mergedGeometry.attributes.position.array[(i * 72) + 34] = scale; // y

        }
        this.mergedGeometry.attributes.position.needsUpdate = true;
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}