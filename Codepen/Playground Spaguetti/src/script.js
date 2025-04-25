/* Experience created by Josep Antoni Bover for https://devildrey33.es.
 *  
 *  This is a playground to make shaders using a WebAudio analizer
 * 
 *  https://github.com/devildrey33/Audio-PlayGround
 * 
 *  Created on        : 10/04/2023
 *  Last modification : 03/11/2023
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import * as lil from 'lil-gui'


//window.AudioContext = null;

/* 
 * Event Emitter
 */
class EventEmitter {
    constructor()
    {
        this.callbacks = {}
        this.callbacks.base = {}
    }

    on(_names, callback)
    {
        // Errors
        if(typeof _names === 'undefined' || _names === '')
        {
            console.warn('wrong names')
            return false
        }

        if(typeof callback === 'undefined')
        {
            console.warn('wrong callback')
            return false
        }

        // Resolve names
        const names = this.resolveNames(_names)

        // Each name
        names.forEach((_name) =>
        {
            // Resolve name
            const name = this.resolveName(_name)

            // Create namespace if not exist
            if(!(this.callbacks[ name.namespace ] instanceof Object))
                this.callbacks[ name.namespace ] = {}

            // Create callback if not exist
            if(!(this.callbacks[ name.namespace ][ name.value ] instanceof Array))
                this.callbacks[ name.namespace ][ name.value ] = []

            // Add callback
            this.callbacks[ name.namespace ][ name.value ].push(callback)
        })

        return this
    }

    off(_names)
    {
        // Errors
        if(typeof _names === 'undefined' || _names === '')
        {
            console.warn('wrong name')
            return false
        }

        // Resolve names
        const names = this.resolveNames(_names)

        // Each name
        names.forEach((_name) =>
        {
            // Resolve name
            const name = this.resolveName(_name)

            // Remove namespace
            if(name.namespace !== 'base' && name.value === '')
            {
                delete this.callbacks[ name.namespace ]
            }

            // Remove specific callback in namespace
            else
            {
                // Default
                if(name.namespace === 'base')
                {
                    // Try to remove from each namespace
                    for(const namespace in this.callbacks)
                    {
                        if(this.callbacks[ namespace ] instanceof Object && this.callbacks[ namespace ][ name.value ] instanceof Array)
                        {
                            delete this.callbacks[ namespace ][ name.value ]

                            // Remove namespace if empty
                            if(Object.keys(this.callbacks[ namespace ]).length === 0)
                                delete this.callbacks[ namespace ]
                        }
                    }
                }

                // Specified namespace
                else if(this.callbacks[ name.namespace ] instanceof Object && this.callbacks[ name.namespace ][ name.value ] instanceof Array)
                {
                    delete this.callbacks[ name.namespace ][ name.value ]

                    // Remove namespace if empty
                    if(Object.keys(this.callbacks[ name.namespace ]).length === 0)
                        delete this.callbacks[ name.namespace ]
                }
            }
        })

        return this
    }

    trigger(_name, _args)
    {
        // Errors
        if(typeof _name === 'undefined' || _name === '')
        {
            console.warn('wrong name')
            return false
        }

        let finalResult = null
        let result = null

        // Default args
        const args = !(_args instanceof Array) ? [] : _args

        // Resolve names (should on have one event)
        let name = this.resolveNames(_name)

        // Resolve name
        name = this.resolveName(name[ 0 ])

        // Default namespace
        if(name.namespace === 'base')
        {
            // Try to find callback in each namespace
            for(const namespace in this.callbacks)
            {
                if(this.callbacks[ namespace ] instanceof Object && this.callbacks[ namespace ][ name.value ] instanceof Array)
                {
                    this.callbacks[ namespace ][ name.value ].forEach(function(callback)
                    {
                        result = callback.apply(this, args)

                        if(typeof finalResult === 'undefined')
                        {
                            finalResult = result
                        }
                    })
                }
            }
        }

        // Specified namespace
        else if(this.callbacks[ name.namespace ] instanceof Object)
        {
            if(name.value === '')
            {
                console.warn('wrong name')
                return this
            }

            this.callbacks[ name.namespace ][ name.value ].forEach(function(callback)
            {
                result = callback.apply(this, args)

                if(typeof finalResult === 'undefined')
                    finalResult = result
            })
        }

        return finalResult
    }

    resolveNames(_names) {
        let names = _names
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '')
        names = names.replace(/[,/]+/g, ' ')
        names = names.split(' ')

        return names
    }

    resolveName(name)    {
        const newName = {}
        const parts = name.split('.')

        newName.original  = name
        newName.value     = parts[ 0 ]
        newName.namespace = 'base' // Base namespace

        // Specified namespace
        if(parts.length > 1 && parts[ 1 ] !== '')
        {
            newName.namespace = parts[ 1 ]
        }

        return newName
    }
}

/* 
 * Sizes
 */
class Sizes extends EventEmitter {
    // Constructor without parameters that gets the canvas size 
    constructor() {
        super();
        this.experience = new Experience();
        this.options    = this.experience.options;

        this.width      = window.innerWidth;
        this.height     = window.innerHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.hEventResize = this.eventResize.bind(this);
        window.addEventListener('resize', this.hEventResize);
    }

    eventResize() {
        // Calculo el nuevo ancho y la nueva altura (si no son fijas) //this.elementOCanvas.offsetWidth
        if (this.options.width  === "auto") { this.width  = window.innerWidth;  }
        if (this.options.height === "auto") { this.height = window.innerHeight; }

        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.trigger('resize');
    }

    destroy() {
        window.removeEventListener('resize', this.hEventResize);
        this.hEventResize = null;
    }


}

/* 
 * Time
 */
class Time extends EventEmitter {
    constructor() {
        super();
        this.experience     = new Experience();
        this.elements       = this.experience.htmlElements;

        this.start          = Date.now();
        this.current        = this.start;
        this.elapsed        = 0;
        this.delta          = 16;
        // Time from this second 
        this.actualFrame    = this.start + 1000;
        // Number of frames during this second
        this.frameCounter   = 0;
        // actual framerate
        this.fps            = 0;

        window.requestAnimationFrame(() => {
            this.tick();
        })
    }

    // Function to measure Frames Per Second
    calculateFPS() {
        // If the current time is superior from actualFrame
        if (this.current > this.actualFrame) {
            // Setup the next frame is current time + 1000
            this.actualFrame = this.current + 1000;
            
            // If FPS html element exist
            if (typeof(this.elements.elementFPS) === "object") {
                // Write the new frames per second
                this.elements.elementFPS.innerHTML = this.frameCounter;
                // Set the parts per color
                const Part = 256 / 60; 
                // Put the color of the FPS text (Green 60fps, Red 0fps)        
                this.elements.elementFPS.style.color = "rgb(" + Math.round(255 - (this.frameCounter * Part)) + "," + Math.round(this.frameCounter * Part) + ", 0)";
            }
            this.fps = this.frameCounter;
            // Restart the counter of frames
            this.frameCounter = 0;
        }
        // If the current time is inferior to actualFrame
        else {
            // Increment one frame for this actualFrame
            this.frameCounter ++;
        }
    }

    // Function that triggers every frame of the scene
    tick() {
        // Recalculate the time variables
        const currentTime = Date.now();
        this.delta   = currentTime - this.current;
        this.current = currentTime;
        this.elapsed = this.current - this.start;
        // Recalculate Frames Per Second
        this.calculateFPS();
        // Send tick event 
        this.trigger('tick');
        // Call requestAnimationFrame for the next frame
        window.requestAnimationFrame(() => {
            this.tick();
        })
    }
}


/* 
 * Camera
 */
class Camera {
    // Constructor
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        this.setInstance();
        this.setOrbitControls();
    }


    setInstance() {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 1000);
        // Adapt camera to view port
        const xz = (this.sizes.width > this.sizes.height) ? 25 : 40;
        this.instance.position.set(-xz * 0.5, 13, xz);
        this.instance.position.set(5, 3.1, 30);
        this.scene.add(this.instance);
//        console.log (this.instance.position);
    }


    setOrbitControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
//        this.controls.enableDamping = true;
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    update() {
        
    }
}

/* 
 * Renderer
 */
class Renderer {
    // Costructor
    constructor() {
        // Get the experience instance
        this.experience = new Experience();
        this.canvas     = this.experience.canvas;
        this.sizes      = this.experience.sizes;
        this.scene      = this.experience.scene;
        this.camera     = this.experience.camera;
        this.time       = this.experience.time;

        this.setInstance();
    }

    // PostProcessing Displacement Pass
    DisplacementPass = {
        uniforms: {
            tDiffuse   : { value : null },
            uTime      : { value : 0 },
            uAmplitude : { value : null },
            uFrequency : { value : null }
        },
        vertexShader   : document.getElementById("DisplacementVertexShader").innerHTML,
        fragmentShader : document.getElementById("DisplacementFragmentShader").innerHTML
    }

    /**
     * Create the renderer instance and set his configuration
    */
    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas      : this.canvas, 
            antialias   : this.experience.optionsExperienceByDefault.antialias
        })
        
//        this.instance.physicallyCorrectLights = true;
        this.instance.useLegacyLights = true;
        this.instance.outputColorSpace = THREE.SRGBColorSpace;
//        this.instance.outputEncoding = THREE.sRGBEncoding;
        this.instance.toneMapping = THREE.CineonToneMapping;
        this.instance.toneMappingExposure = 1.75;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.setClearColor('#211d20');
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);

        /**
         * Post processing
         */
        this.effectComposer = new EffectComposer(this.instance);
        this.effectComposer.setSize(this.sizes.width, this.sizes.height);
        this.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // render pass
        this.renderPass = new RenderPass(this.scene, this.camera.instance);
        this.effectComposer.addPass(this.renderPass);


        // displacement pass
        this.displacementPass = new ShaderPass(this.DisplacementPass);
        this.displacementPass.material.uniforms.uAmplitude.value = this.experience.debugOptions.displacementAmplitude;
        this.displacementPass.material.uniforms.uFrequency.value = this.experience.debugOptions.displacementFrequency;
        this.displacementPass.material.uniforms.uAmplitude.value = new THREE.Vector2(
            this.experience.debugOptions.displacementAmplitudeX, 
            this.experience.debugOptions.displacementAmplitudeY
        );
        this.displacementPass.material.uniforms.uFrequency.value = new THREE.Vector2(
            this.experience.debugOptions.displacementFrequencyX, 
            this.experience.debugOptions.displacementFrequencyY
        );

        this.displacementPass.enabled   = this.experience.debugOptions.displacementEnabled;     
        this.effectComposer.addPass(this.displacementPass);

        // bloom pass
        this.bloomPass = new UnrealBloomPass( new THREE.Vector2( this.sizes.width, this.sizes.height ), 1.5, 0.4, 0.85 );
        this.bloomPass.threshold = this.experience.debugOptions.bloomThreshold;
        this.bloomPass.strength  = this.experience.debugOptions.bloomStrength;
        this.bloomPass.radius    = this.experience.debugOptions.bloomRadius;        
        this.bloomPass.enabled   = this.experience.debugOptions.bloomEnabled;     

        this.effectComposer.addPass(this.bloomPass);   

        
    }

    /**
     * Function called on resize
    */
    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);

        
        this.effectComposer.setSize(this.sizes.width, this.sizes.height);
        this.effectComposer.setPixelRatio(this.sizes.pixelRatio);

    }

    /**
     * Function called on update
    */
    update() {
        const advance = this.time.delta / 1000;
        this.displacementPass.material.uniforms.uTime.value += advance;

        this.effectComposer.render();
        //this.instance.render(this.scene, this.camera.instance)
    }
}


