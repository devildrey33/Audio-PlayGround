import Experience from '../Experience.js'
import Bars from './Bars.js';
import Circular from './Circular.js';
import CircularDistorsion from './CircularDistorsion.js';
import CircularSin from './CircularSin.js';
import Environment from './Environment.js'
import Floor from './Floor.js';
import FrequencyTexture from './FrequencyTexture.js';
import Osciloscope from './Osciloscope.js';
import YinYang from './YinYang.js';
import YinYangSin from './YinYangSin.js';
import * as THREE from 'three'
import { gsap } from "gsap";
//import OsciloscopeSoft from './OsciloscopeSoft.js';

export default class World {
    constructor() {
        this.experience = new Experience();
        this.canvas     = this.experience.canvas;
        this.scene      = this.experience.scene;
        this.resources  = this.experience.resources;
        this.camera     = this.experience.camera.instance;
        this.sizes      = this.experience.sizes;
        // World ready
        this.ready      = false;
        // setup
        this.setup();                
    }

    setup() {
        // Objects of the scene
        this.frequencyTexture   = new FrequencyTexture();
        this.floor              = new Floor(this);
        this.bars               = new Bars(this);
        this.osciloscope        = new Osciloscope(this);
        this.circular           = new Circular(this);
        this.circularSin        = new CircularSin(this);
        this.circularDistorsion = new CircularDistorsion(this);
        this.yinYang            = new YinYang(this);
        this.yinYangSin         = new YinYangSin(this);

        // Last camera position
        this.lastCameraPosition = this.camera.position.clone();
        // Camera focus, if not free is one of the panels
        this.cameraFocus = "free";

        // Raycaster
        this.raycaster = new THREE.Raycaster();

        // Mouse
        this.mouse = new THREE.Vector2(0, 0);

        // Click event
        this.hEventClick = this.eventClick.bind(this);
        this.canvas.addEventListener("click", this.hEventClick);

        // Mouse move event
        this.hEventMouseMove = this.eventMouseMouve.bind(this);
        this.canvas.addEventListener("mousemove", this.hEventMouseMove);

        // Setup the objects
        this.objects = {
//            bars                : { name : "Bars"                , hover : false, material : this.bars.material }, },
            circular            : { name : "Circular"            ,hover : false, material : this.circular.material          , object : this.circular          , mesh : this.circular.mesh },
            circularSin         : { name : "CircularSin"         ,hover : false, material : this.circularSin.material       , object : this.circularSin       , mesh : this.circularSin.mesh },
            circularDistorsion  : { name : "CircularDistorsion"  ,hover : false, material : this.circularDistorsion.material, object : this.circularDistorsion, mesh : this.circularDistorsion.mesh },
//            floor               : { name : "Floor"               , hover : false, material : this.floor.material }, },
            frequencyTexture    : { name : "FrequencyTexture"    ,hover : false, material : this.frequencyTexture.materialR, object : this.frequencyTexture   , mesh : this.frequencyTexture.meshR },
            frequencyTextureSin : { name : "FrequencyTextureSin" ,hover : false, material : this.frequencyTexture.materialG, object : this.frequencyTexture   , mesh : this.frequencyTexture.meshG },
            osciloscope         : { name : "Osciloscope"         ,hover : false, material : this.osciloscope.material      , object : this.osciloscope        , mesh : this.osciloscope.mesh },
            yinYang             : { name : "YinYang"             ,hover : false, material : this.yinYang.material          , object : this.yinYang            , mesh : this.yinYang.mesh },
            yinYangSin          : { name : "YinYangSin"          ,hover : false, material : this.yinYangSin.material       , object : this.yinYangSin         , mesh : this.yinYangSin.mesh },
        }
        // last hover object name
        this.lastHover = "";
        this.hover     = "";

        // wait for resources
        this.resources.on('ready', () => {
            this.environment      = new Environment();
            this.ready            = true;
        });

        // hover animations with gsap
        
    }

