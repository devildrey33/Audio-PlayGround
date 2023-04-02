import * as THREE from 'three'
import Experience from "../Experience";
import FloorVertexShader from "../Shaders/Floor/planeVertexShader.glsl"
import FloorFragmentShader from "../Shaders/Floor/planeFragmentShader.glsl"

export default class Floor {
    constructor(world) {
        this.experience   = new Experience();
        this.scene        = this.experience.scene;
//        this.audioTexture = new THREE.CanvasTexture(this.experience.audioAnalizer.bufferCanvas.canvas);
        this.time         = this.experience.time;
        this.world        = world;
        this.setup();
    }


    setup() {
        this.geometry = new THREE.PlaneGeometry(32, 32, 32, 32);
        
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasSquare.texture },
                uAudioStrength : { value : this.experience.debugOptions.floorAudioStrength },
                uTime          : { value : 0 }
            },
            vertexShader    : FloorVertexShader,
            fragmentShader  : FloorFragmentShader, 
            wireframe       : true
        });
/*
        this.material = new THREE.MeshStandardMaterial({
            color : new THREE.Color(0x35294d), //0x232323
            metalness : 2.5,
            roughness : .4,
            wireframe : true,
            onBeforeCompile : (material) => {
                console.log(material);

                material.uniforms.uAudioTexture = { value : this.audioTexture }

                material.vertexShader = 'uniform sampler2D uAudioTexture;\n' +
                material.vertexShader.replace("}", `
                    vec4 textureColor = texture2D(uAudioTexture, uv);
                    gl_Position.y += textureColor.r * 50.0;
                }`);

            }
        });*/
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = - Math.PI * 0.5
//        this.mesh.receiveShadow = true;
        this.mesh.position.y = -5.050;
        this.scene.add(this.mesh);


/*        this.geometry2 = new THREE.PlaneGeometry(3, 3);
        this.material2 = new THREE.MeshBasicMaterial({ map: this.audioTexture });
        this.plane = new THREE.Mesh(this.geometry2, this.material2);       
        this.plane.material.side = THREE.DoubleSide;
        this.plane.position.y += 3;
        
        this.scene.add(this.plane);*/
    }

    update() {
        this.material.uniforms.uTime.value += this.time.delta;
    }
}