/* 
 * Resources
 */
class Resources extends EventEmitter {
    constructor(sources) {
        super();

        this.experience = new Experience();

        // options
        this.sources = sources;
        // setup
        this.items  = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;

        this.setLoaders();
        this.startLoading();
    }

    setLoaders() {
        this.loaders = {
            fontLoader          : new FontLoader()
        }
    }

    startLoading() {
        for (const source of this.sources) {
            if (source.type === "jsonFont") { 
                this.loaders.fontLoader.load(source.path, (font) => {
                    this.sourceLoaded(source, font);
                })
            }
        }

        // No items to load
        if (this.toLoad === 0) {
            // hide the loading 
            this.experience.loading = false;
            this.trigger('ready');
        }
    }


    sourceLoaded(source, file) {
        this.items[source.name] = file;
        this.loaded ++;

        if (this.loaded === this.toLoad) {
            // hide the loading 
            this.experience.loading = false;
            this.trigger('ready');
        }
    }
}

/* 
 * Debug
 */
class Debug {
    constructor() {
        this.experience         = new Experience();
        this.resources          = this.experience.resources;
        this.world              = this.experience.world;
//        this.environment        = this.experience.world.environment;
        this.osciloscope        = this.experience.world.osciloscope;
        this.floor              = this.experience.world.floor;
        this.frequencyTexture   = this.experience.world.frequencyTexture;
        this.bars               = this.experience.world.bars;
        this.circular           = this.experience.world.circular;
        this.circularSin        = this.experience.world.circularSin;
        this.circularDistorsion = this.experience.world.circularDistorsion;
        this.yinYang            = this.experience.world.yinYang;
        this.yinYangSin         = this.experience.world.yinYangSin;
        this.perlinSun          = this.experience.world.perlinSun;
        this.ssPerlinSun        = this.experience.world.ssPerlinSun;
        this.sphere             = this.experience.world.sphere;
        this.sphereSin          = this.experience.world.sphereSin;
        this.spiral             = this.experience.world.spiral;
        this.bloomPass          = this.experience.renderer.bloomPass;
        this.displacementPass   = this.experience.renderer.displacementPass;
        this.options            = this.experience.debugOptions;
        this.songs              = this.experience.songs;
        this.active = true;
        
//        this.active = window.location.hash === '#debug';

        if (this.active) {
            this.ui = new lil.GUI();

            /*
             * Lights
             */
            this.debugLights = this.ui.addFolder("Lights").open(false);

            this.debugDirectional = this.debugLights.addFolder("Directional").open(false);            
            // Visible
            this.debugDirectional.add(this.options, "sunLightVisible").name("Visible").onChange(() => {
                this.world.environment.sunLight.visible = this.options.sunLightVisible;
                this.world.environment.sunLightHelper.visible = this.options.sunLightVisible;
            });
            // Color
            this.debugDirectional.addColor(this.options, "sunLightColor").name("Color").onChange(() => {
                this.world.environment.sunLight.color = this.options.sunLightColor;
            });        
            // Intensity
            this.debugDirectional.add(this.options, "sunLightIntensity").min(0.1).max(10).step(0.1).name("Intensity").onChange(() => {
                this.world.environment.sunLight.intensity = this.options.sunLightIntensity;
            });        
            // Position X
            this.debugDirectional.add(this.options, "sunLightPosX").min(-100).max(100).step(0.1).name("Position X").onChange(() => {
                this.world.environment.sunLight.position.set(this.options.sunLightPosX, this.options.sunLightPosY, this.options.sunLightPosZ);
            });        
            // Position Y
            this.debugDirectional.add(this.options, "sunLightPosY").min(-100).max(100).step(0.1).name("Position Y").onChange(() => {
                this.world.environment.sunLight.position.set(this.options.sunLightPosX, this.options.sunLightPosY, this.options.sunLightPosZ);
            });        
            // Position Z
            this.debugDirectional.add(this.options, "sunLightPosZ").min(-100).max(100).step(0.1).name("Position Z").onChange(() => {
                this.world.environment.sunLight.position.set(this.options.sunLightPosX, this.options.sunLightPosY, this.options.sunLightPosZ);
            });        

            this.debugSpot = this.debugLights.addFolder("Spot").open(false);
            // Visible
            this.debugSpot.add(this.options, "spotLightVisible").name("Visible").onChange(() => {
                this.world.environment.spotLight.visible = this.options.spotLightVisible;
                this.world.environment.splhelper.visible = this.options.spotLightVisible;
            });
            // Color
            this.debugSpot.addColor(this.options, "spotLightColor").name("Color").onChange(() => {
                this.world.environment.spotLight.color = this.options.spotLightColor;
            });        
            // Intensity
            this.debugSpot.add(this.options, "spotLightIntensity").min(0.1).max(10).step(0.1).name("Intensity").onChange(() => {
                this.world.environment.spotLight.intensity = this.options.spotLightIntensity;
            });        
            // Position X
            this.debugSpot.add(this.options, "spotLightPosX").min(-100).max(100).step(0.1).name("Position X").onChange(() => {
                this.world.environment.spotLight.position.set(this.options.spotLightPosX, this.options.spotLightPosY, this.options.spotLightPosZ);
            });        
            // Position Y
            this.debugSpot.add(this.options, "spotLightPosY").min(-100).max(100).step(0.1).name("Position Y").onChange(() => {
                this.world.environment.spotLight.position.set(this.options.spotLightPosX, this.options.spotLightPosY, this.options.spotLightPosZ);
            });        
            // Position Z
            this.debugSpot.add(this.options, "spotLightPosZ").min(-100).max(100).step(0.1).name("Position Z").onChange(() => {
                this.world.environment.spotLight.position.set(this.options.spotLightPosX, this.options.spotLightPosY, this.options.spotLightPosZ);
            });        

            // Shadows
            this.debugLights.add(this.options, "shadows").name("Shadows").onChange(() => {
                this.experience.world.shadows(this.options.shadows);
            });

            /*
             * Bars
             */
            this.debugBars = this.ui.addFolder("Bars").open(false);;
            // Count
            this.debugBars.add(this.options, "barsCount").min(32).max(512).step(1).name("Count").onChange(() => {
                this.experience.world.bars.createBars(this.options.barsCount, 1);                
            });        
            // Audio Strength    
            this.debugBars.add(this.options, "barsAudioStrength").min(0.5).max(10).step(0.1).name("Audio strength").onChange(() => {
                this.bars.material.uniforms.uAudioStrength.value = this.options.barsAudioStrength;
            });   

            /*
             * Floor
             */
            this.debugFloor = this.ui.addFolder("Floor").open(false);;
            // Color grid
            this.debugFloor.addColor(this.options, "floorColorGrid").name("Grid color").onChange(() => {
                this.floor.material.uniforms.uColorGrid.value = new THREE.Color(this.options.floorColorGrid);
            });
            // Color background
            this.debugFloor.addColor(this.floor.material, "color").name("Background color").onChange(() => {
//                this.floor.material.uniforms.uColorBackground.value = new THREE.Color(this.options.floorColorBackground);
//                this.floor.material.color = new THREE.Color(this.options.floorColorBackground);
            });

            // Audio strength
            this.debugFloor.add(this.options, "floorAudioStrength").min(1).max(20).step(0.1).name("Audio strength").onChange(() => {
                this.floor.material.uniforms.uAudioStrength.value = this.options.floorAudioStrength;
            });

            /*
             * Osciloscope
             */
            this.debugOsciloscope = this.ui.addFolder("Osciloscope").open(false);
            // Osciloscope audio strength
            this.debugOsciloscope.add(this.options, "osciloscopeAudioStrength").min(0).max(1).step(0.01).name("Audio strength").onChange(() => {
                this.osciloscope.material.uniforms.uAudioStrength.value = this.options.osciloscopeAudioStrength;
            });            
            // Osciloscope audio zoom
            this.debugOsciloscope.add(this.options, "osciloscopeAudioZoom").min(1).max(32).step(0.1).name("Audio zoom").onChange(() => {
                this.osciloscope.material.uniforms.uAudioZoom.value = this.options.osciloscopeAudioZoom;
            });            
            // Osciloscope background alpha
            this.debugOsciloscope.add(this.options, "osciloscopeAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.osciloscope.material.uniforms.uAlpha.value = this.options.osciloscopeAlpha;
            });            
            // Osciloscope line size
            this.debugOsciloscope.add(this.options, "osciloscopeLineSize").min(0.001).max(0.2).step(0.001).name("Line size").onChange(() => {
                this.osciloscope.material.uniforms.uSize.value = this.options.osciloscopeLineSize;
            });

         
            
            /*
             * Circular
             */
            this.debugCircular = this.ui.addFolder("Circular").open(false);          

            this.debugCircular.add(this.options, "circularAudioStrength").min(0.1).max(0.5).step(0.01).name("Audio strength").onChange(() => {
                this.circular.material.uniforms.uAudioStrength.value = this.options.circularAudioStrength;
                this.circularSin.material.uniforms.uAudioStrength.value = this.options.circularAudioStrength;
                this.circularDistorsion.material.uniforms.uAudioStrength.value = this.options.circularAudioStrength * 0.5;
            });            
            // Osciloscope background alpha
            this.debugCircular.add(this.options, "circularAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.circular.material.uniforms.uAlpha.value = this.options.circularAlpha;
                this.circularSin.material.uniforms.uAlpha.value = this.options.circularAlpha;
                this.circularDistorsion.material.uniforms.uAlpha.value = this.options.circularAlpha;
            });            

            this.debugCircular.add(this.options, "circularLineSize").min(0.001).max(0.1).step(0.001).name("Line Size").onChange(() => {
                this.circular.material.uniforms.uSize.value = this.options.circularLineSize;
                this.circularSin.material.uniforms.uSize.value = this.options.circularLineSize;
                this.circularDistorsion.material.uniforms.uSize.value = this.options.circularLineSize;
            });            

