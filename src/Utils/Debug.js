import * as dat from 'lil-gui'
import Experience from '../Experience';
import * as THREE from 'three'

export default class Debug {
    constructor() {
        this.experience       = new Experience();
        this.environment      = this.experience.world.environment;
        this.osciloscope      = this.experience.world.osciloscope;
        this.frequencyTexture = this.experience.world.frequencyTexture;

        this.active = true;
        
        this.options = {
            osciloscopeSize  : 0.005,
            osciloscopeAlpha : 1.0,
            redChannel       : false      
        };
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

            /*
             * Osciloscope
             */
            this.debugOsciloscope = this.ui.addFolder("Osciloscope");
            // Osciloscope size
            this.debugOsciloscope.add(this.options, "osciloscopeSize").min(0.001).max(0.2).step(0.001).onChange(() => {
                this.osciloscope.material.uniforms.uSize.value = this.options.osciloscopeSize;
            });

            this.debugOsciloscope.add(this.options, "osciloscopeAlpha").min(0).max(1).step(0.01).onChange(() => {
                this.osciloscope.material.uniforms.uAlpha.value = this.options.osciloscopeAlpha;
            });            
    
            // environment
           /* this.debugEnvironment = this.ui.addFolder("environment");
            this.debugEnvironment.add(this.environment.sunLight, 'intensity').min(0).max(10).step(0.001);
            this.debugEnvironment.add(this.environment.sunLight.position, 'x').name('sunLightX').min(-5).max(5).step(0.001);
            this.debugEnvironment.add(this.environment.sunLight.position, 'y').name('sunLightY').min(-5).max(5).step(0.001);
            this.debugEnvironment.add(this.environment.sunLight.position, 'z').name('sunLightZ').min(-5).max(5).step(0.001);
*/
        }
    }
}