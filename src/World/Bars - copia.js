import Experience from "../Experience";
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export default class Bars {
    
    constructor() {
        this.experience      = new Experience();
        this.fftSize         = this.experience.audioAnalizer.analizer.fftSize;
        this.scene           = this.experience.scene;
        this.data            = this.experience.audioAnalizer.analizerData;

        this.createBars(128,1);
    }

    createBars(width, height) {
/*        if (typeof(this.barsGroup) === "object") {
            this.scene.remove(this.barsGroup);
        }

/*        this.barsGroup = new THREE.Group();
        this.barsGroup.position.z = 2.5;
        this.scene.add(this.barsGroup);*/
//        this.bars  = [];
        let   size       = 1;

        this.cubeGeometries = [];
        this.cubeMaterial = new THREE.MeshStandardMaterial({color : new THREE.Color("rgb(128,128,128)")});

//        let counter = 0;

        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const geometry = new THREE.BoxGeometry(0.09, 0.1, 0.09);

                const nx = (-(width * 0.5) + x) * 0.1;
                const nz = (-(height * 0.5) + z) * 0.1;

                geometry.translate(nx, 0, nz);

                this.cubeGeometries.push(geometry);
            }
        }

        this.mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(this.cubeGeometries);

        this.bars = new THREE.Mesh(this.mergedGeometry, this.cubeMaterial);
//        bar.position.set(nx, 0, nz);
        this.bars.castShadow = true;
//        this.bars.receiveShadow = true;
//        this.bars[counter] = bar;

//        this.barsGroup.add(this.bars[counter++]);
        this.scene.add(this.bars);

        console.log(this.mergedGeometry);

    }

    /*createBars2(width, height) {
        if (typeof(this.barsGroup) === "object") {
            this.scene.remove(this.barsGroup);
        }

        this.barsGroup = new THREE.Group();
        this.barsGroup.position.z = 2.5;
        this.scene.add(this.barsGroup);
        this.bars  = [];
//        this.peaks = [];

//        const sideLength = 32; // cubes per side of the square 32 * 32 = 1024
        let   size       = 1;

        this.cubeGeometry = new THREE.BoxGeometry(0.09, 0.1, 0.09);
        this.cubeMaterial = new THREE.MeshStandardMaterial({color : new THREE.Color("rgb(128,128,128)")});
        let counter = 0;

        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const nx = (-(width * 0.5) + x) * 0.1;
                const nz = (-(height * 0.5) + z) * 0.1;

                const bar = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
                bar.position.set(nx, 0, nz);
                bar.castShadow = true;
                bar.receiveShadow = true;
                this.bars[counter] = bar;

                this.barsGroup.add(this.bars[counter++]);

            }
        }
        console.log("total bars " + counter)
    }*/

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