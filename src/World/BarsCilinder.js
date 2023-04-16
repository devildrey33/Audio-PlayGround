import BarsCylinderVertexShader from "../Shaders/Bars/Cylinder/BarsCylinderVertexShader.glsl"
import BarsCylinderFragmentShader from "../Shaders/Bars/Cylinder/BarsCylinderFragmentShader.glsl"
import Experience from "../Experience";
import * as THREE from 'three'

export default class BarsCilinder {
    constructor(world, group, color, color2) {
        this.experience = new Experience();
        this.world      = world;

        this.setup(group, color, color2);
    }

    setup(group, color, color2) {
        this.geometry = new THREE.CylinderGeometry(3, 2, 2, 32, 32, true);
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
            depthWrite      : false
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.name = "BarsCilinder";
        this.mesh.position.y = - 2.5;

        group.add(this.mesh);
    }

    update() {

    }
}
