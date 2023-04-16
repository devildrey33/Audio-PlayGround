import * as THREE from 'three'
import Experience from "../Experience";
//import FloorVertexShader from "../Shaders/Floor/FloorVertexShader.glsl"
import FloorStandardVertexShader from "../Shaders/Floor/FloorStandardVertexShader.glsl"
import FloorStandardFragmentShader from "../Shaders/Floor/FloorStandardFragmentShader.glsl"
import FloorDepthVertexShader from "../Shaders/Floor/FloorDepthVertexShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"

export default class Floor {
    constructor(world) {
        this.experience   = new Experience();
        this.scene        = this.experience.scene;
        this.time         = this.experience.time;
        this.world        = world;
        this.setup();
    }
/*
    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }*/

    setup() {
        this.geometry = new THREE.PlaneGeometry(32, 32, 32, 32);
        //this.geometry = new THREE.BoxGeometry(32, 1, 32, 32, 1, 32);
        /* 
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasSquare.texture },
                uAudioStrength : { value : this.experience.debugOptions.floorAudioStrength },
                uTime          : { value : 0 }
            },
            vertexShader    : FloorVertexShader,
            fragmentShader  : FloorFragmentShader, 
            wireframe       : true
        });*/

        this.material = new THREE.MeshStandardMaterial({
            // Replace vertex shader and add more uniforms
            onBeforeCompile : (shader) => {
                // Add uniforms
                shader.uniforms.uAudioTexture  = { value : this.world.frequencyTexture.bufferCanvasSquare.texture };
                shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.floorAudioStrength };
                shader.uniforms.uTime          = { value : 0 }
                
                // New vertex shader
                shader.vertexShader = FloorStandardVertexShader;                
                // New fragment shader
                shader.fragmentShader = FloorStandardFragmentShader;
                // Make uniforms visible in the material
                this.material.uniforms = shader.uniforms;
            },
            color         : new THREE.Color("#0505e0"),
            wireframe     : false,
            side          : THREE.DoubleSide,
            transparent   : true,
            opacity       : 1,
/*            alphaTest     : 0.1,
            shadowSide    : THREE.FrontSide*/

        });        

        
        // Solid mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = - Math.PI * 0.5
        this.mesh.position.y = -8.00;
        this.mesh.position.z = -12.00;
        this.mesh.name = "Floor";
        this.mesh.receiveShadow = this.experience.debugOptions.shadows;
        this.mesh.castShadow    = this.experience.debugOptions.shadows;

        // Custom depth material
/*        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.world.frequencyTexture.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.osciloscopeAudioStrength };
            shader.uniforms.uTime          = { value : 0 };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = FloorDepthVertexShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }*/



        this.scene.add(this.mesh);

    }

    update() {
        if (typeof this.material.uniforms !== "undefined") {
            this.material.uniforms.uTime.value     += this.time.delta / 1000;
        }
//        console.log(this.time.delta);
    }
}