            /*
             * Yin Yang
             */
            this.debugYinYang = this.ui.addFolder("Yin Yang").open(false);
            // Yinyang background alpha
            this.debugYinYang.add(this.options, "yinYangAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.yinYang.material.uniforms.uAlpha.value = this.options.yinYangAlpha;
                this.yinYangSin.material.uniforms.uAlpha.value = this.options.yinYangAlpha;
            });            

            // Yinyang rotation enabled
            this.debugYinYang.add(this.options, "yinYangRotate").name("Rotate").onChange(() => {
                this.yinYang.material.uniforms.uRotate.value = this.options.yinYangRotate;
                this.yinYangSin.material.uniforms.uRotate.value = this.options.yinYangRotate;
            });


            /*
             * Perlin sun
             */
            this.debugSSPerlinSun           = this.ui.addFolder("Perlin sun").open(false);
            this.debugOsciloscopeCylinder   = this.debugSSPerlinSun.addFolder("Osciloscope Cylinder").open(false);
            this.debugBarsCylinder          = this.debugSSPerlinSun.addFolder("Bars Cylinder").open(false);
            // Color Frequency
            this.debugSSPerlinSun.addColor(this.options, "ssPerlinSunColorFrequency").name("Color freq.").onChange(() => {
                this.ssPerlinSun.material.uniforms.uColorFrequency.value = new THREE.Color(this.options.ssPerlinSunColorFrequency);
            });
            // Color Sin
            this.debugSSPerlinSun.addColor(this.options, "ssPerlinSunColorSin").name("Color sin").onChange(() => {
                this.ssPerlinSun.material.uniforms.uColorSin.value = new THREE.Color(this.options.ssPerlinSunColorSin);
            });
            // Perlin noise strength
            this.debugSSPerlinSun.add(this.options, "ssPerlinSunNoiseStrength").min(.1).max(50).step(0.01).name("Noise strength").onChange(() => {
                this.ssPerlinSun.material.uniforms.uNoiseStrength.value = this.options.ssPerlinSunNoiseStrength;
                this.ssPerlinSun.mesh.customDepthMaterial.uniforms.uNoiseStrength.value = this.options.ssPerlinSunNoiseStrength;
            });
            // Perlin noise speed
            this.debugSSPerlinSun.add(this.options, "ssPerlinSunNoiseSpeed").min(.1).max(50).step(0.01).name("Noise speed").onChange(() => {
                this.ssPerlinSun.material.uniforms.uNoiseSpeed.value = this.options.ssPerlinSunNoiseSpeed;
                this.ssPerlinSun.mesh.customDepthMaterial.uniforms.uNoiseSpeed.value = this.options.ssPerlinSunNoiseSpeed;
            });
            /*
             * Osciloscope Cylinder
             */
            // Osciloscope audio strength
            this.debugOsciloscopeCylinder.add(this.options, "osciloscopeCylinderAudioStrength").min(0).max(1).step(0.01).name("Audio strength").onChange(() => {
                this.ssPerlinSun.osciloscopeCylinder1.material.uniforms.uAudioStrength.value = this.options.osciloscopeCylinderAudioStrength;
                this.ssPerlinSun.osciloscopeCylinder2.material.uniforms.uAudioStrength.value = this.options.osciloscopeCylinderAudioStrength;
                this.ssPerlinSun.osciloscopeCylinder3.material.uniforms.uAudioStrength.value = this.options.osciloscopeCylinderAudioStrength;
            });            
            // Osciloscope audio zoom
            this.debugOsciloscopeCylinder.add(this.options, "osciloscopeCylinderAudioZoom").min(1).max(32).step(0.1).name("Audio zoom").onChange(() => {
                this.ssPerlinSun.osciloscopeCylinder1.material.uniforms.uAudioZoom.value = this.options.osciloscopeCylinderAudioZoom;
                this.ssPerlinSun.osciloscopeCylinder2.material.uniforms.uAudioZoom.value = this.options.osciloscopeCylinderAudioZoom;
                this.ssPerlinSun.osciloscopeCylinder3.material.uniforms.uAudioZoom.value = this.options.osciloscopeCylinderAudioZoom;
            });         
            /*
             * Sphere
             */
            this.debugSphere = this.ui.addFolder("Sphere").open(false);
            // sphere audio strength
            this.debugSphere.add(this.options, "sphereAudioStrength").min(0).max(6).step(0.01).name("Audio strength").onChange(() => {
                this.sphere.material.uniforms.uAudioStrength.value = this.options.sphereAudioStrength;
            });            
            // sphere audio zoom
            this.debugSphere.add(this.options, "sphereAudioZoom").min(1).max(8).step(0.01).name("Audio zoom").onChange(() => {
                this.sphere.material.uniforms.uAudioZoom.value = this.options.sphereAudioZoom;
            });            
            // sphere audio zoom
            this.debugSphere.add(this.sphere.material, "wireframe").name("wireframe");

            /*
             * SphereSin
             */
            if (typeof this.sphereSin !== "undefined") {
                this.debugSphereSin = this.ui.addFolder("Sphere Sin").open(false);
                // sphere sin audio strength
                this.debugSphereSin.add(this.options, "sphereSinAudioStrength").min(0).max(10).step(0.01).name("Audio strength").onChange(() => {
                    this.sphereSin.material.uniforms.uAudioStrength.value = this.options.sphereSinAudioStrength;
                });            
                // sphere sin audio zoom
                this.debugSphereSin.add(this.options, "sphereSinAudioZoom").min(1).max(8).step(0.01).name("Audio zoom").onChange(() => {
                    this.sphereSin.material.uniforms.uAudioZoom.value = this.options.sphereSinAudioZoom;
                });            
                // sphere sin audio zoom
                this.debugSphereSin.add(this.sphereSin.material, "wireframe").name("wireframe");
            }


            /*
             * Spiral
             */
            this.debugSpiral = this.ui.addFolder("Spiral").open(false);
            // Spiral audio strength
            this.debugSpiral.add(this.options, "spiralAudioStrength").min(0).max(10).step(0.01).name("Audio strength").onChange(() => {
                this.spiral.material.uniforms.uAudioStrength.value = this.options.spiralAudioStrength;
                this.spiral.mesh.customDepthMaterial.uniforms.uAudioStrength.value = this.options.spiralAudioStrength;
            });            
            // Spiral audio zoom
            this.debugSpiral.add(this.options, "spiralAudioZoom").min(1).max(8).step(0.01).name("Audio zoom").onChange(() => {
                this.spiral.material.uniforms.uAudioZoom.value = this.options.spiralAudioZoom;
                this.spiral.mesh.customDepthMaterial.uniforms.uAudioZoom.value = this.options.spiralAudioZoom;
            });            
            // Spiral frequency
            this.debugSpiral.add(this.options, "spiralFrequency").min(0.025).max(1).step(0.1).name("Frequency").onChange(() => {
                this.spiral.material.uniforms.uFrequency.value = this.options.spiralFrequency;
                this.spiral.mesh.customDepthMaterial.uniforms.uFrequency.value = this.options.spiralFrequency;
            });            
            // Spiral speed
            this.debugSpiral.add(this.options, "spiralSpeed").min(0.01).max(4).step(0.01).name("Speed").onChange(() => {
                this.spiral.material.uniforms.uSpeed.value = this.options.spiralSpeed;
                this.spiral.mesh.customDepthMaterial.uniforms.uSpeed.value = this.options.spiralSpeed;
            });            
            // Spiral thickness
            this.debugSpiral.add(this.options, "spiralThickness").min(0.01).max(0.75).step(0.01).name("Thickness").onChange(() => {
                this.spiral.material.uniforms.uThickness.value = this.options.spiralThickness;
                this.spiral.mesh.customDepthMaterial.uniforms.uThickness.value = this.options.spiralThickness;
            });            
            // Spiral audio strength sin
            this.debugSpiral.add(this.options, "spiralAudioStrengthSin").min(0).max(10).step(0.01).name("Audio strength Sin").onChange(() => {
                this.spiral.material.uniforms.uAudioStrengthSin.value = this.options.spiralAudioStrengthSin;
                this.spiral.mesh.customDepthMaterial.uniforms.uAudioStrengthSin.value = this.options.spiralAudioStrengthSin;
            });            
            // Spiral audio zoom sin
            this.debugSpiral.add(this.options, "spiralAudioZoomSin").min(1).max(8).step(0.01).name("Audio zoom Sin").onChange(() => {
                this.spiral.material.uniforms.uAudioZoomSin.value = this.options.spiralAudioZoomSin;
                this.spiral.mesh.customDepthMaterial.uniforms.uAudioZoomSin.value = this.options.spiralAudioZoomSin;
            });            
            // Spiral frequency sin
            this.debugSpiral.add(this.options, "spiralFrequencySin").min(0.025).max(1).step(0.1).name("Frequency Sin").onChange(() => {
                this.spiral.material.uniforms.uFrequencySin.value = this.options.spiralFrequencySin;
                this.spiral.mesh.customDepthMaterial.uniforms.uFrequencySin.value = this.options.spiralFrequencySin;
            });            
            // Spiral speed sin
            this.debugSpiral.add(this.options, "spiralSpeedSin").min(0.01).max(4).step(0.01).name("Speed Sin").onChange(() => {
                this.spiral.material.uniforms.uSpeedSin.value = this.options.spiralSpeedSin;
                this.spiral.mesh.customDepthMaterial.uniforms.uSpeedSin.value = this.options.spiralSpeedSin;
            });            
            // Spiral thickness sin
            this.debugSpiral.add(this.options, "spiralThicknessSin").min(0.01).max(0.75).step(0.01).name("Thickness Sin").onChange(() => {
                this.spiral.material.uniforms.uThicknessSin.value = this.options.spiralThicknessSin;
                this.spiral.mesh.customDepthMaterial.uniforms.uThicknessSin.value = this.options.spiralThicknessSin;
            });            

            /*
             * Bloom PostProcessing
             */
            this.debugBloom = this.ui.addFolder("Bloom (postprocessing)").open(false);
            // Enable / disable bloom
            this.debugBloom.add(this.options, "bloomEnabled").onChange(() => {
                this.bloomPass.enabled = this.options.bloomEnabled;
            });
            // Bloom Threshold
            this.debugBloom.add(this.options, "bloomThreshold").min(-20).max(20).step(0.01).name("Threshold").onChange(() => {
                this.bloomPass.threshold = this.options.bloomThreshold;
            });
            // Bloom Radius
            this.debugBloom.add(this.options, "bloomRadius").min(-20).max(20).step(0.01).name("Radius").onChange(() => {
                this.bloomPass.radius = this.options.bloomRadius;
            });
            // Bloom Strength
            this.debugBloom.add(this.options, "bloomStrength").min(0).max(1).step(0.01).name("Strength").onChange(() => {
                this.bloomPass.strength = this.options.bloomStrength;
            });     
            

            /*
            * Displacement PostProcessing
            */
            this.debugDisplacement = this.ui.addFolder("Displacement (postprocessing)").open(false);
            // Enable / disable bloom
            this.debugDisplacement.add(this.options, "displacementEnabled").onChange(() => {
                this.displacementPass.enabled = this.options.displacementEnabled;
            });
            // Displacement Amplitude X
            this.debugDisplacement.add(this.options, "displacementAmplitudeX").min(0.001).max(0.5).step(0.01).name("Amplitude X").onChange(() => {
                this.displacementPass.uniforms.uAmplitude.value = new THREE.Vector2(
                    this.options.displacementAmplitudeX,
                    this.options.displacementAmplitudeY
                );
            });
            // Displacement Amplitude Y
            this.debugDisplacement.add(this.options, "displacementAmplitudeY").min(0.001).max(0.5).step(0.01).name("Amplitude Y").onChange(() => {
                this.displacementPass.uniforms.uAmplitude.value = new THREE.Vector2(
                    this.options.displacementAmplitudeX,
                    this.options.displacementAmplitudeY
                );
            });
            // Displacement Frequency X
            this.debugDisplacement.add(this.options, "displacementFrequencyX").min(0.01).max(100).step(0.1).name("Frequency X").onChange(() => {
                this.displacementPass.uniforms.uFrequency.value = new THREE.Vector2(
                    this.options.displacementFrequencyX,
                    this.options.displacementFrequencyY
                );
            });
            // Displacement Frequency Y
            this.debugDisplacement.add(this.options, "displacementFrequencyY").min(0.01).max(100).step(0.1).name("Frequency Y").onChange(() => {
                this.displacementPass.uniforms.uFrequency.value = new THREE.Vector2(
                    this.options.displacementFrequencyX,
                    this.options.displacementFrequencyY
                );
            });
        }
    }

    exponent(x) {
        return Math.floor(1024 / (2 ** (x - 1)));
    }
}

/* 
 * HTMLElements
 */
class HTMLElements {
    // Static counter for canvas id's
    static #countIds = 0;

