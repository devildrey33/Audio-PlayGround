import Experience from "../Experience";
import * as THREE from 'three'

export default class Bars {
    
    constructor() {
        this.experience      = new Experience();
        this.fftSize         = this.experience.audioAnalizer.analizer.fftSize;
        this.scene           = this.experience.scene;
        this.data            = this.experience.audioAnalizer.analizerData;

        this.createBars(128,1);
    }

    createBars(width, height) {
        if (typeof(this.barsGroup) === "object") {
            this.scene.remove(this.barsGroup);
        }

        this.barsGroup = new THREE.Group();
        this.barsGroup.position.z = 2.5;
        this.scene.add(this.barsGroup);
        this.bars  = [];

        let   size       = 1;

        this.cubeGeometry = new THREE.BoxGeometry(0.09, 0.1, 0.09);
        // Ajusto la Y para que al escalar solo escale hacia arriba y la parte baja del cubo se quede siempre en Y0
        // Para ello ajusto la Y a 0.05 que es la mitad de la altura inicial del cubo
        this.cubeGeometry.translate(0, 0.05, 0);
        this.cubeMaterial = new THREE.MeshBasicMaterial({ color : new THREE.Color("rgb(10,10,90)"), transparent : true, opacity : 0.95 });
/*
#1655BF
#0583D2
#61B0B7
#B8E3FF
 */
        let counter = 0;

        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const nx = (-(width * 0.5) + x) * 0.1;
                const nz = (-(height * 0.5) + z) * 0.1;
                const bar = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
                bar.position.set(nx, 0, nz);
                bar.castShadow = true;
//                bar.receiveShadow = true;
                this.bars[counter] = bar;
                this.barsGroup.add(this.bars[counter++]);

            }
        }
        console.log("total bars " + counter)
    }

    // Updates the bars using the analizer data
    update() {
        for (let i = 0; i < this.bars.length; i++) {
            
            let aprox = ((this.fftSize / 4) / this.bars.length);

            const scale = 1 + (Math.abs(this.data[Math.round(i * aprox)]) * 0.05);
            this.bars[i].scale.y    = scale;
        }
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}