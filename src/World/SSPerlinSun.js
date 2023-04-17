import Experience from "../Experience";
import SSPerlinSunVertexShader from "../Shaders/PerlinSun/SS/SSPerlinSunVertexShader.glsl"
import PerlinSunVertexShader from "../Shaders/PerlinSun/PerlinSunVertexShader.glsl"
import PerlinSunFragmentShader from "../Shaders/PerlinSun/PerlinSunFragmentShader.glsl"
import SSPerlinSunFragmentShader from "../Shaders/PerlinSun/SS/SSPerlinSunFragmentShader.glsl"
import PerlinSunDepthFragmentShader from "../Shaders/PerlinSun/PerlinSunDepthFragmentShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"
import * as THREE from "three"
import OsciloscopeCylinder from "./OsciloscopeCylinder.js"
import BarsCilinder from "./BarsCilinder";

export default class SSPerlinSun {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.time          = this.experience.time;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.world         = world;
        this.setup();
        this.setupOsciloscopeCylinder();
        this.setupBarsCylinder();
    }

    setup() {        
        this.group = new THREE.Group();
        this.groupLookAt = new THREE.Group();

        this.geometry = new THREE.PlaneGeometry(7, 7);

//        console.log(this.experience.debugOptions.perlinSunColorFrequency);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture   : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uTime           : { value : 0 },
                uAlpha          : { value : this.experience.debugOptions.perlinSunAlpha },
                uRotate         : { value : 1.0 },
                uHover          : { value : 0.0 },
                uColorFrequency : { value : this.experience.debugOptions.perlinSunColorFrequency },
                uColorSin       : { value : this.experience.debugOptions.perlinSunColorSin }
            },
            vertexShader    : PerlinSunVertexShader,
            fragmentShader  : SSPerlinSunFragmentShader,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthFunc       : THREE.AlwaysDepth,
            depthWrite      : false,
            renderOrder     : 1,
//            blending        : THREE.AdditiveBlending

        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
//        this.mesh.rotation.z = -Math.PI;
        this.mesh.rotation.z = -Math.PI * 0.5;
/*        this.mesh.position.y = 0;
        this.mesh.position.x = -12;
        this.mesh.position.z = -2;*/
        this.mesh.name = "SSPerlinSun";
        this.mesh.castShadow =  this.experience.debugOptions.shadows;
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture   = { value : this.world.frequencyTexture.bufferCanvasLinear.texture };
            shader.uniforms.uTime           = { value : 0 };
            shader.uniforms.uAlpha          = { value : this.experience.debugOptions.perlinSunAlpha };
            shader.uniforms.uRotate         = { value : 1.0 };
            shader.uniforms.uHover          = { value : 0.0 };
            shader.uniforms.uColorFrequency = { value : this.experience.debugOptions.perlinSunColorFrequency };
            shader.uniforms.uColorSin       = { value : this.experience.debugOptions.perlinSunColorSin };

            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = PerlinSunDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }
        
        
        this.groupLookAt.add(this.mesh);
        this.group.add(this.groupLookAt);
        this.group.position.set(-12, 4, -5);

        this.scene.add(this.group);

    }


    setupOsciloscopeCylinder() {
        const rnd1 = Math.PI * 2.0 * Math.random() * 0.66;
        const rnd2 = Math.PI * 2.0 * Math.random() * 0.66;
        const rnd3 = Math.PI * 2.0 * Math.random() * 0.66;

        this.osciloscopeCylinder1 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(rnd1, 0, 0), "#ff6666");
        this.osciloscopeCylinder2 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(0, rnd2, 0), "#66ff66");
        this.osciloscopeCylinder3 = new OsciloscopeCylinder(this.world, this.group, new THREE.Vector3(0, 0, rnd3), "#6666ff");
        
    }

    setupBarsCylinder() {
        this.barsCylinder = new BarsCilinder(this.world, this.group, "#0000ff", "#ff0000");
    }


    update() {
        // Divided by 1024 to get values from 0.0 to 0.25
//        this.material.uniforms.uHighFrequency.value = this.audioAnalizer.averageFrequency[0] / 255;
//        this.material.uniforms.uLowFrequency.value  = this.audioAnalizer.averageFrequency[2] / 255;
//        this.material.uniforms.uColorStrength.value = 0.125 + this.audioAnalizer.averageFrequency[2] / 192;
        const advance = this.time.delta / 1000;
        this.material.uniforms.uTime.value         += advance;   
        
        this.groupLookAt.lookAt(this.experience.camera.instance.position);
        //this.mesh.rotation.z = -Math.PI * 0.5;
        
        const high    = this.audioAnalizer.averageFrequency[0] / 255;
        const medium  = this.audioAnalizer.averageFrequency[1] / 255;
        const low     = this.audioAnalizer.averageFrequency[2] / 255;
        const average = this.audioAnalizer.averageFrequency[3] / 255;
        this.osciloscopeCylinder1.mesh.scale.set(0.01 + high,
                                                 0.01 + high,
                                                 0.01 + high);
        this.osciloscopeCylinder2.mesh.scale.set(0.1 + medium,
                                                 0.1 + medium,
                                                 0.1 + medium);
        this.osciloscopeCylinder3.mesh.scale.set(0.2 + low,
                                                 0.2 + low,
                                                 0.2 + low);


        const t = Math.abs(Math.sin(this.material.uniforms.uTime.value) * 0.05);
        this.osciloscopeCylinder1.material.uniforms.uSize.value = t * 0.75;
        this.osciloscopeCylinder2.material.uniforms.uSize.value = t * 0.66;
        this.osciloscopeCylinder3.material.uniforms.uSize.value = t * 0.52;


        this.osciloscopeCylinder1.mesh.rotation.set(-this.osciloscopeCylinder1.mesh.rotation.x - (advance * 0.33), 0, -this.osciloscopeCylinder2.mesh.rotation.z - (advance * 0.66));
        this.osciloscopeCylinder2.mesh.rotation.set(this.osciloscopeCylinder2.mesh.rotation.x + (advance * 0.66), 0, this.osciloscopeCylinder2.mesh.rotation.z + (advance * 0.66));
        this.osciloscopeCylinder3.mesh.rotation.set(this.osciloscopeCylinder3.mesh.rotation.x + advance, 0, -this.osciloscopeCylinder3.mesh.rotation.z - advance);

        this.barsCylinder.mesh.rotation.set(0, this.barsCylinder.mesh.rotation.y + advance * 1.15 * (1.0 - average), 0);

        this.osciloscopeCylinder1.update();
        this.osciloscopeCylinder2.update();
        this.osciloscopeCylinder3.update();

        this.barsCylinder.update();
    }
}