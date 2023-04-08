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
            group : "Вихлянцев Евгений", 
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
        buttonFullScreen        : false,            
        // Show my logo buton in the buttons frame (that redirects to devildrey33.es)
        buttonLogo              : false,            
        // Element where canvas is inserted (by default is document.body)
        // For example you can use document.getElementById() to retrieve tag inside you want to create the canvas
        rootElement             : document.body,
        // Anti alias (by default true)
        antialias               : true
    };


    /* debug options for lil.gui */
    debugOptions = {
        songName                  : "",
        osciloscopeLineSize       : 0.07,
        osciloscopeAlpha          : 0.0,
        osciloscopeAudioStrength  : 0.5,
        osciloscopeAudioZoom      : 1,
        osciloscopeVisible        : true,
        floorAudioStrength        : 8,
        floorVisible              : true,
        barsAudioStrength         : 2,
        barsCount                 : 256,
        barsVisible               : true,
        circularAudioStrength     : 0.4,
        circularLineSize          : 0.07,
        circularAlpha             : 0.0,
        circularRVisible          : true,
        circularGVisible          : true,
        circularDistorsionVisible : true,
        yinYangAlpha              : 0.0,
        yinYangRotate             : true,
        bloomThreshold            : 0.0,
        bloomStrength             : 0.5,
        bloomRadius               : 0.0,
        bloomEnabled              : true,
        frequencyTextureVisible   : true
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


        // Create the html tags and insert into body (canvas, buttons, fps, loading and error messages)
        this.htmlElements   = new HTMLElements();


        this.sizes          = new Sizes();
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
        this.song = this.songs[Math.floor(Math.random() * this.songs.length)];
        this.debugOptions.songName = this.song.name;

        this.audioAnalizer.loadSong(this.song.path);
        //this.audioAnalizer.loadSong("./songs/BattleTrance.mp3");
        //this.audioAnalizer.loadSong("./songs/LevenRain_-_ActionMan_Versus_The_CyberParasites.mp3");
        //this.audioAnalizer.loadSong("./songs/In_Camera_-_Nothing_s_Over.mp3");
        //this.audioAnalizer.loadSong("./songs/OneChance.mp3");
//        this.audioAnalizer.loadSong("./songs/QuantumOcean.mp3");
        //this.audioAnalizer.loadSong("./songs/Convergence_-_Six_feet_under.mp3");

//        window.addEventListener("click", () => { this.audioAnalizer.playPause(); })

        this.time           = new Time();
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
