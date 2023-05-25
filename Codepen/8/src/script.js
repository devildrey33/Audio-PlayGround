import FloorStandardVertexShader from "./Shaders/FloorStandardVertexShader.glsl"
import FloorStandardFragmentShader from "./Shaders/FloorStandardFragmentShader.glsl"
import FloorDepthVertexShader from "./Shaders/FloorDepthVertexShader.glsl"
import DepthVertexShader from "./Shaders/DepthVertexShader.glsl"
import SSPerlinSunDepthFragmentShader from "./Shaders/SSPerlinSunDepthFragmentShader.glsl"
import SSPerlinSunFragmentShader from "./Shaders/SSPerlinSunFragmentShader.glsl"
import SSPerlinSunVertexShader from "./Shaders/SSPerlinSunVertexShader.glsl"

import CodepenThreeAudio from "./CodepenThreeAudio.js";
import * as THREE from 'three'
import * as lil from 'lil-gui'


class PerlinSun extends CodepenThreeAudio {
    // lil.gui data
    perlinSunOptions = {
        audioStrengthFloor         : 6,
        audioStrengthFreq          : 1,
        audioStrengthSin           : 1,
        radiusFreq                 : 0.4,
        radiusSin                  : 0.25,
        ssPerlinSunNoiseStrength   : 31,
        ssPerlinSunNoiseSpeed      : 1
    }
    
    // Main
    constructor() {
        // Call CodepenThreeAudio constructor
        super();

        // Setup the scene 
        this.setupScene();

        // Setup lil.gui values
        this.setupDebug();
    }

    /*
     * Setup world objects
     */ 
    setupScene() {                
        /*
         * Floor
         */
        this.geometryFloor = new THREE.PlaneGeometry(32, 32, 32, 32);    
        this.materialFloor = new THREE.MeshStandardMaterial({
            // Replace vertex shader and add more uniforms
            onBeforeCompile : (shader) => {
                // Add uniforms
                shader.uniforms.uAudioTexture  = { value : this.bufferCanvasSquare.texture };
                shader.uniforms.uAudioStrength = { value : this.perlinSunOptions.audioStrengthFloor };
                
                // New vertex shader
                shader.vertexShader = FloorStandardVertexShader;                
                // New fragment shader
                shader.fragmentShader = FloorStandardFragmentShader;
                // Make uniforms visible in the material
                this.materialFloor.uniforms = shader.uniforms;
            },
            color         : new THREE.Color("#0505e0"),
//            wireframe     : true,
            side          : THREE.DoubleSide,
            transparent   : true,
            opacity       : 1,
        });        

        
        // Solid mesh
        this.floor = new THREE.Mesh(this.geometryFloor, this.materialFloor);
        this.floor.rotation.x = - Math.PI * 0.5
        this.floor.position.y = -8.00;
        this.floor.position.z = -12.00;
        this.floor.name = "Floor";
        this.floor.receiveShadow = true;
        this.floor.castShadow    = true;

        // Custom depth material
        this.floor.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.floor.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.bufferCanvasSquare.texture };
            shader.uniforms.uAudioStrength = { value : this.perlinSunOptions.audioStrengthFloor };
            shader.vertexShader            = FloorDepthVertexShader;
            this.floor.customDepthMaterial.uniforms = shader.uniforms;
        }
        this.scene.add(this.floor);






        this.group = new THREE.Group();
        this.groupLookAt = new THREE.Group();

        this.geometry = new THREE.PlaneGeometry(7, 7);

//        console.log(this.experience.debugOptions.perlinSunColorFrequency);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture      : { value : this.bufferCanvasLinear.texture },
                uAudioStrengthFreq : { value : this.perlinSunOptions.audioStrengthFreq },
                uAudioStrengthSin  : { value : this.perlinSunOptions.audioStrengthSin },
                uRadiusFreq        : { value : this.perlinSunOptions.radiusFreq },
                uRadiusSin         : { value : this.perlinSunOptions.radiusSin },
                uTime              : { value : 0 },
                uNoiseStrength     : { value : this.perlinSunOptions.ssPerlinSunNoiseStrength },
                uNoiseSpeed        : { value : this.perlinSunOptions.ssPerlinSunNoiseSpeed }
            },
            vertexShader    : SSPerlinSunVertexShader,
            fragmentShader  : SSPerlinSunFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthFunc       : THREE.AlwaysDepth,
            depthWrite      : false,
