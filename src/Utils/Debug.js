import * as dat from 'lil-gui'
import Experience from '../Experience';

export default class Debug {
    constructor() {
        this.experience = new Experience();
        this.environment = this.experience.world.environment;

        this.active = true;
//        this.active = window.location.hash === '#debug';

        if (this.active) {
            this.ui = new dat.GUI()

            // Audio
            this.debugAudio = this.ui.addFolder("Audio");
            this.playPauseButton = { playPause : () => { 
                this.experience.audioAnalizer.playPause();
            }}        
            // Play Pause song
            this.debugAudio.add(this.playPauseButton, 'playPause').name("Play / Pause");

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