import Experience from "../Experience.js";
import BufferCanvas from "./BufferCanvas.js"
import * as THREE from "three"
import "./MathUtils.js"

export default class AudioAnalizer {
    constructor() {
        this.experience     = new Experience();

//        this.audioSourceDD  = { context : { currentTime : 0 } };
        this.context        = new AudioContext();
        this.songLoaded     = false;
        this.htmlElements   = this.experience.htmlElements;
//        this.songList       = [];
    
//        start();
    }

    start(fftSize = 2048/*, fnReady = () => {}, fnEnded = () => {}*/) {
        this.fftSize         = fftSize;
        this.square          = Math.sqrt(this.fftSize * 0.5);
        //this.bufferCanvas    = new BufferCanvas(this.square, this.square);
        //this.imageData       = this.bufferCanvas.context.createImageData(this.square, this.square);
        this.analizerData    = new Uint8Array(fftSize * 0.5);
        this.analizerDataSin = new Uint8Array(fftSize * 0.5);

        this.gainNode                         = this.context.createGain();
        this.analizer                         = this.context.createAnalyser();
        this.analizer.fftSize                 = fftSize;
        this.analizer.smoothingTimeConstant   = 0.8; // 

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
            this.experience.htmlElements.elementAudioPlay.innerHTML = "Play";
        }
         
        this.song                = new Audio();
        this.song.controls       = true;
        this.song.crossOrigin    = "anonymous";
        this.song.src            = path;          // "/Canciones/cancion.mp3"
        this.song.addEventListener('canplay', this.canPlay.bind(this));
        this.song.addEventListener('ended'  , () => { 
            this.experience.htmlElements.elementAudioPlay.innerHTML = "Play";
//            this.fnEnded.bind(this);
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

        this.song.addEventListener('canplay', this.canPlayDrop.bind(this));
        this.song.addEventListener('ended'  , () => { 
            this.experience.htmlElements.elementAudioPlay.innerHTML = "Play";
//            this.fnEnded.bind(this);
        });                
    }

    // Función que detecta si está en play o en pausa, y asigna el estado contrario
    playPause() {
        this.context.resume();
        // El autoplay en dispositivos moviles no funciona, por lo que hay que comprobar si está realmente en play o en pausa.
        if (this.song.duration > 0 && !this.song.paused) { 
            this.song.pause(); 
            this.experience.htmlElements.elementAudioPlay.innerHTML = "Play";
            return false;  
        } 
        else {
            this.song.play();   
            this.experience.htmlElements.elementAudioPlay.innerHTML = "Pause";
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
//            this.fnReady();            
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
                let rValue = Math.clamp(this.analizerData[pos], 0, 255);       // R
                let gValue = Math.clamp(this.analizerDataSin[pos], 0, 255);
                // position for a 4098 array
                pos = pos * 4;
                // fill the 32*32 image
                this.imageDataSquare.data[pos]     = rValue;
                this.imageDataSquare.data[pos + 1] = gValue;
                this.imageDataSquare.data[pos + 2] = 0;
                this.imageDataSquare.data[pos + 3] = 255;
                // fill the 1024*1 image
                this.imageDataLinear.data[pos]     = rValue;
                this.imageDataLinear.data[pos + 1] = gValue;
                this.imageDataLinear.data[pos + 2] = 0;
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