    // constructor
    constructor() {
        this.experience = new Experience();
        this.options    = this.experience.options;
        this.sizes      = this.experience.sizes;
        this.songs      = this.experience.songs;
        this.song       = this.experience.song;
        
        this.create();

        this.setupAudioControlEvents();
//        this.createAudioControls();
    }

    setupAudioControlEvents() {
        // Time bar its changing by the user
        this.dragTime = false;
        // Not a drag & drop song
        this.defaultSong = true;

        // Audio songs select option element
        this.elementAudioSongs.addEventListener('change', (e) => {
            for (let i = 0; i < this.songs.length; i++) {
                if (e.currentTarget.value === this.songs[i].name) {
                    this.experience.song = this.songs[i];
                    break;
                }
            }
            
            this.experience.audioAnalizer.loadSong(this.experience.song.path);
            this.experience.audioAnalizer.playPause();
            this.experience.world.audioInfo.setup();
        });
        // Audio volume slider element
        this.elementAudioVolume.addEventListener('input', (e) => { 
            this.experience.audioAnalizer.gainNode.gain.value = e.currentTarget.value;
        }); 
        // Audio time slider element mousedown
        this.elementAudioTime.addEventListener('mousedown', (e) => { 
            this.dragTime = true;
        }); 
        // Audio time slider element touchstart
        this.elementAudioTime.addEventListener('touchstart', (e) => { 
            this.dragTime = true;
        }); 
        // Audio time slider element mouseup
        this.elementAudioTime.addEventListener('mouseup', (e) => { 
            this.dragTime = false;
        }); 
        // Audio time slider element touchend
        this.elementAudioTime.addEventListener('touchend', (e) => { 
            this.dragTime = false;
        }); 

        this.elementAudioTime.addEventListener('change', (e) => { 
            this.experience.audioAnalizer.song.currentTime = this.elementAudioTime.value;
        }); 

    }

    audioUI(play) {

//        let play = !this.song.paused;

        this.elementPlay.setAttribute("play", play);
        this.elementPause.setAttribute("play", play);

        this.elementSongInfoName.innerHTML = "<a href='" + this.experience.song.url + "' target='_blank'>" + this.experience.song.name + "</a>";
        this.elementSongInfoArtist.innerHTML = "<a href='" + this.experience.song.url + "' target='_blank'>" + this.experience.song.group + "</a>";

        if (this.defaultSong === true && (play === "true" || play === true)) 
            this.elementSongInfo.setAttribute("visible", play);
        else
            this.elementSongInfo.setAttribute("visible", false);
    }


    create() {
        // Si no hay una ID asignada es que no se ha creado la etiqueta OCanvas para este objeto
        if (typeof(this.id) === 'undefined') {
            // Creo las etiquetas necesarias para el canvas, los botones, el framerate y la carga
            const preElementExperience = document.createElement("div");
            // Asigno la id para este Canvas, y sumo 1 al contador de ids estatico
            this.id = HTMLElements.#countIds ++;
            preElementExperience.id        = "Experience" + this.id; 
            preElementExperience.className = "Experience";
            // Añado la etiqueta que contiene todas las etiquetas de este OCanvas
            this.options.rootElement.appendChild(preElementExperience);
            this.elementExperience = document.getElementById(preElementExperience.id);
            // Setup the loading atribute
            this.elementExperience.setAttribute("loading", true);
            // Creo un string para crear las etiquetas HTML
            let strHTML = ""
            // Añado la etiqueta para el canvas
            strHTML += '<canvas id="Experience' + this.id + '_Canvas" class="Experience_Canvas"></canvas>';
            // Añado la etiqueta para el marco que indica que se está cargando
            strHTML += '<div class="Experience_Loading Experience_Panel"><span>Loading...</span></div>';
            // Añado la etiqueta para el marco de los controles
            strHTML += '<div class="Experience_Controls">';
            // Show FPS
            if (this.options.showFPS === true) {
                strHTML +=  "<div class='Experience_Panel Experience_Static' title='Frames Per Second'>" +
                                "<div class='Experience_FPS'>60</div>" +
                                "<div class='Experience_TxtFPS'>fps</div>" +
                            "</div>";
            }
            // Show full screen button
            if (this.options.buttonFullScreen === true) {
                strHTML +=  "<div id='fullScreen' class='Experience_Panel Experience_Control' title='Full screen mode'>" +
                                "<img draggable='false' src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-pantalla-completa' />" +
                            "</div>" +
                            "<div id='restoreScreen' class='Experience_Panel Experience_Control' title='Restore screen'>" +
                                "<img draggable='false' src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-restaurar-pantalla' />" +
                            "</div>";                
            }

            // Show github button
            if (this.options.buttonGitHub === true) {
                strHTML +=  "<a href='" + this.options.urlGitHub + "' target='_blank' class='Experience_Panel Experience_Control' title='GitHub project'>" +
                                "<img draggable='false' src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-github' />" +            
                            "</a>";
            }
            // Show devildrey33 logo button
            if (this.options.buttonLogo === true) {
                strHTML +=  "<a href='https://devildrey33.es' target='_blank' id='Logo' class='Experience_Panel Experience_Control'>" +
                                "<img draggable='false' src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-logo' />" +
                                "<div id='LogoText'>" +
                                    "<span>D</span>" + "<span>E</span>" + "<span>V</span>" + "<span>I</span>" + "<span>L</span>" + "<span>D</span>" + "<span>R</span>" + "<span>E</span>" + "<span>Y</span>" + "<span>&nbsp;</span>" + "<span>3</span>" + "<span>3</span>" +
                                "</div>" +

                            "</a>";
            }
            // Cierro el div .Experience_Controls
            strHTML += '</div>';

            // Play button
            strHTML += '<div class="Experience_Play Experience_Panel Experience_Control" play="true">' +
                            "<img draggable='false' src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-play' />" +
                    '</div>';
            // Pause button
            strHTML += '<div class="Experience_Pause Experience_Panel Experience_Control" play="true">' +
                            "<img draggable='false' src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-pause' />" +
                    '</div>';

            // Song info
            strHTML += `<div class="Experience_Panel Experience_SongInfo">
                            <table>
                                <tr>
                                    <td>Name</td>
                                    <td>:</td>
                                    <td id='AudioInfo_Name'><a href="https://www.jamendo.com/track/1884527/the-deep" target="_blank">The Deep</a></td>
                                </tr>
                                <tr>
                                    <td>Artist</td>
                                    <td>:</td>
                                    <td id='AudioInfo_Artist'><a href="https://www.jamendo.com/artist/359034/anitek" target="_blank">Anitek</a></td>
                                </tr>
                            </table>
                        </div>`;


            /* 
             * AudioControls
             */
            strHTML += "<div class='Experience_AudioControls'>";
            strHTML += "<table style='width:200px'><tr><td><span>song</span></td><td>";
            strHTML +=      "<div class='Experience_AC_Songs'><select name='songs'>";
            for (let i = 0; i < this.songs.length; i++) {
                strHTML += (this.songs[i].name === this.song.name) ? "<option selected>" : "<option>";
                strHTML += this.songs[i].name + "</option>";
            }
            strHTML +=      "</select></div></td></tr><tr><td>volume</td><td>";
            strHTML +=      "<div class='Experience_AC_Volume'><input type='range' name='volume' min='0' max='2' value='1' step='0.01' ></input></div>" ;
            strHTML +=      "</td></tr></table>";
//            strHTML +=      "<td><div class='Experience_AC_Info'>txt</div></td>";
//            strHTML +=      "</tr></table>";
            strHTML +=      "<div class='Experience_AC_Time'><input type='range'></input></div>" ;
            strHTML += "</div>";

            // Añado el string con todas las nuevas etiquetas al DOOM dentro de la etiqueta OCanvas
            this.elementExperience.innerHTML = strHTML;


            if (this.options.buttonFullScreen === true) {
                this.elementFullScreen    = document.getElementById("fullScreen");
                this.elementRestoreScreen = document.getElementById("restoreScreen");
                this.elementFullScreen.addEventListener("click", (e) => {
                    this.elementExperience.requestFullscreen();
                    this.elementFullScreen.style.display    = "none";
                    this.elementRestoreScreen.style.display = "block";
                });
                this.elementRestoreScreen.addEventListener("click", (e) => {
                    document.exitFullscreen();
                    this.elementFullScreen.style.display    = "block";
                    this.elementRestoreScreen.style.display = "none";        
                });

            }



            // Audio controls element
            this.elementAudioControls = document.querySelector("#" + this.elementExperience.id + " > .Experience_AudioControls");
            // Audio songs select option element
            this.elementAudioSongs = document.querySelector("#" + this.elementExperience.id + " > .Experience_AudioControls  .Experience_AC_Songs select");
            // Get the song information panel
            this.elementSongInfo = document.querySelector("#" + this.elementExperience.id + " > .Experience_SongInfo");
            this.elementSongInfoName   = document.getElementById("AudioInfo_Name");
            this.elementSongInfoArtist = document.getElementById("AudioInfo_Artist");
            // Audio volume slider element
            this.elementAudioVolume = document.querySelector("#" + this.elementExperience.id + " > .Experience_AudioControls  .Experience_AC_Volume input");
            // Audio time slider element
            this.elementAudioTime = document.querySelector("#" + this.elementExperience.id + " > .Experience_AudioControls > .Experience_AC_Time > input");
            // Audio time slider element
            this.elementAudioInfo = document.querySelector("#" + this.elementExperience.id + " > .Experience_AudioControls  .Experience_AC_Info");

            // Get the play and pause button elements
            this.elementPlay  = document.querySelector("#" + this.elementExperience.id + " > .Experience_Play");
            this.elementPause = document.querySelector("#" + this.elementExperience.id + " > .Experience_Pause");            
            // Play pause button listen click
            this.elementPlay.addEventListener( "click", (e) => {  this.audioUI(!this.experience.audioAnalizer.playPause());  });
            this.elementPause.addEventListener("click", (e) => {  this.audioUI(!this.experience.audioAnalizer.playPause());  });


        
            // Obtengo la etiqueta del canvas 
            this.elementCanvas = document.querySelector("#" + this.elementExperience.id + " > .Experience_Canvas")
            // Obtengo la etiqueta del marco para la carga
            this.elementLoading = document.querySelector("#" + this.elementExperience.id + " > .Experience_Loading")
            // Obtengo la etiqueta del marco para los controles
            this.elementControls = document.querySelector("#" + this.elementExperience.id + " > .Experience_Controls")
            // if FPS are show
            if (this.options.showFPS === true) {
                // Get FPS html element from the doom
                this.elementFPS = document.querySelector("#" + this.elementExperience.id + " > .Experience_Controls > .Experience_Static > .Experience_FPS")
            }
        }

        // Determino el ancho y altura del canvas (fijo o variable)
        if (this.options.width  === "auto") { this.width  = this.options.width;  }
        if (this.options.height === "auto") { this.height = this.options.height; }        
        // Si el canvas es de ancho fijo, añado el css para centrar-lo
        if (this.options.width  !== "auto") { 
            this.sizes.width = this.options.width;
            this.elementCanvas.style.width  = this.sizes.width  + "px"; 
        }
        if (this.options.left  === "auto") { 
            this.elementCanvas.style.left   = "calc(50% - (" + this.width  + "px / 2))"; 
        }

        if (this.options.height !== "auto") { 
            this.sizes.height = this.options.height;
            this.elementCanvas.style.height = this.height + "px"; 
        }
        if (this.options.top  === "auto") { 
            this.elementCanvas.style.top    = "calc(50% - (" + this.height + "px / 2))"; 
        }

        // Actualizo las posiciones
//        this.eventResize();
    }
}

