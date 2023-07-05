import * as THREE from "three"
import Experience from "../Experience";
//import OsciloscopeCylinder from "./OsciloscopeCylinder.js"
import SphereSinStandardVertextShader from "../Shaders/Sphere/SphereSinStandardVertexShader.glsl"
import SphereSinDepthVertexShader from "../Shaders/Sphere/SphereSinDepthVertexShader.glsl"

export default class SphereSin {
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
                shader.uniforms.uAudioStrength   = { value : this.experience.debugOptions.sphereSinAudioStrength };
                shader.uniforms.uAudioZoom       = { value : this.experience.debugOptions.sphereSinAudioZoom },
                shader.uniforms.uTime            = { value : 0 }
                shader.uniforms.uHover           = { value : 0.0 }
                // New fragment shader
                shader.vertexShader = SphereSinStandardVertextShader;
                // Make uniforms visible in the material
                this.material.uniforms = shader.uniforms;                
            },
            color : new THREE.Color("#95ca72"),
            emissive : new THREE.Color("#000000"),
            roughness : 0.4,
            metalness : .1,
//            wireframe : true
/*            transparent : true,
            opacity : 0.85*/
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.y = -Math.PI * 0.5;        
        this.mesh.name = "SphereSin";

        this.mesh.position.set(5, 3, -10);

        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Create a pseudo uniforms before depth material is compiled, to not crash the update function
        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0 } };
        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioStrength  = { value : this.experience.debugOptions.sphereSinAudioStrength };
            shader.uniforms.uAudioZoom      = { value : this.experience.debugOptions.sphereSinAudioZoom };
            shader.uniforms.uAudioTexture   = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uTime           = { value : 0 };

            shader.vertexShader            = SphereSinDepthVertexShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }


        this.scene.add(this.mesh);
    }


    update() {
        //
//        const advance = this.time.delta / 1000;
//        this.mesh.rotateY(-advance * 1.15);
    }
}