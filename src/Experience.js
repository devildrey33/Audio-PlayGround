import * as THREE from 'three'
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js"
import Renderer from "./Renderer.js"
import World from './World/World.js'
import Resources from './Utils/Resources.js';
import sources from './sources.js'
import Debug from "./Utils/Debug.js"
import HTMLElements from './Utils/HTMLElements.js';
import AudioAnalizer from './Utils/AudioAnalizer.js';

let experienceInstance = null;

export default class Experience {
    // Songs from jamendo with name group and url
    songs = [
        
        {
            name  : "Cyberpunk Metal",
            group : "Vikhlyantsev Evgeny", // Вихлянцев_Евгений
            path  : "./songs/Вихлянцев_Евгений_-_Cyberpunk_Metal(Game,Videos).mp3", 
            url   : "https://www.jamendo.com/track/1892989/cyberpunk-metal-game-videos"             
        },
        {
            name  : "Kill City Kills",
            group : "Ride into the Badlands", 
            path  : "./songs/Kill_City_Kills_-_Ride_into_the_Badlands_-_Kill_City_Kills.mp3", 
            url   : "https://www.jamendo.com/track/1901190/kill-city-kills-ride-into-the-badlands"             
        },
        {
            name  : "Battle Trance",
            group : "JT Bruce", 
            path  : "./songs/BattleTrance.mp3", 
            url   : "https://www.jamendo.com/track/1237162/battle-trance" 
        }, {
            name  : "Nothing's Over",
            group : "In Camera", 
            path  : "./songs/In_Camera_-_Nothing_s_Over.mp3", 
            url   : "https://www.jamendo.com/track/1397271/nothing-s-over" 
        }, {
            name  : "One Chance",
            group : "Fallen to Flux", 
            path  : "./songs/OneChance.mp3", 
            url   : "https://www.jamendo.com/track/1155241/one-chance" 
        }, {
            name  : "Quantum Ocean",
            group : "From Sky to Abyss", 
            path  : "./songs/QuantumOcean.mp3", 
            url   : "https://www.jamendo.com/track/1284951/quantum-ocean" 
        }, {
            name  : "Six Feet Under",
            group : "Convergence", 
            path  : "./songs/Convergence_-_Six_feet_under.mp3", 
            url   : "https://www.jamendo.com/track/80122/six-feet-under" 
        }, {
            name  : "The Deep",
            group : "Anitek", 
            path  : "./songs/The_Deep_-_Anitek.mp3", 
            url   : "https://www.jamendo.com/track/1884527/the-deep" 
        }, {
            name  : "Alone",
            group : "Color out", 
            path  : "./songs/Alone_-_Color_Out.mp3", 
            url   : "https://www.jamendo.com/track/1886257/alone" 
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

        osciloscopeLineSize              : 0.02,
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
        spiralAudioZoom                  : 1.4,
        spiralAudioStrengthSin           : 1.0,
        spiralAudioZoomSin               : 1.0,
//        spiralRotateSpeed                : 0.5,
        spiralSpeed                      : 0.7,
        spiralFrequency                  : 0.2, // 0.1 are 10 lines, 0.01 are 100 lines
        spiralThickness                  : 0.1, 
        spiralSpeedSin                   : 1.5,
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
        displacementFrequencyY           : 3.3,
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
        

        this.audioAnalizer.loadSong(this.song.path);
        //this.audioAnalizer.loadSong("./songs/BattleTrance.mp3");
        //this.audioAnalizer.loadSong("./songs/LevenRain_-_ActionMan_Versus_The_CyberParasites.mp3");
        //this.audioAnalizer.loadSong("./songs/In_Camera_-_Nothing_s_Over.mp3");
        //this.audioAnalizer.loadSong("./songs/OneChance.mp3");
//        this.audioAnalizer.loadSong("./songs/QuantumOcean.mp3");
        //this.audioAnalizer.loadSong("./songs/Convergence_-_Six_feet_under.mp3");

//        window.addEventListener("click", () => { this.audioAnalizer.playPause(); })

        this.scene          = new THREE.Scene();
        this.resources      = new Resources(sources);
        this.camera         = new Camera();
        this.renderer       = new Renderer();
        this.world          = new World();
        this.debug          = new Debug();

        

        // Listen events
        this.sizes.on('resize', () => { this.resize(); })
        this.time.on ('tick'  , () => { this.update(); })

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
