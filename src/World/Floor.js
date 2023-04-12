import * as THREE from 'three'
import Experience from "../Experience";
//import FloorVertexShader from "../Shaders/Floor/FloorVertexShader.glsl"
import FloorStandardVertexShader from "../Shaders/Floor/FloorStandardVertexShader.glsl"
//import FloorFragmentShader from "../Shaders/Floor/FloorFragmentShader.glsl"

export default class Floor {
    constructor(world) {
        this.experience   = new Experience();
        this.scene        = this.experience.scene;
        this.time         = this.experience.time;
        this.world        = world;
        this.setup();
    }

    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }

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
                this.material.uniforms = shader.uniforms;
            },
            color         : new THREE.Color("#0505e0"),
            wireframe     : false,
            side          : THREE.DoubleSide,
            transparent   : true,
            opacity       : .8 ,
/*            alphaTest     : 0.1,
            shadowSide    : THREE.FrontSide*/

        });        
/*
        this.materialWire = new THREE.MeshStandardMaterial({
            // Replace vertex shader and add more uniforms
            onBeforeCompile : (shader) => {
                // Add uniforms
                shader.uniforms.uAudioTexture  = { value : this.world.frequencyTexture.bufferCanvasSquare.texture };
                shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.barsAudioStrength };
                shader.uniforms.uTime          = { value : 0 }
                // New vertex shader
                shader.vertexShader = FloorStandardVertexShader;                
                this.materialWire.uniforms = shader.uniforms;
            },
            color         : new THREE.Color("#990000"),
            wireframe     : true,
            side          : THREE.DoubleSide,
        });        

/*        this.materialWire = this.material.clone();
        this.materialWire.wireframe = true;
        this.materialWire.color = new THREE.Color("#990000");*/

        
        // Solid mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = - Math.PI * 0.5
        this.mesh.position.y = -8.00;
        this.mesh.position.z = -12.00;
        this.mesh.name = "Floor";
        this.mesh.receiveShadow = true;
        //this.mesh.castShadow    = true;
/*
        this.meshWire = new THREE.Mesh(this.geometry, this.materialWire);
        this.meshWire.rotation.x = - Math.PI * 0.5
        this.meshWire.position.y = -4.98;*/

        this.scene.add(this.mesh);

    }

    update() {
        if (typeof this.material.uniforms !== "undefined") {
            this.material.uniforms.uTime.value     += this.time.delta / 1000;
//            this.materialWire.uniforms.uTime.value += this.time.delta / 1000;
        }
//        console.log(this.time.delta);
    }
}