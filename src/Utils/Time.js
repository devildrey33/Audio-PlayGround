import Experience from '../Experience.js';
import EventEmitter from './EventEmitter.js'

export default class Time extends EventEmitter {
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

        window.requestAnimationFrame(() => {
            this.tick();
        })
    }

    // Function to measure Frames Per Second
    getFPS() {
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
        this.getFPS();
        // Send tick event 
        this.trigger('tick');
        // Call requestAnimationFrame for the next frame
        window.requestAnimationFrame(() => {
            this.tick();
        })
    }
}