import Experience from '../Experience.js'
import Bars from './Bars.js';
import Circular from './Circular.js';
import CircularDistorsion from './CircularDistorsion.js';
import CircularSin from './CircularSin.js';
import Environment from './Environment.js'
import Floor from './Floor.js';
//import FrequencyTexture from './FrequencyTexture.js';
import Osciloscope from './Osciloscope.js';
import YinYang from './YinYang.js';
import YinYangSin from './YinYangSin.js';
import * as THREE from 'three'
import { gsap } from "gsap";
//import PerlinSun from './PerlinSun.js';
import AudioInfo from './AudioInfo.js';
import SSPerlinSun from './SSPerlinSun.js';
import Sphere from './Sphere.js';
import SphereSin from './SphereSin.js';
import Spiral from './Spiral.js'
//import OsciloscopeSoft from './OsciloscopeSoft.js';


export default class World {
    constructor() {
        this.experience = new Experience();
        this.canvas     = this.experience.canvas;
        this.scene      = this.experience.scene;
        this.resources  = this.experience.resources;
        this.camera     = this.experience.camera.instance;
        this.sizes      = this.experience.sizes;
        this.time       = this.experience.time;
        // World ready
        this.ready      = false;
        // Camera animation time & ease
        this.ani = {
            duration : 0.5,
            ease     : "slowmo"
        }   
        // setup
        this.setup();                
        // Markup to check the fps one time, and disable shadows if fps are below 55
        this.checkSpeed = false;
    }

    setup() {
        // Objects of the scene
//        this.frequencyTexture    = new FrequencyTexture();
        this.floor               = new Floor(this);
        this.bars                = new Bars(this);
        this.osciloscope         = new Osciloscope(this);
        this.circular            = new Circular(this);
        this.circularSin         = new CircularSin(this);
        this.circularDistorsion  = new CircularDistorsion(this);
        this.yinYang             = new YinYang(this);
        this.yinYangSin          = new YinYangSin(this);
//        this.perlinSun           = new PerlinSun(this);
        this.ssPerlinSun         = new SSPerlinSun(this);        
        this.sphere              = new Sphere(this);
//        this.sphereSin           = new SphereSin(this);
        this.spiral              = new Spiral(this);
//        const start = Math.PI * 2.0 * 0.33 * 0.5;

//        this.experience.camera.controls.target.set(this.ssPerlinSun.group.position.x, this.ssPerlinSun.group.position.y, this.ssPerlinSun.group.position.z);
//        this.experience.camera.controls.update();
        
        //this.camera.position.set(5, 3, 32);
/*        this.camera.lookAt(this.spiral.mesh.position);
        this.experience.camera.controls.target.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.experience.camera.controls.update();*/
        
//        this.camera.target.set(this.spiral.mesh);

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

        // last hover object name
        this.lastHover = "";
        this.hover     = "";

        // wait for resources
        this.resources.on('ready', () => {
            this.environment      = new Environment();
            this.audioInfo        = new AudioInfo(this);

            this.objects = {
                circular            : { name : "Circular"            , hover : false, object : this.circular           },
                circularSin         : { name : "CircularSin"         , hover : false, object : this.circularSin        },
                circularDistorsion  : { name : "CircularDistorsion"  , hover : false, object : this.circularDistorsion },
                osciloscope         : { name : "Osciloscope"         , hover : false, object : this.osciloscope        },
                yinYang             : { name : "YinYang"             , hover : false, object : this.yinYang            },
                yinYangSin          : { name : "YinYangSin"          , hover : false, object : this.yinYangSin         },
                perlinSun           : { name : "SSPerlinSun"         , hover : false, object : this.ssPerlinSun        },
                audioInfo           : { name : "AudioInfo"           , hover : false, object : this.audioInfo          },            
                sphere              : { name : "Sphere"              , hover : false, object : this.sphere             },            
                sphereSin           : { name : "SphereSin"           , hover : false, object : this.sphereSin          },            
            }
            
            this.ready            = true;
            
        });
        
    }


    shadows(enable) {

        if (typeof this.environment.sunLight !== "undefined")  this.environment.sunLight.castShadow = enable;
        if (typeof this.environment.spotLight !== "undefined") this.environment.spotLight.castShadow = enable;

        this.audioInfo.mesh.castShadow                        = enable;

        this.floor.mesh.receiveShadow                         = enable;
        this.floor.mesh.castShadow                            = enable;

        this.bars.mesh.castShadow                             = enable;
        this.circular.mesh.castShadow                         = enable;
        this.circularDistorsion.mesh.castShadow               = enable;
        this.circularSin.mesh.castShadow                      = enable;
        this.osciloscope.mesh.castShadow                      = enable;
        this.ssPerlinSun.mesh.castShadow                      = enable;
        this.sphere.mesh.castShadow                           = enable;
        this.spiral.mesh.castShadow                           = enable;

    }

