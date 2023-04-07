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
        // setup
        this.frequencyTexture   = new FrequencyTexture();
        this.floor              = new Floor(this);
        this.bars               = new Bars(this);
        this.osciloscope        = new Osciloscope(this);
        this.circular           = new Circular(this);
        this.circularSin        = new CircularSin(this);
        this.circularDistorsion = new CircularDistorsion(this);

        this.yinYang            = new YinYang(this);
        this.yinYangSin         = new YinYangSin(this);

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
            circular            : { name : "Circular"            ,hover : false, material : this.circular.material },
            circularSin         : { name : "CircularSin"         ,hover : false, material : this.circularSin.material },
            circularDistorsion  : { name : "CircularDistorsion"  ,hover : false, material : this.circularDistorsion.material },
//            floor               : { name : "Floor"               , hover : false, material : this.floor.material }, },
            frequencyTexture    : { name : "FrequencyTexture"    ,hover : false, material : this.frequencyTexture.materialR },
            frequencyTextureSin : { name : "FrequencyTextureSin" ,hover : false, material : this.frequencyTexture.materialG },
            osciloscope         : { name : "Osciloscope"         ,hover : false, material : this.osciloscope.material },
            yinYang             : { name : "YinYang"             ,hover : false, material : this.yinYang.material },
            yinYangSin          : { name : "YinYangSin"          ,hover : false, material : this.yinYangSin.material },
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