/* 
 * BufferCanvas
 */
class BufferCanvas {
    constructor(width, height) {
        this.canvas  = document.createElement("canvas");
        this.canvas.setAttribute("width", width);
        this.canvas.setAttribute("height", height);
        this.context = this.canvas.getContext("2d", { willReadFrequently : true }); 
        this.width   = width;
        this.height  = height;
    }

    debug_InsertCanvasIntoBody() {
        document.body.appendChild(this.canvas);
        this.canvas.style.zIndex = 100;
        this.canvas.style.position = "fixed";
        this.canvas.style.top = 0;
    }
}

/* 
 * AudioAnalizer
 */
class AudioAnalizer {
    constructor() {
        this.experience     = new Experience();
        this.time           = this.experience.time;
//        this.audioSourceDD  = { context : { currentTime : 0 } };
        this.songLoaded     = false;
        this.htmlElements   = this.experience.htmlElements;
        // Current time for the blue channel smoth function
        this.curTimeB       = 0;

        this.averageFrequency = [ 0, 0, 0, 0, 0 ];
//        this.songList       = [];
    
//        start();
    }

    setupAudio() {
        this.context        = new AudioContext();

        this.gainNode                         = this.context.createGain();
        this.analizer                         = this.context.createAnalyser();
        this.analizer.fftSize                 = this.fftSize;
        this.analizer.smoothingTimeConstant   = this.experience.debugOptions.smoothingTimeConstant; // 
    }


    start(fftSize = 2048/*, fnReady = () => {}, fnEnded = () => {}*/) {
        this.fftSize         = fftSize;
        this.square          = Math.sqrt(this.fftSize * 0.5);
        //this.bufferCanvas    = new BufferCanvas(this.square, this.square);
        //this.imageData       = this.bufferCanvas.context.createImageData(this.square, this.square);
        this.analizerData    = new Uint8Array(fftSize * 0.5);
        this.analizerDataSin = new Uint8Array(fftSize * 0.5);


        // Drag & drop event
        this.hEventDragEnter = this.eventDragEnter.bind(this);
        this.hEventDragOver  = this.eventDragOver.bind(this);
        this.hEventDrop      = this.eventDrop.bind(this);
        this.experience.canvas.addEventListener("dragenter", this.hEventDragEnter);
        this.experience.canvas.addEventListener("dragover" , this.hEventDragOver);
        this.experience.canvas.addEventListener("drop"     , this.hEventDrop);

        // Audio textures
        this.bufferCanvasSquare         = new BufferCanvas(this.square, this.square);
        this.bufferCanvasSquare.texture = new THREE.CanvasTexture(this.bufferCanvasSquare.canvas);
        this.imageDataSquare            = this.bufferCanvasSquare.context.createImageData(this.square, this.square);
        this.bufferCanvasLinear         = new BufferCanvas(1024, 1);
        this.bufferCanvasLinear.texture = new THREE.CanvasTexture(this.bufferCanvasLinear.canvas);
        this.imageDataLinear            = this.bufferCanvasLinear.context.createImageData(1024, 1);


        this.bufferCanvasSquare.texture.generateMipMaps = false;
        this.bufferCanvasSquare.texture.minFilter = THREE.NearestFilter;
        this.bufferCanvasSquare.texture.magFilter = THREE.NearestFilter;

        this.bufferCanvasLinear.texture.generateMipMaps = false;
        this.bufferCanvasLinear.texture.minFilter = THREE.NearestFilter;
        this.bufferCanvasLinear.texture.magFilter = THREE.NearestFilter;        
    }

    
    loadSong(path) {
        if (typeof this.song !== "undefined") {
            this.song.pause();
            this.songLoaded = false;
            this.experience.loading = true;
            // Put the pause button visible, and play button invisible
            this.experience.htmlElements.audioUI(false);
        }
         
        this.song                = new Audio();
        this.song.controls       = true;
        this.song.crossOrigin    = "anonymous";
        this.song.src            = path;          // "/Canciones/cancion.mp3"
        this.song.addEventListener('canplay', () => { this.canPlay() });
        this.song.addEventListener('ended'  , () => { 
            this.experience.htmlElements.elementPlay.setAttribute("play", "true");
            this.experience.htmlElements.elementPause.setAttribute("play", "true");
    //            this.fnEnded.bind(this);
        });                

        this.song.addEventListener('error'  , (e) => { 
            this.experience.htmlElements.elementPlay.setAttribute("play", "true");
            this.experience.htmlElements.elementPause.setAttribute("play", "true");
            console.log(e);
            window.alert("Error loading the song");
        });
        // Update max time
        this.song.addEventListener('durationchange'  , () => { 
            // Update max time on the time slider
            this.htmlElements.elementAudioTime.setAttribute("max", this.song.duration);
        });                
        
    }



    loadSongDrop(files) {
//        if (this.songLoaded === false) { return; }
        this.experience.loading = true;
        this.songLoaded = false;
        // Stop previous song
        if (typeof(this.song) === "object") {
            this.song.pause();
            this.song.currentTime = 0;
        }
        this.song                = new Audio();
        this.song.controls       = true;
        this.song.crossOrigin    = "anonymous";
        this.song.src            = URL.createObjectURL(files[0]); 

        this.song.addEventListener('canplay', () => { this.canPlayDrop(); });
        this.song.addEventListener('ended'  , () => { 
            this.experience.htmlElements.elementPlay.setAttribute("play", "true");
            this.experience.htmlElements.elementPause.setAttribute("play", "true");
        });                
        
        // Update max time
        this.song.addEventListener('durationchange'  , () => { 
            // Update max time on the time slider
            this.htmlElements.elementAudioTime.setAttribute("max", this.song.duration);
        });                
    }

    // Función que detecta si está en play o en pausa, y asigna el estado contrario
    playPause() {
        if (typeof this.context === "undefined") {
            this.setupAudio();
            this.loadSong(this.experience.song.path);
        }


        this.context.resume();
        
        // If song is playing
        if (this.song.duration > 0 && !this.song.paused) { 
            this.song.pause(); 
            return false;  
        } 
        else {
            this.song.play();   
            return true;   
        }        
    };



    canPlay() {
        if (this.songLoaded !== true) {
            this.experience.loading = false;
            this.songLoaded         = true;
            this.audioSource        = this.context.createMediaElementSource(this.song);
            this.audioSource.connect(this.analizer);
            this.analizer.connect(this.gainNode);
            this.gainNode.connect(this.context.destination);
            // Update max time on the time slider
            this.htmlElements.elementAudioTime.setAttribute("max", this.song.duration);
        }
    }

    // Function called when is posible to play a drag & drop song
    canPlayDrop() {
        this.canPlay();
        this.song.play();
    }

    eventDragEnter(e) {
        return false;
    }

    eventDragOver(e) {
        return e.preventDefault();
    }

    eventDrop(e) {
        this.loadSongDrop(e.dataTransfer.files);
        e.stopPropagation();  
        e.preventDefault();             
    }

    update() {
        if (typeof(this.analizer)=== "undefined") return;
        // get wave frequancy buffers
        this.analizer.getByteFrequencyData(this.analizerData);
        this.analizer.getByteTimeDomainData(this.analizerDataSin);        
        
        // paint audio texture ussing analizerData
        this.paintAudioTexture();

        // get average frequency
        this.averageFrequency = this.getAverageFrequency();

        // set the current time if the user its not changin it
        if (this.htmlElements.dragTime === false) {
            this.htmlElements.elementAudioTime.value = this.song.currentTime;
        }
    }

    getAverageFrequency() {
        // greus  de 0hz a 256hz
        // mitjos de 257hz a 2000hz
        // aguts  de 2001hz a 16000hz
        let hzBar      = this.context.sampleRate / this.fftSize;
        let divisions  = [ 256, 2000, 16000, 50000 ];
        let total      = [ 0, 0, 0, 0, 0 ];// Graves, Medios, Agudos, Agudos inaudibles, Media de todo
        let values     = [ 0, 0, 0, 0, 0 ];// Graves, Medios, Agudos, Agudos inaudibles, Media de todo
        let pos        = 0;        
        let totalFreq = this.fftSize / 2;
        for (let i = 0; i < totalFreq; i++) {
            if (i * hzBar > divisions[pos]) {
                pos++;
            }
            total[pos]  ++;
            values[pos] += this.analizerData[i];            
            values[4]   += this.analizerData[i];
        }
        
        return [ values[0] / total[0],    // High
                 values[1] / total[1],    // Medium
                 values[2] / total[2],    // Low
                 values[3] / total[3],    // Inaudible
                 values[4] / totalFreq ]; // Total average
    }

    // Updates internal audio data textures
    // For the floor whe need a 32x32 texture, and for the rest of the effects a 1024x1 texture
    // Red channel is the Frequency data, and the Green channel is the time domain data
    paintAudioTexture() {
        for (let y = 0; y < this.square; y++) {
            for (let x = 0; x < this.square * 2; x++) {
                // position for a 1024 array
                let pos = (x + y * this.square);
                // set red channel with the frequency, and the green channel with time domain
                let rValue = this.analizerData[pos];
                let gValue = this.analizerDataSin[pos];
                let bValue = gValue;

                // position for a 4098 array
                pos = pos * 4;

                // fill the 32*32 image
                this.imageDataSquare.data[pos]     = rValue;
                this.imageDataSquare.data[pos + 1] = gValue;
                this.imageDataSquare.data[pos + 2] = bValue;
                this.imageDataSquare.data[pos + 3] = 255;
                // fill the 1024*1 image
                this.imageDataLinear.data[pos]     = rValue;
                this.imageDataLinear.data[pos + 1] = gValue;
                this.imageDataLinear.data[pos + 2] = bValue;
                this.imageDataLinear.data[pos + 3] = 255;
            }
        }
        this.bufferCanvasSquare.context.putImageData(this.imageDataSquare, 0, 0, 0, 0, 32, 32);
        this.bufferCanvasSquare.texture.needsUpdate = true;

        this.bufferCanvasLinear.context.putImageData(this.imageDataLinear, 0, 0, 0, 0, 1024, 1);
        this.bufferCanvasLinear.texture.needsUpdate = true;
    }


    destroy() {
        this.experience.canvas.removeEventListener("dragenter", this.hEventDragEnter);
        this.experience.canvas.removeEventListener("dragover" , this.hEventDragOver);
        this.experience.canvas.removeEventListener("drop"     , this.hEventDrop);
    }

}

/* 
 * Circular
 */
class Circular {
    constructor(world) {
        this.experience     = new Experience();
        this.scene          = this.experience.scene;
        this.world          = world;
        this.time           = this.experience.time;
        this.audioAnalizer  = this.experience.audioAnalizer;

        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize },
                uTime          : { value : 0 },
                uHover         : { value : 0.0 },
            },
            vertexShader    : document.getElementById("BasicVertexShader").innerHTML,
            fragmentShader  : document.getElementById("CircularFragmentShader").innerHTML,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthWrite      : true,
        });

        // Plane for the red channel circular shader
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = -Math.PI * 0.5;
        this.mesh.position.y += 3;
        this.mesh.position.x -= 3;
        this.mesh.name = "Circular";
        this.mesh.castShadow = this.experience.debugOptions.shadows;

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.circularAudioStrength };
            shader.uniforms.uAlpha         = { value : this.experience.debugOptions.circularAlpha };
            shader.uniforms.uSize          = { value : this.experience.debugOptions.circularLineSize };
            shader.uniforms.uTime          = { value : 0 };
            shader.uniforms.uHover         = { value : 0.0 };
            shader.vertexShader            = document.getElementById("DepthVertexShader").innerHTML;
            shader.fragmentShader          = document.getElementById("CircularDepthFragmentShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }        

        this.scene.add(this.mesh);

    }

    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }

    update() {
        this.material.uniforms.uTime.value += this.time.delta / 1000;
    }
}