    // Mouse move event
    eventMouseMouve(event) {
        this.mouse.x = event.clientX / this.sizes.width    * 2 - 1;
        this.mouse.y = - (event.clientY / this.sizes.height) * 2 + 1;
        if (this.hover !== "") {
            this.canvas.style.cursor = "pointer";
        }
        else {
            this.canvas.style.cursor = "auto";
        }
    }

    // Click event
    eventClick(event) {
        /*
        event.preventDefault();

        if (this.hover === "AudioInfo") {
            for (const object in this.objects) {
                if (this.objects[object].name === this.hover) {
                    window.open(this.experience.song.url, '_blank');
                    return;
                }
            }
            
        }

        // Camera is free
        if (this.cameraFocus === "free") {
            let position;
            let geo;
            for (const object in this.objects) {
                if (this.objects[object].name === this.hover) {
                    position = this.objects[object].object.mesh.position;
                    geo = this.objects[object].object.mesh.geometry;
                }
            }

            this.lastCameraPosition = this.camera.position.clone();
            this.camera.position.tx = 0;
            this.camera.position.ty = 0;
            this.camera.position.tz = 0;
            // No hover items            
            if (typeof geo === "undefined") return;
            this.cameraFocus = this.hover;

            geo.computeBoundingBox();
            const width = geo.boundingBox.max.x - geo.boundingBox.min.x;
            let nz = (this.camera.position.z > position.z) ? 2.5 * width : -2.5 * width;


            
            // Camera position and target animation
            gsap.to(this.camera.position, {
                duration : this.ani.duration, 
                ease     : this.ani.ease,
                x        : position.x ,
                y        : position.y ,
                z        : position.z + nz,
                tx       : position.x,
                ty       : position.y, 
                tz       : position.z,
                onUpdate : () => {
                    this.experience.camera.controls.target.set(this.camera.position.tx, this.camera.position.ty, this.camera.position.tz);
//                        this.camera.lookAt(new THREE.Vector3(position.x, position.y, position.z + 10));
                    this.experience.camera.controls.update();
                }
            });
        }
        // Camera is focused
        else {
            let position;
            let geo;

            // Return to camera free animation
            gsap.to(this.camera.position, {
                duration : this.ani.duration, 
                ease     : this.ani.ease,
                x        : this.lastCameraPosition.x,
                y        : this.lastCameraPosition.y,
                z        : this.lastCameraPosition.z,
                tx       : 0,
                ty       : 0, 
                tz       : 0,
                onUpdate : () => {
                    this.experience.camera.controls.target.set(this.camera.position.tx, this.camera.position.ty, this.camera.position.tz);
                    this.experience.camera.controls.update();
                }
            });
            this.cameraFocus = "free";
        }
*/
        
    }


    updateRaycaster() {
/*        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        // Clear hover values
        for (const object in this.objects) {
            this.objects[object].hover = false;
        }
        // lean the actual hover object
        this.hover = "";

        for (let i = 0; i < intersects.length; i++) {
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
            if (o.hover === true && o.name !== "AudioInfo") {
                // if the object is not hover, start the animation
                if (o.object.material.uniforms.uHover.value < 0.01) {
                    gsap.to(o.object.material.uniforms.uHover, {
                        duration : this.ani.duration, 
                        ease     : this.ani.ease,
                        value    : 1.0,
//                        onUpdate : () => {
//                            // Copy the hover value to the depthMaterial
//                            o.object.mesh.customDepthMaterial.uniforms.uHover = o.object.material.uniforms.uHover;
//                        }
                    });
                }
            }
        }

        // Update last hover to normal state
        if (this.lastHover !== this.hover) {
            for (const object in this.objects) {
                const o = this.objects[object];
                if (o.name === this.lastHover && o.name !== "AudioInfo" ) {
                    gsap.to(o.object.material.uniforms.uHover, {
                        duration : this.ani.duration, 
                        ease     : this.ani.ease,
                        value    : 0.0,
//                        onUpdate : () => {
//                            // Copy the hover value to the depthMaterial
//                            o.object.mesh.customDepthMaterial.uniforms.uHover = o.object.material.uniforms.uHover;
//                        }
                    });
                    break;
                }

            }

            this.lastHover = this.hover;

        }*/

    }

    update() {
        if (this.ready === true) {

            // After 5 seconds from the start, check fps to remove shadows if framerate its below 50
/*            if (this.time.elapsed > 5000 && this.checkSpeed === false) {
                this.checkSpeed = true;
                if (this.time.fps < 50) {
                    this.shadows(false);
                }
            }*/
            this.updateRaycaster();

//            this.frequencyTexture.update();
            // Floor need to be updated / painted firsªt
            this.floor.update();
//            this.bars.update();
            this.circular.update();
            this.circularSin.update();
            this.circularDistorsion.update();
            this.yinYang.update();
            this.yinYangSin.update();
//            this.perlinSun.update();
            this.ssPerlinSun.update();
            this.sphere.update();
//            this.sphereSin.update();
            this.spiral.update();

//            this.osciloscope.update();
//            this.osciloscopeSoft.update();
        }
    }
}