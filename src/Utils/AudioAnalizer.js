import Experience from "../Experience.js";
//import BufferCanvas from "./BufferCanvas.js"
import "./MathUtils.js"

export default class AudioAnalizer {
    constructor() {
        this.experience     = new Experience();

        this.audioSourceDD  = { context : { currentTime : 0 } };
        this.context        = new AudioContext();
        this.songLoaded     = false;
//        this.songList       = [];
    
//        start();
    }

    start(fftSize, fnReady = () => {}, fnEnded = () => {}) {
        this.fftSize         = fftSize;
        this.square          = Math.sqrt(this.fftSize * 0.5);
        //this.bufferCanvas    = new BufferCanvas(this.square, this.square);
        //this.imageData       = this.bufferCanvas.context.createImageData(this.square, this.square);
        this.analizerData    = new Uint8Array(fftSize * 0.5);
        this.analizerDataSin = new Uint8Array(fftSize * 0.5);

        this.analizer                         = this.context.createAnalyser();
        this.analizer.fftSize                 = fftSize;
        this.analizer.smoothingTimeConstant   = 0.8; // 
        this.fnEnded                          = fnEnded;
        this.fnReady                          = fnReady;

        this.hEventDragEnter = this.eventDragEnter.bind(this);
        this.hEventDragOver  = this.eventDragOver.bind(this);
        this.hEventDrop      = this.eventDrop.bind(this);
        this.experience.canvas.addEventListener("dragenter", this.hEventDragEnter);
        this.experience.canvas.addEventListener("dragover" , this.hEventDragOver);
        this.experience.canvas.addEventListener("drop"     , this.hEventDrop);
    }

    
    loadSong(path) {

        this.song                = new Audio();
        this.song.controls       = true;
        this.song.crossOrigin    = "anonymous";
        this.song.src            = path;          // "/Canciones/cancion.mp3"
        this.song.addEventListener('canplay', this.canPlay.bind(this));
        this.song.addEventListener('ended'  , this.fnEnded.bind(this));                
        this.experience.loading = true;
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

        this.song.addEventListener('canplay', this.canPlayDrop.bind(this));
        this.song.addEventListener('ended'  , this.fnEnded.bind(this));                
    }

    // Función que detecta si está en play o en pausa, y asigna el estado contrario
    playPause() {
        this.context.resume();
        // El autoplay en dispositivos moviles no funciona, por lo que hay que comprobar si está realmente en play o en pausa.
        if (this.song.duration > 0 && !this.song.paused) { this.song.pause();  return false;  } 
        else                                             { this.song.play();   return true;   }        
    };

    canPlay() {
        if (this.songLoaded !== true) {
            this.experience.loading = false;
            this.songLoaded         = true;
            this.audioSource        = this.context.createMediaElementSource(this.song);
            this.audioSource.connect(this.analizer);
            this.analizer.connect(this.context.destination);
            this.fnReady();
        }
    }

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
        // get wave frequancy buffers
        this.analizer.getByteFrequencyData(this.analizerData);
        this.analizer.getByteTimeDomainData(this.analizerDataSin);        
        
        // paint audio texture ussing analizerData
//        this.paintAudioTexture();

        // get average frequency
        this.averageFrequency = this.getAverageFrequency();
    }

    getAverageFrequency() {
        // greus  de 0hz a 256hz
        // mitjos de 257hz a 2000hz
        // aguts  de 2001hz a 16000hz
        var hzBar      = this.context.sampleRate / this.fftSize;
        var divisions  = [ 256, 2000, 16000, 50000 ];
        var total      = [ 0, 0, 0, 0, 0 ];// Graves, Medios, Agudos, Agudos inaudibles, Media de todo
        var values     = [ 0, 0, 0, 0, 0 ];// Graves, Medios, Agudos, Agudos inaudibles, Media de todo
        var pos        = 0;        
        var totalFreq = this.fftSize / 2;
        for (var i = 0; i < totalFreq; i++) {
            if (i * hzBar > divisions[pos]) {
                pos++;
            }
            total[pos] ++;
            values[pos] += this.analizerData[i];
            
            values[4] += this.analizerData[i];
        }
        
        return [ values[0] / total[0], 
                 values[1] / total[1],
                 values[2] / total[2],
                 values[3] / total[3],
                 values[4] / totalFreq ];
    }


    destroy() {
        this.experience.canvas.removeEventListener("dragenter", this.hEventDragEnter);
        this.experience.canvas.removeEventListener("dragover" , this.hEventDragOver);
        this.experience.canvas.removeEventListener("drop"     , this.hEventDrop);
    }

}