/*
 * CircularDistorsion
 */ 
class CircularDistorsion {
    constructor(world) {
        this.experience     = new Experience();
        this.scene          = this.experience.scene;
        this.world          = world;
        this.time           = this.experience.time;
        this.audioAnalizer  = this.experience.audioAnalizer;

        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength * 0.6 },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize },
                uTime          : { value : 0 },
                uHover         : { value : 0.0 },
            },
            vertexShader    : document.getElementById("BasicVertexShader").innerHTML,
            fragmentShader  : document.getElementById("CircularDistorsionFragmentShader").innerHTML,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthWrite      : false,
        });

//        this.material.alphaTest = 0;

        // Plane for the green channel circular distorsion shader
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = Math.PI * 0.5;
        this.mesh.position.y += 3;
        this.mesh.position.x -= 7;
        this.mesh.name = "CircularDistorsion";
        this.mesh.castShadow = this.experience.debugOptions.shadows;
        

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.circularAudioStrength * 0.75  };
            shader.uniforms.uAlpha         = { value : this.experience.debugOptions.circularAlpha };
            shader.uniforms.uSize          = { value : this.experience.debugOptions.circularLineSize };
            shader.uniforms.uTime          = { value : 0 };
            shader.uniforms.uHover         = { value : 0.0 };
            shader.vertexShader            = document.getElementById("DepthVertexShader").innerHTML;
            shader.fragmentShader          = document.getElementById("CircularDistorisionDepthFragmentShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.scene.add(this.mesh);

    }

    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }

    update() {
        this.material.uniforms.uTime.value += this.time.delta / 1000;
    }
}

/*
 * CircularSin
 */ 
class CircularSin {
    constructor(world) {
        this.experience     = new Experience();
        this.scene          = this.experience.scene;
        this.world          = world;
        this.time           = this.experience.time;
        this.audioAnalizer  = this.experience.audioAnalizer;

        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.circularAudioStrength },
                uAlpha         : { value : this.experience.debugOptions.circularAlpha },
                uSize          : { value : this.experience.debugOptions.circularLineSize },
                uTime          : { value : 0 },
                uHover         : { value : 0.0 },
            },
            vertexShader    : document.getElementById("BasicVertexShader").innerHTML,
            fragmentShader  : document.getElementById("CircularSinFragmentShader").innerHTML,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthWrite      : false,
        });



        // Plane for the red channel circular shader
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = -Math.PI * 0.5;
        this.mesh.position.y += 7;
        this.mesh.position.x -= 3;
        this.mesh.name = "CircularSin";
        this.mesh.castShadow = this.experience.debugOptions.shadows;


        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.circularAudioStrength };
            shader.uniforms.uAlpha         = { value : this.experience.debugOptions.circularAlpha };
            shader.uniforms.uSize          = { value : this.experience.debugOptions.circularLineSize };
            shader.uniforms.uTime          = { value : 0 };
            shader.uniforms.uHover         = { value : 0.0 };
            shader.vertexShader            = document.getElementById("DepthVertexShader").innerHTML;
            shader.fragmentShader          = document.getElementById("CircularSinDepthFragmentShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.scene.add(this.mesh);

    }


    visible(show) {
        if (show === true) this.scene.add(this.mesh);
        else               this.scene.remove(this.mesh);
    }

    update() {
        this.material.uniforms.uTime.value += this.time.delta / 1000;
    }
}

/* 
 * Environment
 */
class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene      = this.experience.scene; 
        this.resources  = this.experience.resources;
        this.debug      = this.experience.debug;


        this.setSunLight();
        this.setSpotLight();
    }

    setSpotLight() {
        this.spotLight = new THREE.SpotLight(0xcccccc, this.experience.debugOptions.spotLightIntensity, 100, Math.PI * 0.1, 0.25, 0.25);
//        this.spotLight.position.set(1, 20, 27);
        this.spotLight.position.set(this.experience.debugOptions.spotLightPosX, this.experience.debugOptions.spotLightPosY, this.experience.debugOptions.spotLightPosZ);
//        this.spotLight.target.position.set(-1, 0, 1)
        this.spotLight.castShadow = this.experience.debugOptions.shadows;

        //Set up shadow properties for the light
        this.spotLight.shadow.mapSize.set(1024, 1024);
        this.spotLight.shadow.camera.near = 0.1; // default
        this.spotLight.shadow.camera.far = 1; // default
        this.spotLight.shadow.focus = 1; // default
        
        this.spotLight.visible = this.experience.debugOptions.spotLightVisible;

        this.scene.add(this.spotLight, this.spotLight.target);
    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', this.experience.debugOptions.sunLightIntensity)
        this.sunLight.castShadow = this.experience.debugOptions.shadows;
        this.sunLight.shadow.camera.far = 64;
        this.sunLight.shadow.mapSize.set(1024, 1024);
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.shadow.camera.bottom = -16;
        this.sunLight.shadow.camera.top    =  16;
        this.sunLight.shadow.camera.left   = -16;
        this.sunLight.shadow.camera.right  =  16;
        this.sunLight.position.set(-5, 18, 27);

        this.sunLight.visible = this.experience.debugOptions.sunLightVisible;

        this.scene.add(this.sunLight)
    }

    setEnvironmentMap() {
        this.environmentMap                     = {};
        this.environmentMap.intensity           = 0.5;
        this.environmentMap.texture             = this.resources.items.environmentMapTexture;
        this.environmentMap.texture.encoding    = THREE.sRGBEncoding;

      // this.scene.background  = this.environmentMap.texture;
        this.scene.environment = this.environmentMap.texture;

        this.environmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMap           = this.environmentMap.texture;
                    child.material.envMapIntensity  = this.environmentMap.intensity;
                    child.material.needsUpdate      = true;
                }
            })
        }
        this.environmentMap.updateMaterials();
    }
}

/*
 * Floor
 */
class Floor {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.time          = this.experience.time;
        this.audioAnalizer = this.experience.audioAnalizer;

        this.world         = world;
        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(32, 32, 32, 32);
        this.material = new THREE.MeshStandardMaterial({
            // Replace vertex shader and add more uniforms
            onBeforeCompile : (shader) => {
                // Add uniforms
                shader.uniforms.uAudioTexture    = { value : this.audioAnalizer.bufferCanvasSquare.texture };
                shader.uniforms.uAudioStrength   = { value : this.experience.debugOptions.floorAudioStrength };
                shader.uniforms.uColorGrid       = { value : this.experience.debugOptions.floorColorGrid },
                shader.uniforms.uTime            = { value : 0 }
                
                // New vertex shader
                shader.vertexShader = document.getElementById("FloorStandardVertexShader").innerHTML;                
                // New fragment shader
                shader.fragmentShader = document.getElementById("FloorStandardFragmentShader").innerHTML;
                // Make uniforms visible in the material
                this.material.uniforms = shader.uniforms;
            },
            color         : new THREE.Color(this.experience.debugOptions.floorColorBackground),
            wireframe     : false,
            side          : THREE.DoubleSide,
            transparent   : true,
            opacity       : 1,

        });        

        
        // Solid mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = - Math.PI * 0.5
        this.mesh.position.y = -8.00;
        this.mesh.position.z = -12.00;
        this.mesh.name = "Floor";
        this.mesh.receiveShadow = this.experience.debugOptions.shadows;
        this.mesh.castShadow    = this.experience.debugOptions.shadows;
//        this.mesh.material.color = new THREE.Color("#4747e1");

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.osciloscopeAudioStrength };
            shader.vertexShader            = document.getElementById("FloorDepthVertexShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }



        this.scene.add(this.mesh);

    }

    update() {
        if (typeof this.material.uniforms !== "undefined") {
            this.material.uniforms.uTime.value     += this.time.delta / 1000;
        }
    }
}

/* 
 * Osciloscope
 */
class Osciloscope {
    constructor(world) {
        this.experience           = new Experience();
        this.scene                = this.experience.scene;
        this.sizes                = this.experience.sizes;
        this.audioAnalizer        = this.experience.audioAnalizer;
        this.world                = world;
        
        this.setup();
    }


    setup() {

        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.osciloscopeAudioStrength },
                uAudioZoom     : { value : this.experience.debugOptions.osciloscopeAudioZoom },
                uSize          : { value : this.experience.debugOptions.osciloscopeLineSize },
                uAlpha         : { value : this.experience.debugOptions.osciloscopeAlpha },
                uHover         : { value : 0.0 },
//                uTime         : { value : 0 }
            },
            vertexShader    : document.getElementById("BasicVertexShader").innerHTML,
            fragmentShader  : document.getElementById("OsciloscopeFragmentShader").innerHTML,
            transparent     : true,
            side            : THREE.DoubleSide,
            depthWrite      : false
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.y += 7;
        this.mesh.position.x -= 7;
        this.mesh.name = "Osciloscope";
        this.mesh.castShadow =  this.experience.debugOptions.shadows;

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.osciloscopeAudioStrength };
            shader.uniforms.uAudioZoom     = { value : this.experience.debugOptions.osciloscopeAudioZoom },
            shader.uniforms.uAlpha         = { value : this.experience.debugOptions.osciloscopeAlpha };
            shader.uniforms.uSize          = { value : this.experience.debugOptions.osciloscopeLineSize };
            shader.uniforms.uTime          = { value : 0 };
            shader.uniforms.uHover         = { value : 0.0 };
            shader.vertexShader            = document.getElementById("DepthVertexShader").innerHTML;
            shader.fragmentShader          = document.getElementById("OsciloscopeDepthFragmentShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }


        this.scene.add(this.mesh);

    }

}

/* 
 * YinYang
 */
class YinYang {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.time          = this.experience.time;
        this.world         = world;
        
        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uHighFrequency : { value : 0 },
                uLowFrequency  : { value : 0 },
                uTime          : { value : 0 },
                uAlpha         : { value : this.experience.debugOptions.yinYangAlpha },
                uRotate        : { value : 1.0 },
                uHover         : { value : 0.0 },
                uColorStrength : { value : 0   }
            },
            vertexShader    : document.getElementById("BasicVertexShader").innerHTML,
            fragmentShader  : document.getElementById("YinYangFragmentShader").innerHTML,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthWrite      : false,

        });


        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = -Math.PI;
        this.mesh.position.y += 3;
        this.mesh.position.x += 1;
        this.mesh.castShadow =  this.experience.debugOptions.shadows;
        this.mesh.name = "YinYang";
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Need this structure formed on the first updates, when customDepthMaterial is compiled
        // is filled with the real values
        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0.0 }};
        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uHighFrequency = { value : 0 };
            shader.uniforms.uLowFrequency  = { value : 0 };
            shader.uniforms.uTime          = { value : 0 };
            shader.uniforms.uAlpha         = { value : this.experience.debugOptions.yinYangAlpha };
            shader.uniforms.uRotate        = { value : 1.0 };
            shader.uniforms.uHover         = { value : 0.0 };
            shader.uniforms.uColorStrength = { value : 0   };
            shader.vertexShader            = document.getElementById("DepthVertexShader").innerHTML;
            shader.fragmentShader          = document.getElementById("YinYangDepthFragmentShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.scene.add(this.mesh);


    }

    update() {
        // Divided by 1024 to get values from 0.0 to 0.25
        this.material.uniforms.uHighFrequency.value = (255 - this.audioAnalizer.averageFrequency[2]) / 5024;
        this.material.uniforms.uLowFrequency.value  = this.audioAnalizer.averageFrequency[2] / 5024;
        this.material.uniforms.uColorStrength.value = 0.125 + this.audioAnalizer.averageFrequency[2] / 192;
        this.material.uniforms.uTime.value         += this.time.delta / 1000;
        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;
    }
}

