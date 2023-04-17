import BarsCylinderVertexShader from "../Shaders/Bars/Cylinder/BarsCylinderVertexShader.glsl"
import BarsCylinderFragmentShader from "../Shaders/Bars/Cylinder/BarsCylinderFragmentShader.glsl"
import DepthVertexShader from "../Shaders/DepthVertexShader.glsl"
import BarsCylinderDepthFragmentShader from "../Shaders/Bars/Cylinder/BarsCylinderDepthFragmentShader.glsl"
import Experience from "../Experience";
import * as THREE from 'three'

export default class BarsCilinder {
    constructor(world, group, color, color2) {
        this.experience = new Experience();
        this.time       = this.experience.time;
        this.world      = world;

        this.setup(group, color, color2);
    }

    setup(group, color, color2) {
        this.geometry = new THREE.CylinderGeometry(4, 2, 4, 32, 32, true);
        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.world.frequencyTexture.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.osciloscopeCylinderAudioStrength },
                uSize          : { value : this.experience.debugOptions.osciloscopeCylinderLineSize },
                uColor         : { value : new THREE.Color(color) },
                uColor2        : { value : new THREE.Color(color2) },
                uHover         : { value : 0.0 },
                uTime          : { value : 0.0 }
            },
            vertexShader    : BarsCylinderVertexShader,
            fragmentShader  : BarsCylinderFragmentShader,
            transparent     : true,
            side            : THREE.DoubleSide,
            depthWrite      : false,
//            blending        : THREE.AdditiveBlending,
            blendDst        : THREE.NoBlending
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = this.experience.debugOptions.shadows;
        this.mesh.name = "BarsCilinder";
        this.mesh.position.y = - 2.5;

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

//        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0.0 }, uHover : { value : 0.0 }};
        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.world.frequencyTexture.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.circularAudioStrength };
            shader.vertexShader            = DepthVertexShader;
            shader.fragmentShader          = BarsCylinderDepthFragmentShader;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }        


        group.add(this.mesh);
    }

    
    update() {
        this.material.uniforms.uTime.value         += this.time.delta / 1000;
    }
}
