import Experience from '../Experience.js';
import EventEmitter from './EventEmitter.js'

/**
 * Class to control the canvas size
 */
export default class Sizes extends EventEmitter {
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
        console.log("resize")
        this.trigger('resize');
    }

    destroy() {
        window.removeEventListener('resize', this.hEventResize);
        this.hEventResize = null;
    }


}