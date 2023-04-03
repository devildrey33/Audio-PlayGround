import * as dat from 'lil-gui'
import Experience from '../Experience';
import * as THREE from 'three'

export default class Debug {
    constructor() {
        this.experience       = new Experience();
        this.environment      = this.experience.world.environment;
        this.osciloscope      = this.experience.world.osciloscope;
        this.floor            = this.experience.world.floor;
        this.frequencyTexture = this.experience.world.frequencyTexture;
        this.options          = this.experience.debugOptions;
        this.songs            = this.experience.songs;
        this.active = true;
        
//        this.active = window.location.hash === '#debug';

        if (this.active) {
            this.ui = new dat.GUI()

            /* 
             * Audio
             */
            this.debugAudio = this.ui.addFolder("Audio");
            this.playPauseButton = { playPause : () => { 
                this.experience.audioAnalizer.playPause();
            }}                    
            // Play Pause song
            this.debugAudio.add(this.playPauseButton, 'playPause').name("Play / Pause");

            this.debugAudio.add(this.options, 'songName', [ this.songs[0].name, this.songs[1].name, this.songs[2].name, this.songs[3].name, this.songs[4].name]).onChange(() => {
                for (let i = 0; i < this.songs.length; i++) {
                    if (this.options.songName === this.songs[i].name) {
                        this.experience.song = this.songs[i];
                        break;
                    }
                }
                
                this.experience.audioAnalizer.loadSong(this.experience.song.path);
                this.experience.audioAnalizer.playPause();
            });

            /*
             * Floor
             */
            this.debugFloor = this.ui.addFolder("Floor");
            // Audio strength
            this.debugFloor.add(this.options, "floorAudioStrength").min(1).max(20).step(0.1).name("Audio strength").onChange(() => {
                this.floor.material.uniforms.uAudioStrength.value = this.options.floorAudioStrength;
            });

            /*
             * Osciloscope
             */
            this.debugOsciloscope = this.ui.addFolder("Osciloscope down (shader)");
            // Osciloscope size
            this.debugOsciloscope.add(this.options, "osciloscopeSize").min(0.001).max(0.2).step(0.001).name("Line size").onChange(() => {
                this.osciloscope.material.uniforms.uSize.value = this.options.osciloscopeSize;
            });

            this.debugOsciloscope.add(this.options, "osciloscopeAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.osciloscope.material.uniforms.uAlpha.value = this.options.osciloscopeAlpha;
            });            

            this.debugOsciloscope.add(this.options, "osciloscopeAudioStrength").min(0).max(1).step(0.01).name("Audio strength").onChange(() => {
                this.osciloscope.material.uniforms.uAudioStrength.value = this.options.osciloscopeAudioStrength;
            });            

            this.debugOsciloscope.add(this.options, "osciloscopeAudioZoom").min(1).max(32).step(0.1).name("Audio zoom").onChange(() => {
                this.osciloscope.material.uniforms.uAudioZoom.value = this.options.osciloscopeAudioZoom;
            });            
            /*
             * Bars
             */
/*            this.debugBars = this.ui.addFolder("Bars max (x*z >= 1024)");
            this.debugBarsX = this.debugBars.add(this.options, "barsX").min(1).max(1023).step(8).name("X bars multiplier").onChange(() => {
                const nMax = this.exponent(this.options.barsX);
                this.debugBarsZ.max(nMax);
                console.log(nMax);
                this.experience.world.bars.createBars(this.options.barsX, this.options.barsZ);                
            });            
            this.debugBarsZ = this.debugBars.add(this.options, "barsZ").min(1).max(1023).step(8).name("X bars multiplier").onChange(() => {
                const nMax = this.exponent(this.options.barsZ);
                this.experience.world.bars.createBars(this.options.barsX, this.options.barsZ);
                console.log(nMax);
                this.debugBarsX.max(nMax);
            });            
            console.log(this.debugBarsX)*/
            
    
            // environment
           /* this.debugEnvironment = this.ui.addFolder("environment");
            this.debugEnvironment.add(this.environment.sunLight, 'intensity').min(0).max(10).step(0.001);
            this.debugEnvironment.add(this.environment.sunLight.position, 'x').name('sunLightX').min(-5).max(5).step(0.001);
            this.debugEnvironment.add(this.environment.sunLight.position, 'y').name('sunLightY').min(-5).max(5).step(0.001);
            this.debugEnvironment.add(this.environment.sunLight.position, 'z').name('sunLightZ').min(-5).max(5).step(0.001);
*/
        }
    }

    exponent(x) {
        return Math.floor(1024 / (2 ** (x - 1)));
    }
}