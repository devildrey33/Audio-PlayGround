import Experience from '../Experience.js'
import Bars from './Bars.js';
import Circular from './Circular.js';
import Environment from './Environment.js'
import Floor from './Floor.js';
import FrequencyTexture from './FrequencyTexture.js';
import Osciloscope from './Osciloscope.js';
import YinYang from './YinYang.js';
//import OsciloscopeSoft from './OsciloscopeSoft.js';

export default class World {
    constructor() {
        this.experience = new Experience();
        this.scene      = this.experience.scene;
        this.resources  = this.experience.resources;
        // World ready
        this.ready      = false;

        // wait for resources
//        this.resources.on('ready', () => {
            // setup
            this.frequencyTexture = new FrequencyTexture();
            this.floor            = new Floor(this);
            this.bars             = new Bars(this);
            this.osciloscope      = new Osciloscope(this);
//            this.osciloscopeSoft  = new OsciloscopeSoft(this);
            this.circular         = new Circular(this);
            this.yinYang          = new YinYang(this);
            this.environment      = new Environment();
            this.ready            = true;
//        });
        
    }

    update() {
        if (this.ready === true) {
            this.frequencyTexture.update();
//            this.bars.update();
//            this.circular.update();
            this.yinYang.update();
            this.floor.update();
//            this.osciloscope.update();
//            this.osciloscopeSoft.update();
        }
    }
}