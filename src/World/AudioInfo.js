import Experience from "../Experience";
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export default class AudioInfo {
    constructor(world) {
        this.experience = new Experience();
        this.scene      = this.experience.scene;
        this.world      = world;
        this.font  = this.experience.resources.items.jsonFont;

        this.material = new THREE.MeshStandardMaterial({ color : "#070707" });
        this.setup();
    }

    setup() {
        if (typeof this.geometry !== "undefined") {
            this.scene.remove(this.mesh);            
        }

        this.geometry = new TextGeometry(this.experience.song.name + "\n" + this.experience.song.group, {
            font : this.font,
            size : 1,
            height : 0.01,
            curveSegments: 4,
            bevelThickness: 0.02,
            bevelSize: 0.05,
            bevelEnabled: true
        });

        this.geometry.computeBoundingBox();

        const centerOffset = - 0.5 * ( this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x );

        this.mesh = new THREE.Mesh( this.geometry,  this.material);        
        this.mesh.position.x = centerOffset;
        this.mesh.position.z = 7;
        this.mesh.position.y = -1;
        this.mesh.name = "AudioInfo";
        this.scene.add(this.mesh);
    }

    changeText(newText) {

    }
}