/* 
 * YinYangSin
 */
class YinYangSin {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.time          = this.experience.time;
        this.world         = world;
        
        this.setup();
    }

    setup() {
        this.geometry = new THREE.PlaneGeometry(3, 3);


        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uHighFrequency : { value : 0 },
                uLowFrequency  : { value : 0 },
                uTime          : { value : 0 },
                uAlpha         : { value : this.experience.debugOptions.yinYangAlpha },
                uRotate        : { value : 1.0 },
                uHover         : { value : 0.0 },
                uColorStrength : { value : 0   }
            },
            vertexShader    : document.getElementById("BasicVertexShader").innerHTML,
            fragmentShader  : document.getElementById("YinYangSinFragmentShader").innerHTML,
            transparent     : true, 
            side            : THREE.DoubleSide,
            depthWrite      : false
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.y += 7;
        this.mesh.position.x += 1;
        this.mesh.name = "YinYangSin";
        this.mesh.castShadow =  this.experience.debugOptions.shadows;

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Need this structure formed on the first updates, when customDepthMaterial is compiled
        // is filled with the real values
        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0.0 }};
        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uHighFrequency = { value : 0 };
            shader.uniforms.uLowFrequency  = { value : 0 };
            shader.uniforms.uTime          = { value : 0 };
            shader.uniforms.uAlpha         = { value : this.experience.debugOptions.yinYangAlpha };
            shader.uniforms.uRotate        = { value : 1.0 };
            shader.uniforms.uHover         = { value : 0.0 };
            shader.uniforms.uColorStrength = { value : 0   };
            shader.vertexShader            = document.getElementById("DepthVertexShader").innerHTML;
            shader.fragmentShader          = document.getElementById("YinYangSinDepthFragmentShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }

        this.scene.add(this.mesh);

    }

    update() {
        // Divided by 1024 to get values from 0.0 to 0.25
        this.material.uniforms.uHighFrequency.value = (255 - this.audioAnalizer.averageFrequency[0]) / 5024;
        this.material.uniforms.uLowFrequency.value  = this.audioAnalizer.averageFrequency[2] / 5024;
        this.material.uniforms.uColorStrength.value = 0.125 + this.audioAnalizer.averageFrequency[2] / 192;
        this.material.uniforms.uTime.value         += this.time.delta / 1000;
        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;
    }
}

/* 
 * AudioInfo
 */
class AudioInfo {
    constructor(world) {
        this.experience = new Experience();
        this.scene      = this.experience.scene;
        this.world      = world;
        this.font       = this.experience.resources.items.jsonFont;

        this.material = new THREE.MeshStandardMaterial({ color : "#888888" });
        this.setup();
    }

    setup() {
        if (typeof this.geometry !== "undefined") {
            this.scene.remove(this.mesh);            
        }

        this.geometry = new TextGeometry(this.experience.song.name + "\n" + this.experience.song.group, {
            font : this.font,
            size : 1,
            height : 0.01,
            curveSegments: 4,
            bevelThickness: 0.02,
            bevelSize: 0.05,
            bevelEnabled: true,
            depth: 0.21
        });

        this.geometry.computeBoundingBox();

        const centerOffset = - 0.5 * ( this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x );

        this.mesh = new THREE.Mesh( this.geometry,  this.material);        
        this.mesh.position.x = centerOffset;
        this.mesh.position.z = 7;
        this.mesh.position.y = -2;
        this.mesh.rotation.x = Math.PI * -0.25;
        this.mesh.name = "AudioInfo";
        this.mesh.castShadow = this.experience.debugOptions.shadows;
        this.scene.add(this.mesh);
    }
}


/* 
 * PerlinSun
 */
class SSPerlinSun {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.time          = this.experience.time;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.world         = world;
        this.setup();
    }

    setup() {        
        this.geometry = new THREE.PlaneGeometry(3, 3);

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture   : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uTime           : { value : 0 },
                uAlpha          : { value : this.experience.debugOptions.perlinSunAlpha },
                uRotate         : { value : 1.0 },
                uHover          : { value : 0.0 },
                uColorFrequency : { value : this.experience.debugOptions.ssPerlinSunColorFrequency },
                uColorSin       : { value : this.experience.debugOptions.ssPerlinSunColorSin },
                uNoiseStrength  : { value : this.experience.debugOptions.ssPerlinSunNoiseStrength },
                uNoiseSpeed     : { value : this.experience.debugOptions.ssPerlinSunNoiseSpeed }
            },
            vertexShader    : document.getElementById("BasicVertexShader").innerHTML,
            fragmentShader  : document.getElementById("SSPerlinSunFragmentShader").innerHTML,
            transparent     : true, 
            side            : THREE.DoubleSide,

        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.z = -Math.PI * 0.5;
        this.mesh.name = "SSPerlinSun";
        this.mesh.castShadow =  this.experience.debugOptions.shadows;
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Create a pseudo uniforms before depth material is compiled, to not crash the update function
        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0 } };

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture   = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uTime           = { value : 0 };
            shader.uniforms.uAlpha          = { value : this.experience.debugOptions.perlinSunAlpha };
            shader.uniforms.uRotate         = { value : 1.0 };
            shader.uniforms.uNoiseStrength  = { value : this.experience.debugOptions.ssPerlinSunNoiseStrength }
            shader.uniforms.uNoiseSpeed     = { value : this.experience.debugOptions.ssPerlinSunNoiseSpeed }

            shader.vertexShader            = document.getElementById("DepthVertexShader").innerHTML;
            shader.fragmentShader          = document.getElementById("SSPerlinSunDepthFragmentShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }
        
        
      
        this.mesh.position.set(5, 7, 0);
        this.scene.add(this.mesh);


    }


    update() {
        //
        const advance = this.time.delta / 1000;
        // update time on perlin sun
        this.material.uniforms.uTime.value         += advance;   
        // update time on perlin sun shadow
        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;
     
    }
}

/* 
 * Sphere
 */
class Sphere {
    constructor(world) {
        this.experience    = new Experience();
        this.scene         = this.experience.scene;
        this.time          = this.experience.time;
        this.audioAnalizer = this.experience.audioAnalizer;
        this.world         = world;
        this.setup();
    }

    
    setup() {
        this.geometry = new THREE.SphereGeometry( 1, 64, 64 ); 
        this.material = new THREE.MeshStandardMaterial({ 
            // Replace vertex shader and add more uniforms
            onBeforeCompile : (shader) => {
                // Add uniforms
                shader.uniforms.uAudioTexture    = { value : this.audioAnalizer.bufferCanvasSquare.texture };
                shader.uniforms.uAudioStrength   = { value : this.experience.debugOptions.sphereAudioStrength };
                shader.uniforms.uAudioZoom       = { value : this.experience.debugOptions.sphereAudioZoom },
                shader.uniforms.uTime            = { value : 0 }
                shader.uniforms.uHover           = { value : 0.0 }
                // New fragment shader
                shader.vertexShader = document.getElementById("SphereStandardVertextShader").innerHTML;
                // Make uniforms visible in the material
                this.material.uniforms = shader.uniforms;                
            },
            color : new THREE.Color("#892d95"),
            emissive : new THREE.Color("#000000"),
            roughness : 0.2,
            metalness : .3,
        });

        this.material.uniforms = { uTime : { value : 0.0 }};


        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.y = -Math.PI * 0.5;       
        this.mesh.name = "Sphere" ;

        this.mesh.position.set(-6, 3, -10);
        
        
        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
                depthPacking: THREE.RGBADepthPacking
        });

        // Create a pseudo uniforms before depth material is compiled, to not crash the update function
        this.mesh.customDepthMaterial.uniforms = { uTime : { value : 0 } };
        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioStrength  = { value : this.experience.debugOptions.sphereSinAudioStrength };
            shader.uniforms.uAudioZoom      = { value : this.experience.debugOptions.sphereSinAudioZoom };
            shader.uniforms.uAudioTexture   = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uTime           = { value : 0 };

            shader.vertexShader            = document.getElementById("SphereDepthVertexShader").innerHTML;
            this.mesh.customDepthMaterial.uniforms = shader.uniforms;
        }
        
        this.scene.add(this.mesh);
    }


    update() {
        //
        const advance = this.time.delta / 1000;
        
        // update time on sphere
        this.material.uniforms.uTime.value += advance;   
        // update time on custom depth material
        this.mesh.customDepthMaterial.uniforms.uTime.value = this.material.uniforms.uTime.value;
    }
}

/* 
 * Bars
 */
class Bars {
    
    constructor(world) {
        this.experience      = new Experience();
        this.audioAnalizer   = this.experience.audioAnalizer;
        this.scene           = this.experience.scene;
        this.world           = world;
        
        // Could be a square but makes no sense with the floor
        this.createBars(256,1);
    }

    visible(show) {
        if (show === true) this.scene.add(this.bars);
        else               this.scene.remove(this.bars);
    }

    createBars(width, height) {
        if (typeof(this.bars) !== "undefined") {
            this.scene.remove(this.bars);
            this.geometry.dispose();
            this.material.dispose();
        }

        let   size       = width * height;

        let cubeGeometries = [];

        this.material = new THREE.ShaderMaterial({
            uniforms : {
                uAudioTexture  : { value : this.audioAnalizer.bufferCanvasLinear.texture },
                uAudioStrength : { value : this.experience.debugOptions.barsAudioStrength },
//                uTime         : { value : 0 }
            },
            vertexShader    : document.getElementById("BarsVertexShader").innerHTML,
            fragmentShader  : document.getElementById("BarsFragmentShader").innerHTML,
//            transparent     : true
        });


//        let counter = 0;

        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const geometry = new THREE.BoxGeometry(0.09, 0.1, 0.09);

                const nx = (-(width * 0.5) + x) * 0.1;
                const nz = (-(height * 0.5) + z) * 0.1;

                geometry.translate(nx, 0, nz);

                cubeGeometries.push(geometry);
            }
        }

        const numPos = 24;
        this.idArray  = new Float32Array(size * numPos);        
        this.geometry = BufferGeometryUtils.mergeGeometries(cubeGeometries);
        let count = 0;
        // fill each cube with his id
        for (let g = 0; g < size * numPos; g+= numPos) {
            for (let n = 0; n < numPos; n++) {
                this.idArray[g + n] = count / size;
            }            
            count++;
        }
        this.geometry.setAttribute('aId', new THREE.BufferAttribute(this.idArray, 1));

        // clear cube geometries used to create the merged geometry
        for (let i = 0; i < size; i++) {
            cubeGeometries[i].dispose();
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = this.experience.debugOptions.shadows;

        this.mesh.position.z += 4.5;
        this.mesh.name = "Bars";

        // Custom depth material
        this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ 
            depthPacking: THREE.RGBADepthPacking
        });

        // Modify the default depth material
        this.mesh.customDepthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uAudioTexture  = { value : this.audioAnalizer.bufferCanvasLinear.texture };
            shader.uniforms.uAudioStrength = { value : this.experience.debugOptions.barsAudioStrength };
            shader.vertexShader            = document.getElementById("BarsDepthVertexShader").innerHTML;
        }

        this.scene.add(this.mesh);
    }

    
    update() {
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}


