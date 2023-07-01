import * as THREE from "three"
import Experience from "../Experience";
//import OsciloscopeCylinder from "./OsciloscopeCylinder.js"
import SphereStandardVertextShader from "../Shaders/Sphere/SphereStandardVertexShader.glsl"

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
/*        this.group = new THREE.Group();

        const rnd1 = Math.PI * 2.0 * Math.random() * 0.66;
        const rnd2 = Math.PI * 2.0 * Math.random() * 0.66;
        const rnd3 = Math.PI * 2.0 * Math.random() * 0.66;

        this.osciloscopeCylinder1 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(rnd1, 0, 0), "#ffff99");
        this.osciloscopeCylinder2 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(0, rnd2, 0), "#99ff99");
        this.osciloscopeCylinder3 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(0, 0, rnd3), "#9999ff");        */

        this.geometry = new THREE.SphereGeometry( 1, 64, 64 ); 
        this.material = new THREE.MeshStandardMaterial({ 
            // Replace vertex shader and add more uniforms
            onBeforeCompile : (shader) => {
                // Add uniforms
                shader.uniforms.uAudioTexture    = { value : this.audioAnalizer.bufferCanvasSquare.texture };
                shader.uniforms.uAudioStrength   = { value : this.experience.debugOptions.sphereAudioStrength };
                shader.uniforms.uAudioZoom       = { value : this.experience.debugOptions.sphereAudioZoom },
                shader.uniforms.uTime            = { value : 0 }
                // New fragment shader
                shader.vertexShader = SphereStandardVertextShader;
                // Make uniforms visible in the material
                this.material.uniforms = shader.uniforms;                
            },
            color : new THREE.Color("#b14444"),
            emissive : new THREE.Color("#000000"),
            roughness : 0.2,
            metalness : .3,
//            wireframe : true
/*            transparent : true,
            opacity : 0.85*/
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.y = -Math.PI * 0.5;        

        this.mesh.position.set(0, 3, -10);
        this.scene.add(this.mesh);
/*        this.group.add(this.mesh);

        this.group.position.set(0, 5, -10);
        this.scene.add(this.group);*/
    }


    update() {
        //
        const advance = this.time.delta / 1000;
/*
        // make the perlin sun look at the camera
        //        this.groupLookAt.lookAt(this.experience.camera.instance.position);

        const high    = this.audioAnalizer.averageFrequency[0] / 255;
        const medium  = this.audioAnalizer.averageFrequency[1] / 255;
        const low     = this.audioAnalizer.averageFrequency[2] / 255;*/
//        const average = this.audioAnalizer.averageFrequency[3] / 255;

        //set the osciloscopecylinders scale
   /*     this.osciloscopeCylinder1.mesh.scale.set(0.01 + high,
                                                0.01 + high,
                                                0.01 + high);
        this.osciloscopeCylinder2.mesh.scale.set(0.01 + high,
                                                0.01 + high,
                                                0.01 + high);
        this.osciloscopeCylinder3.mesh.scale.set(0.01 + high,
                                                0.01 + high,
                                                0.01 + high);*/

        // set the osciloscopecylinders line size
/*        const t = Math.abs(Math.sin(advance) * 0.5);
        this.osciloscopeCylinder1.material.uniforms.uSize.value = t * 0.25;
        this.osciloscopeCylinder2.material.uniforms.uSize.value = t * 0.66;
        this.osciloscopeCylinder3.material.uniforms.uSize.value = t * 1.52;

        // Rotate the osciloscopecylinder lightnings
        this.osciloscopeCylinder1.mesh.rotation.set(-this.osciloscopeCylinder1.mesh.rotation.x - (advance * high), 0, this.osciloscopeCylinder2.mesh.rotation.z - (advance * 0.66));
        this.osciloscopeCylinder2.mesh.rotation.set(this.osciloscopeCylinder2.mesh.rotation.x + (advance * medium), 0, this.osciloscopeCylinder2.mesh.rotation.z + (advance * 0.66));
        this.osciloscopeCylinder3.mesh.rotation.set(this.osciloscopeCylinder3.mesh.rotation.x + (advance * low), 0, this.osciloscopeCylinder3.mesh.rotation.z - advance);

*/

        // Rotate the bars cylinder aura
        //        this.barsCylinder.mesh.rotation.set(0, this.barsCylinder.mesh.rotation.y + advance * (this.experience.debugOptions.barsCylinderRotation * (high + medium + low * 0.3)) * (1.0 - average), 0);
        //        this.barsCylinder.update();

/*
        this.osciloscopeCylinder1.update();
        this.osciloscopeCylinder2.update();
        this.osciloscopeCylinder3.update();
*/

        // Scale of the main sphere
//        this.mesh.scale.set(5 + 10.0 * high, 5 + 10.0 * high, 5 + 10.0 * high);
        this.mesh.rotateY(advance * 1.15);
/*        this.mesh.rotateX(advance * .72);
        this.mesh.rotateZ(advance * 1.61);*/
        // update time for sphere perlin noise
    /*    if (typeof this.material.uniforms !== "undefined") {
            this.material.uniforms.uTime.value         += this.time.delta / 1000;    
        }*/
    }
}