//            blending        : THREE.AdditiveBlending

        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = -Math.PI * 0.5;
        this.mesh.name = "SSPerlinSun";
        this.mesh.castShadow =  true;
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Create a pseudo uniforms before depth material is compiled, to not crash the update function
        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0 } };

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture      = { value : this.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrengthFreq = { value : this.perlinSunOptions.audioStrengthFreq };
            shader.uniforms.uAudioStrengthSin  = { value : this.perlinSunOptions.audioStrengthSin };
            shader.uniforms.uRadiusFreq        = { value : this.perlinSunOptions.radiusFreq };
            shader.uniforms.uRadiusSin         = { value : this.perlinSunOptions.radiusSin };
            shader.uniforms.uTime              = { value : 0 };
            shader.uniforms.uNoiseStrength     = { value : this.perlinSunOptions.ssPerlinSunNoiseStrength }
            shader.uniforms.uNoiseSpeed        = { value : this.perlinSunOptions.ssPerlinSunNoiseSpeed }
            shader.vertexShader                = DepthVertexShader;
            shader.fragmentShader              = SSPerlinSunDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }
        
        
        this.groupLookAt.add(this.mesh);
        this.group.add(this.groupLookAt);
        this.group.position.set(0, 3, 0);

        this.scene.add(this.group);
        
        
        this.loading = false;
    }

    /*
    * Setup the lil.gui debug UI 
    */ 
    setupDebug() {
        this.ui = new lil.GUI();

        this.debugFreq = this.ui.addFolder("Frequency");
        this.debugSin = this.ui.addFolder("Sin");
        // Freq audio strength
        this.debugFreq.add(this.perlinSunOptions, "audioStrengthFreq").min(0.1).max(2).step(0.01).name("Freq audio strength").onChange(() => {
            this.material.uniforms.uAudioStrengthFreq.value = this.perlinSunOptions.audioStrengthFreq;
            this.mesh.customDepthMaterial.uniforms.uAudioStrengthFreq.value = this.perlinSunOptions.audioStrengthFreq;
        });                   
        // noise strength
        this.debugFreq.add(this.perlinSunOptions, "ssPerlinSunNoiseStrength").min(0.1).max(100).step(0.01).name("Noise strength").onChange(() => {
            this.material.uniforms.uNoiseStrength.value = this.perlinSunOptions.ssPerlinSunNoiseStrength;
            this.mesh.customDepthMaterial.uniforms.uNoiseStrength.value = this.perlinSunOptions.ssPerlinSunNoiseStrength;
        });            
        // noise speed
        this.debugFreq.add(this.perlinSunOptions, "ssPerlinSunNoiseSpeed").min(0.1).max(10).step(0.01).name("Noise speed").onChange(() => {
            this.material.uniforms.uNoiseSpeed.value = this.perlinSunOptions.ssPerlinSunNoiseSpeed;
            this.mesh.customDepthMaterial.uniforms.uNoiseSpeed.value = this.perlinSunOptions.ssPerlinSunNoiseSpeed;
        });       
        // redius
        this.debugFreq.add(this.perlinSunOptions, "radiusFreq").min(0.01).max(0.8).step(0.01).name("Radius").onChange(() => {
            this.material.uniforms.uRadiusFreq.value = this.perlinSunOptions.radiusFreq;
            this.mesh.customDepthMaterial.uniforms.uRadiusFreq.value = this.perlinSunOptions.radiusFreq;
        });       
        
        
        // Sin audio strength
        this.debugSin.add(this.perlinSunOptions, "audioStrengthSin").min(0.1).max(2).step(0.01).name("Sin audio strength").onChange(() => {
            this.material.uniforms.uAudioStrengthSin.value = this.perlinSunOptions.audioStrengthSin;
            this.mesh.customDepthMaterial.uniforms.uAudioStrengthSin.value = this.perlinSunOptions.audioStrengthSin;
        });           
        // redius
        this.debugSin.add(this.perlinSunOptions, "radiusSin").min(0.01).max(0.8).step(0.01).name("Radius").onChange(() => {
            this.material.uniforms.uRadiusSin.value = this.perlinSunOptions.radiusSin;
            this.mesh.customDepthMaterial.uniforms.uRadiusSin.value = this.perlinSunOptions.radiusSin;
        });       


        // Floor audio strength
        this.ui.add(this.perlinSunOptions, "audioStrengthFloor").min(0.1).max(10).step(0.01).name("Floor audio strength").onChange(() => {
            this.materialFloor.uniforms.uAudioStrength.value = this.perlinSunOptions.audioStrengthFloor;
            this.floor.customDepthMaterial.uniforms.uAudioStrength.value = this.perlinSunOptions.audioStrengthFloor;
        });            
        
        
                
        // Osciloscope audio zoom
/*        this.ui.add(this.perlinSunOptions, "audioZoom").min(1).max(16).step(0.1).name("Audio zoom").onChange(() => {
            this.material.uniforms.uAudioZoom.value = this.perlinSunOptions.audioZoom;
            this.mesh.customDepthMaterial.uniforms.uAudioZoom.value = this.perlinSunOptions.audioZoom;
        });            */
    }



    update(time, delta) {
        // update time on perlin sun
        this.material.uniforms.uTime.value += delta / 1000;   
        // update time on perlin sun shadow
        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;


        // make the perlin sun look at the camera
        this.groupLookAt.lookAt(this.camera.position);

    }
}

const newExample = new PerlinSun();