/* 
 * World
 */
class World {
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
//        this.spiral              = new Spiral(this);
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
//        this.spiral.mesh.castShadow                           = enable;

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
    }


    updateRaycaster() {

    }

    update() {
        if (this.ready === true) {

            this.updateRaycaster();

//            this.frequencyTexture.update();
            // Floor need to be updated / painted firsªt
            this.floor.update();
            this.circular.update();
            this.circularSin.update();
            this.circularDistorsion.update();
            this.yinYang.update();
            this.yinYangSin.update();
            this.ssPerlinSun.update();
            this.sphere.update();

        }
    }
}

let experienceInstance = null;

class Experience {
    // Songs from jamendo with name group and url
    songs = [
        
        {
            name  : "Cyberpunk Metal",
            group : "Vikhlyantsev Evgeny", // Вихлянцев_Евгений
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/Вихлянцев_Евгений_-_Cyberpunk_Metal(Game,Videos).mp3", 
            url   : "https://www.jamendo.com/track/1892989/cyberpunk-metal-game-videos"             
        },
        {
            name  : "Kill City Kills",
            group : "Ride into the Badlands", 
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/Kill_City_Kills_-_Ride_into_the_Badlands_-_Kill_City_Kills.mp3", 
            url   : "https://www.jamendo.com/track/1901190/kill-city-kills-ride-into-the-badlands"             
        },
        {
            name  : "Battle Trance",
            group : "JT Bruce", 
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/BattleTrance.mp3", 
            url   : "https://www.jamendo.com/track/1237162/battle-trance" 
        }, {
            name  : "Nothing's Over",
            group : "In Camera", 
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/In_Camera_-_Nothing_s_Over.mp3", 
            url   : "https://www.jamendo.com/track/1397271/nothing-s-over" 
        }, {
            name  : "One Chance",
            group : "Fallen to Flux", 
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/OneChance.mp3", 
            url   : "https://www.jamendo.com/track/1155241/one-chance" 
        }, {
            name  : "Quantum Ocean",
            group : "From Sky to Abyss", 
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/QuantumOcean.mp3", 
            url   : "https://www.jamendo.com/track/1284951/quantum-ocean" 
        }, {
            name  : "Six Feet Under",
            group : "Convergence", 
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/Convergence_-_Six_feet_under.mp3", 
            url   : "https://www.jamendo.com/track/80122/six-feet-under" 
        }, {
            name  : "The Deep",
            group : "Anitek", 
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/The_Deep_-_Anitek.mp3", 
            url   : "https://www.jamendo.com/track/1884527/the-deep" 
        }, {
            name  : "Alone",
            group : "Color out", 
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/Alone_-_Color_Out.mp3", 
            url   : "https://www.jamendo.com/track/1886257/alone" 
        }, {
            name  : "Lost",
            group : "Jount",
            path  : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/Jount_-_Lost_-_Jount.mp3",
            url   : "https://www.jamendo.com/track/1910909/jount-lost" 
        }

    ]

    optionsExperienceByDefault = {
        // Y position. Use 'auto' to center canvas horizontaly to the view port
        top                     : 0,
        // X position. Use 'auto' to center canvas verticaly to the view port
        left                    : 0,
        // Width in pixels. Use 'auto' to fit all viewport width
        width                   : "auto",           
        // Height in pixels. Use 'auto' to fit all viewport height
        height                  : "auto",           
        // Show framerate inside the butons frame
        showFPS                 : true,            
        // Show full screen buton in the buttons frame
        buttonFullScreen        : true,            
        // Show my logo buton in the buttons frame (that redirects to devildrey33.es)
        buttonLogo              : true,            
        // Show a github icon to go to the example repository
        buttonGitHub            : true,
        // GitHub url for this project (only used if buttonGitHub is true)
        urlGitHub               : "https://github.com/devildrey33/Audio-PlayGround",
        // Element where canvas is inserted (by default is document.body)
        // For example you can use document.getElementById() to retrieve tag inside you want to create the canvas
        rootElement             : document.body,
        // Anti alias (by default true)
        antialias               : true
    };

    panelAlpha = 0.0;

    /* debug options for lil.gui */
    debugOptions = {
        songName                         : "",

        shadows                          : true,

        sunLightVisible                  : false,
        sunLightIntensity                : 0.5,
        sunLightColor                    : new THREE.Color("#ffffff"),
        sunLightPosX                     : -5.0,
        sunLightPosY                     : 18.0,
        sunLightPosZ                     : 27.0,

        spotLightVisible                 : true,
        spotLightIntensity               : 0.5,
        spotLightColor                   : new THREE.Color(0xcccccc),
        spotLightPosX                    : -5.0,
        spotLightPosY                    : 46.8,
        spotLightPosZ                    : 36.3,

        osciloscopeLineSize              : 0.04,
        osciloscopeAlpha                 : this.panelAlpha,
        osciloscopeAudioStrength         : 0.5,
        osciloscopeAudioZoom             : 1,
        osciloscopeVisible               : true,
        osciloscopeCylinderLineSize      : 0.005,
        osciloscopeCylinderAlpha         : this.panelAlpha,
        osciloscopeCylinderAudioStrength : 0.25,
        osciloscopeCylinderAudioZoom     : 1,

        floorAudioStrength               : 5,
        floorVisible                     : true,
        floorColorBackground             : new THREE.Color("#4747e1"), // 2a2a8d
        floorColorGrid                   : new THREE.Color("#ffffff"),

        barsAudioStrength                : 2,
        barsCount                        : 256,
        barsVisible                      : true,
        barsCylinderColor1               : new THREE.Color("#6b6b9e"),
        barsCylinderColor2               : new THREE.Color("#ff0000"),
        barsCylinderAudioStrength        : 1,
        barsCylinderRotation             : 10,

        circularAudioStrength            : 0.4,
        circularLineSize                 : 0.07,
        circularAlpha                    : this.panelAlpha,
        circularRVisible                 : true,
        circularGVisible                 : true,
        circularDistorsionVisible        : true,

        yinYangAlpha                     : this.panelAlpha,
        yinYangRotate                    : true,
//        perlinSunAlpha                   : this.panelAlpha,
//        perlinSunColorFrequency          : new THREE.Color("#972020"), //new THREE.Color("rgb(25, 0, 25)"),
//        perlinSunColorSin                : new THREE.Color("#1e1f33"),  //new THREE.Color("rgb(50, 50, 250)"),
        ssPerlinSunColorFrequency        : new THREE.Color("#ddf38c"), //new THREE.Color("rgb(25, 0, 25)"),
        ssPerlinSunColorSin              : new THREE.Color("#6060e6"),  //new THREE.Color("rgb(50, 50, 250)"),
        ssPerlinSunNoiseStrength         : 15.0,
        ssPerlinSunNoiseSpeed            : 1.0,
        
        sphereAudioStrength              : 2,
        sphereAudioZoom                  : 1,
        sphereSinAudioStrength           : 5,
        sphereSinAudioZoom               : 1,

        spiralAudioStrength              : 0.75,
        spiralAudioZoom                  : 2.0,
        spiralAudioStrengthSin           : 1.0,
        spiralAudioZoomSin               : 1.0,
//        spiralRotateSpeed                : 0.5,
        spiralSpeed                      : 1.14,
        spiralFrequency                  : 0.5, // 0.1 are 10 lines, 0.01 are 100 lines
        spiralThickness                  : 0.66, 
        spiralSpeedSin                   : 1.67,
        spiralFrequencySin               : 0.5, // 0.1 are 10 lines, 0.01 are 100 lines
        spiralThicknessSin               : 0.02, 

        bloomThreshold                   : -0.8,
        bloomRadius                      : -1.32,
        bloomStrength                    : 0.55,
        bloomEnabled                     : true,
        // Only for a joke.. xd
        displacementAmplitudeX           : 0.04,
        displacementAmplitudeY           : 0.06,
        displacementFrequencyX           : 2.6,
        displacementFrequencyY           : 3.2,
        displacementEnabled              : false,

        smoothingTimeConstant            : 0.8, // from 0 to 0.99 (by default is 0.8)
    };


    // Constructor
    constructor(options) {
        // Look for previous instance
        if (experienceInstance) {
            // return the previous instance
            return experienceInstance;
        }
        experienceInstance = this;

        // Setup the default options
        this.options = this.optionsExperienceByDefault;
        // If options is an object 
        if (typeof(options) === "object") {
            // Overwrite the current option in the options of the experience
            for (let indice in options) {
                this.options[indice] = options[indice];
            }                        
        }

        // select a random song
        this.song = this.songs[Math.floor(Math.random() * this.songs.length)];
        this.debugOptions.songName = this.song.name;

        // Create the html tags and insert into body (canvas, buttons, fps, loading and error messages)
        this.htmlElements   = new HTMLElements();


        // Initialize canvas size
        this.sizes          = new Sizes();
        // Initialize time
        this.time           = new Time();

        this.canvas         = this.htmlElements.elementCanvas;

        this.audioAnalizer  = new AudioAnalizer();
        this.audioAnalizer.start(2048, () => {}, () => {});        

        /*
            [Group]             [Title]                                [Url jamendo]
            JT Bruce            Battle Trance                          https://www.jamendo.com/track/1237162/battle-trance 
            LevenRain           ActionMan Versus The CyberParasites    https://www.jamendo.com/track/1349290/actionman-versus-the-cyberparasites
            In Camera           Nothing's Over                         https://www.jamendo.com/track/1397271/nothing-s-over
            Fallen to Flux      One Chance                             https://www.jamendo.com/track/1155241/one-chance
            From Sky to Abyss   Quantum Ocean                          https://www.jamendo.com/track/1284951/quantum-ocean
            Convergence         Six Feet Under                         https://www.jamendo.com/track/80122/six-feet-under
        */
        

        

        this.scene          = new THREE.Scene();
        this.resources      = new Resources([
            {
                name : "jsonFont",
                type : "jsonFont",
                path : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/fonts/helvetiker_regular.typeface.json"
            }
        ]);
        this.camera         = new Camera();
        this.renderer       = new Renderer();
        this.world          = new World();
        this.debug          = new Debug();

        

        // Listen events
        this.sizes.on('resize', () => { this.resize(); })
        this.time.on ('tick'  , () => { this.update(); })

//        this.audioAnalizer.loadSong(this.song.path);
    }


    get loading() {
        let Ret = this.htmlElements.elementExperience.getAttribute("loading");
        return (Ret === "true" || Ret === true);
    }

    set loading(isLoading) {
        this.htmlElements.elementExperience.setAttribute("loading", isLoading);
    }

    /**
     * Function called on resize
    */
    resize() {
        this.camera.resize();
        this.renderer.resize();
    }

    /**
     * Function called when a frame is about to update
    */
    update() {
        this.camera.update();
        this.audioAnalizer.update();
        this.world.update();
        this.renderer.update();
    }
 



    /** 
     * This function destroy the whole scene
     */
    destroy() {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) => {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh) {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material) {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof(value.dispose) === 'function') {
                        value.dispose()
                    }
                }
            }
        })
        // orbit
        this.camera.controls.dispose();
        // renderer
        this.renderer.instance.dispose();
        
        if (this.debug.active) {
            this.debug.ui.destroy();
        }
    }
}    

let experience = new Experience();