    // Mouse move event
    eventMouseMouve(event) {
        this.mouse.x = event.clientX / this.sizes.width    * 2 - 1;
        this.mouse.y = - (event.clientY / this.sizes.height) * 2 + 1;
    }

    // Click event
    eventClick(event) {
        event.preventDefault();
        // Camera is free
        if (this.cameraFocus === "free") {
            if (this.hover !== "") {
                this.cameraFocus = this.hover;
                let position;
                let target;
                for (const object in this.objects) {
                    if (this.objects[object].name === this.hover) {
                        position = this.objects[object].mesh.position;
                    }
                }

                this.lastCameraPosition = this.camera.position.clone();
                console.log(position);
                // Camera position
                gsap.to(this.camera.position, {
                    duration : 0.5, 
                    x        : position.x ,
                    y        : position.y ,
                    z        : position.z + 8,
                    ease     : "ease-out",
                    onUpdate : () => {
                        this.experience.camera.controls.target.set(position.x, position.y, position.z);
//                        this.camera.lookAt(new THREE.Vector3(position.x, position.y, position.z + 10));
                        this.experience.camera.controls.update();
                    }
                });
                // Camera target 
/*                gsap.to(this.experience.camera.controls.target.position, {
                    duration : 0.5, 
                    x        : position.x,
                    y        : position.y,
                    z        : position.z,
                    ease     : "ease-out",
                    onUpdate : (g) => {
//                        this.experience.camera.controls.target.set(g.x, g.y, g.z);
                        this.experience.camera.controls.target.set(position.x, position.y, position.z);
//                        this.camera.lookAt(new THREE.Vector3(position.x, position.y, position.z + 10));
                        this.experience.camera.controls.update();
                    }
                });*/
            }
        }
        else {
            gsap.to(this.camera.position, {
                duration : 0.5, 
                x        : this.lastCameraPosition.x,
                y        : this.lastCameraPosition.y,
                z        : this.lastCameraPosition.z,
                ease     : "ease-out",
                onUpdate : () => {
                    this.experience.camera.controls.target.set(0, 0, 0);
                    this.experience.camera.controls.update();
                }
            });
            this.cameraFocus = "free";
        }

        
    }


    updateRaycaster() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        // Clear hover values
        for (const object in this.objects) {
            this.objects[object].hover = false;
        }
        // lean the actual hover object
        this.hover = "";

        for (let i = 0; i < intersects.length; i++) {
//        if (intersects.length > 0) {
            for (const object in this.objects) {
                if (intersects[i].object.name === this.objects[object].name) {
                    this.hover = this.objects[object].name;
                    this.objects[object].hover = true;
                    break;
                }
            }                
        }


        // Check if whe have new hover objects
        for (const object in this.objects) {
            const o = this.objects[object];
            if (o.hover === true) {
                // if the object is not hover, start the animation
                if (o.material.uniforms.uHover.value < 0.01) {
                    gsap.to(o.material.uniforms.uHover, {
                        duration : 0.5, 
                        value    : 1.0,
                        ease     : "ease-in"                        
                    });
                }
            }
        }

        // Update last hover object
        if (this.lastHover !== this.hover) {
            for (const object in this.objects) {
                const o = this.objects[object];
                if (o.name === this.lastHover) {
                    gsap.to(o.material.uniforms.uHover, {
                        duration : 0.5, 
                        value    : 0.0,
                        ease     : "ease-out"
                    });
                    break;
                }

            }

            this.lastHover = this.hover;

        }

    }

    update() {
        if (this.ready === true) {

            this.updateRaycaster();
//            gsap.updateTweens();


            this.frequencyTexture.update();
//            this.bars.update();
            this.circular.update();
            this.circularSin.update();
            this.circularDistorsion.update();
            this.yinYang.update();
            this.yinYangSin.update();
            this.floor.update();

//            this.osciloscope.update();
//            this.osciloscopeSoft.update();
        }
    }
}