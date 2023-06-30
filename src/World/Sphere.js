import * as THREE from "three"
import Experience from "../Experience";
import OsciloscopeCylinder from "./OsciloscopeCylinder.js"


export default class Sphere {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.time          = this.experience.time;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.world         = world;
        this.setup();
    }

    
    setup() {
        this.group = new THREE.Group();

        const rnd1 = Math.PI * 2.0 * Math.random() * 0.66;
        const rnd2 = Math.PI * 2.0 * Math.random() * 0.66;
        const rnd3 = Math.PI * 2.0 * Math.random() * 0.66;

        this.osciloscopeCylinder1 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(rnd1, 0, 0), "#ffff66");
        this.osciloscopeCylinder2 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(0, rnd2, 0), "#66ff66");
        this.osciloscopeCylinder3 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(0, 0, rnd3), "#6666ff");        

        this.geometry = new THREE.SphereGeometry( 0.1, 32, 16 ); 
        this.material = new THREE.MeshStandardMaterial({ 
            color : new THREE.Color("#b14444"),
            transparent : true,
            opacity : 0.85
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);

        this.group.position.set(0, 5, -10);
        this.scene.add(this.group);
    }


    update() {
        //
        const advance = this.time.delta / 1000;

        // make the perlin sun look at the camera
        //        this.groupLookAt.lookAt(this.experience.camera.instance.position);

        const high    = this.audioAnalizer.averageFrequency[0] / 255;
        const medium  = this.audioAnalizer.averageFrequency[1] / 255;
        const low     = this.audioAnalizer.averageFrequency[2] / 255;
//        const average = this.audioAnalizer.averageFrequency[3] / 255;

        //set the osciloscopecylinders scale
        this.osciloscopeCylinder1.mesh.scale.set(0.01 + high,
                                                0.01 + high,
                                                0.01 + high);
        this.osciloscopeCylinder2.mesh.scale.set(0.01 + high,
                                                0.01 + high,
                                                0.01 + high);
        this.osciloscopeCylinder3.mesh.scale.set(0.01 + high,
                                                0.01 + high,
                                                0.01 + high);

        // set the osciloscopecylinders line size
        const t = Math.abs(Math.sin(advance) * 0.5);
        this.osciloscopeCylinder1.material.uniforms.uSize.value = t * 0.25;
        this.osciloscopeCylinder2.material.uniforms.uSize.value = t * 0.66;
        this.osciloscopeCylinder3.material.uniforms.uSize.value = t * 1.52;

        // Rotate the osciloscopecylinder lightnings
        this.osciloscopeCylinder1.mesh.rotation.set(-this.osciloscopeCylinder1.mesh.rotation.x - (advance * high), 0, this.osciloscopeCylinder2.mesh.rotation.z - (advance * 0.66));
        this.osciloscopeCylinder2.mesh.rotation.set(this.osciloscopeCylinder2.mesh.rotation.x + (advance * medium), 0, this.osciloscopeCylinder2.mesh.rotation.z + (advance * 0.66));
        this.osciloscopeCylinder3.mesh.rotation.set(this.osciloscopeCylinder3.mesh.rotation.x + (advance * low), 0, this.osciloscopeCylinder3.mesh.rotation.z - advance);



        // Rotate the bars cylinder aura
        //        this.barsCylinder.mesh.rotation.set(0, this.barsCylinder.mesh.rotation.y + advance * (this.experience.debugOptions.barsCylinderRotation * (high + medium + low * 0.3)) * (1.0 - average), 0);
        //        this.barsCylinder.update();


        this.osciloscopeCylinder1.update();
        this.osciloscopeCylinder2.update();
        this.osciloscopeCylinder3.update();

        this.mesh.scale.set(25.0 * high, 25.0 * high, 25.0 * high);
    }
}