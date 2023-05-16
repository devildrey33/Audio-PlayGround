/* Experience created by Josep Antoni Bover for https://devildrey33.es.
 *  This Audio shader is a part of my Audio-PlayGround experience :
 *     https://github.com/devildrey33/Audio-PlayGround
 * 
 *  #3 sunset effect.
 *      - Play with Audio Strength, Line size, and radius to achieve different effects
 *      - This script creates an audio data texture with the getByteFrequencyData values 
 *        on the red channel. (Its more easy than creating extra attributes, and looks better)
 *      - Then this texture is sent to the sunset shader and the sunset depth shader.
 *      - You can drag & drop any song of your computer to play it.
 *      - Song name   : The Deep
 *        Song artist : Anitek
 *        URL         : https://www.jamendo.com/track/1884527/the-deep
 * 
 *  Created on        : 20/04/2023
 *  Last modification : 27/04/2023
 */


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'

// Clamp number between two values
Math.clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
} 

// Simple 2d buffer canvas
class BufferCanvas {
    constructor(width, height) {
        this.canvas  = document.createElement("canvas");
        this.canvas.setAttribute("width", width);
        this.canvas.setAttribute("height", height);
        this.context = this.canvas.getContext("2d", { willReadFrequently : true }); 
        this.width   = width;
        this.height  = height;
    }
}

export default class CodepenThreeAudio {
    // Default options
    options = {
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
        antialias               : true,
        // OrbitControls enabled by default
        orbitControls           : true,
        // Song path
        songPath                : "https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/songs/The_Deep_-_Anitek.mp3"
    };    
    

    constructor(options) {
        // Merge options
        this.options = { ...this.options, ...options };
        // Create basic html elements
        this.createHtml();
        // Setup sizes
        this.setupSizes();

        // Setup audio texture
        this.bufferCanvasLinear         = new BufferCanvas(1024, 1);
        this.bufferCanvasLinear.texture = new THREE.CanvasTexture(this.bufferCanvasLinear.canvas);
        this.imageDataLinear            = this.bufferCanvasLinear.context.createImageData(1024, 1);
        this.bufferCanvasLinear.texture.generateMipMaps = false;
        this.bufferCanvasLinear.texture.minFilter = THREE.NearestFilter;
        this.bufferCanvasLinear.texture.magFilter = THREE.NearestFilter;           
        // Setup buffers for audio data
        this.fftSize         = 2048;
        this.square          = Math.sqrt(this.fftSize * 0.5);
        this.analizerData    = new Uint8Array(this.fftSize * 0.5);
        this.analizerDataSin = new Uint8Array(this.fftSize * 0.5);
        // Fill the sin array with 128, because its the central point
        for (let i = 0; i < this.fftSize * 0.5; i++) {
            this.analizerDataSin[i] = 128;
        }

        // Setup a basic scene with camera
        this.setupBasicScene();
        
        // Time values
        this.timeStart        = Date.now();
        this.timeCurrent      = this.timeStart;
        this.timeElapsed      = 0;
        this.timeDelta        = 16;
        // Time from this second 
        this.timeActualFrame  = this.timeStart + 1000;
        // Number of frames during this second
        this.timeFrameCounter = 0;
        // actual framerate
        this.fps              = 0;        
        
        // Drag & drop events
        this.hEventDragEnter = this.eventDragEnter.bind(this);
        this.hEventDragOver  = this.eventDragOver.bind(this);
        this.hEventDrop      = this.eventDrop.bind(this);
        this.elementCanvas.addEventListener("dragenter", this.hEventDragEnter);
        this.elementCanvas.addEventListener("dragover" , this.hEventDragOver);
        this.elementCanvas.addEventListener("drop"     , this.hEventDrop);
        
        // song loaded
        this.songLoaded     = false;
        // default song true (not a drag & drop song)
        this.defaultSong    = true;

        // Setup a Three.js renderer
        this.setupRenderer();

        // Create the update loop
        window.requestAnimationFrame(() => { this.basicUpdate(); });
    }

    /* 
     * Create basic html elements (canvas, loading, framerate, fullscreen, github, and my web page button)
     */
    createHtml() {
        // Create an empty div element outside of the doom, to make it our root element
        const preElementExperience = document.createElement("div");
        // Id of this canvas (i need it for compatibility with my web page)
        this.id = 0;
        preElementExperience.id        = "Experience" + this.id; 
        preElementExperience.className = "Experience";
        // Add the Experience element to the options root element
        this.options.rootElement.appendChild(preElementExperience);
        this.elementExperience = document.getElementById(preElementExperience.id);
        // Setup the loading atribute
        this.elementExperience.setAttribute("loading", true);
        // String that has all the tags to be added
        let strHTML = ""
        // Add the canvas element
        strHTML += '<canvas id="Experience' + this.id + '_Canvas" class="Experience_Canvas"></canvas>';
        // Add the loading element
        strHTML += '<div class="Experience_Loading Experience_Panel"><span>Loading...</span></div>';
        // Add the main controls element
        strHTML += '<div class="Experience_Controls">';
        // Show FPS
        if (this.options.showFPS === true) {
            strHTML +=  "<div class='Experience_Panel Experience_Static' title='Frames Per Second'>" +
                            "<div class='Experience_FPS'>60</div>" +
                            "<div class='Experience_TxtFPS'>fps</div>" +
                        "</div>";
        }
        // Show full screen button
        if (this.options.buttonFullScreen === true) {
            strHTML +=  "<div id='fullScreen' class='Experience_Panel Experience_Control' title='Full screen mode'>" +
                            "<img src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-pantalla-completa' />" +
                        "</div>" +
                        "<div id='restoreScreen' class='Experience_Panel Experience_Control' title='Restore screen'>" +
                            "<img src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-restaurar-pantalla' />" +
                        "</div>";                
        }

        // Show github button
        if (this.options.buttonGitHub === true) {
            strHTML +=  "<a href='" + this.options.urlGitHub + "' target='_blank' class='Experience_Panel Experience_Control' title='GitHub project'>" +
                            "<img src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-github' />" +            
                        "</a>";
        }
        // Show devildrey33 logo button
        if (this.options.buttonLogo === true) {
            strHTML +=  "<a href='https://devildrey33.es' target='_blank' id='Logo' class='Experience_Panel Experience_Control'>" +
                            "<img src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-logo' />" +
                            "<div id='LogoText'>" +
                                "<span>D</span>" + "<span>E</span>" + "<span>V</span>" + "<span>I</span>" + "<span>L</span>" + "<span>D</span>" + "<span>R</span>" + "<span>E</span>" + "<span>Y</span>" + "<span>&nbsp;</span>" + "<span>3</span>" + "<span>3</span>" +
                            "</div>" +

                        "</a>";
        }
        // Closing .Experience_Controls
        strHTML += '</div>';        

        // Play button
        strHTML += '<div class="Experience_Play Experience_Panel Experience_Control" play="true">' +
                        "<img src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-play' />" +
                   '</div>';
        // Pause button
        strHTML += '<div class="Experience_Pause Experience_Panel Experience_Control" play="true">' +
                        "<img src='https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/icos.svg#svg-pause' />" +
                   '</div>';

        // Song info
        strHTML += `<div class="Experience_Panel Experience_SongInfo">
                        <table>
                            <tr>
                                <td>Name</td>
                                <td>:</td>
                                <td><a href="https://www.jamendo.com/track/1884527/the-deep" target="_blank">The Deep</a></td>
                            </tr>
                            <tr>
                                <td>Artist</td>
                                <td>:</td>
                                <td><a href="https://www.jamendo.com/artist/359034/anitek" target="_blank">Anitek</a></td>
                            </tr>
                        </table>
                    </div>`;        

        // Update our root with the new html code
        this.elementExperience.innerHTML = strHTML;

        // Get the play and pause button elements
        this.elementPlay = document.querySelector("#" + this.elementExperience.id + " > .Experience_Play");
        this.elementPause = document.querySelector("#" + this.elementExperience.id + " > .Experience_Pause");
        // Get the song information panel
        this.elementSongInfo = document.querySelector("#" + this.elementExperience.id + " > .Experience_SongInfo");
        // Get the canvas element
        this.elementCanvas = document.querySelector("#" + this.elementExperience.id + " > .Experience_Canvas")
        // Get the loading element
        this.elementLoading = document.querySelector("#" + this.elementExperience.id + " > .Experience_Loading")
        // Get the controls element
        this.elementControls = document.querySelector("#" + this.elementExperience.id + " > .Experience_Controls")
        // If fps are enabled
        if (this.options.showFPS === true) {
            // Get FPS html element from the doom
            this.elementFPS = document.querySelector("#" + this.elementExperience.id + " > .Experience_Controls > .Experience_Static > .Experience_FPS")
        }

        // Play pause button listen click
        this.elementPlay.addEventListener("click", (e) => {  this.playPause();  });
        this.elementPause.addEventListener("click", (e) => {  this.playPause();  });

        // If full screen button is enabled, need to catch his events
        if (this.options.buttonFullScreen === true) {
            // Get the full screen button
            this.elementFullScreen    = document.getElementById("fullScreen");
            // Get the restore screen button
            this.elementRestoreScreen = document.getElementById("restoreScreen");
            // Listen full screen click
            this.elementFullScreen.addEventListener("click", (e) => {
                document.body.requestFullscreen();
                this.elementFullScreen.style.display    = "none";
                this.elementRestoreScreen.style.display = "block";
            });
            // Listen restore screen click
            this.elementRestoreScreen.addEventListener("click", (e) => {
                document.exitFullscreen();
                this.elementFullScreen.style.display    = "block";
                this.elementRestoreScreen.style.display = "none";        
            });
        }        
    }

    // Get the loading status
    get loading() {
        let Ret = this.elementExperience.getAttribute("loading");
        return (Ret === "true" || Ret === true);        
    }

    // Set the loading status
    set loading(isLoading) {
        this.elementExperience.setAttribute("loading", isLoading);
    }

    /*
     * Get the current size and pixel ratio, and listen to the resize event
     */
    setupSizes() {
        // Get width and height
        this.width      = window.innerWidth;
        this.height     = window.innerHeight;
        // Get pixel ratio with a maxium of 2, higger values are discarted
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);

        // Listen to the resize event
        window.addEventListener('resize', () => { this.eventResize(); });
    }

    /*
     * Setup a Three.js basic scene with renderer, camera, orbitcontrols and one light
     */
    setupRenderer() {
        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas      : this.elementCanvas, 
            antialias   : this.options.antialias
        })
        this.renderer.useLegacyLights     = true;
        this.renderer.outputEncoding      = THREE.sRGBEncoding;
        this.renderer.toneMapping         = THREE.CineonToneMapping;
        this.renderer.toneMappingExposure = 1.75;
        this.renderer.shadowMap.enabled   = true;
        this.renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor('#211d20');
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelRatio);
    }

    /*
     * Creates a basic scene with a camera
     */
    setupBasicScene() {
        // Create the scene
        this.scene = new THREE.Scene();
        // Create the camera
        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 1000);
        this.camera.position.set(-2, 0, this.width > this.height ? 15 : 30);
        this.scene.add(this.camera);       
        
        if (this.options.orbitControls === true) {
            this.orbitControls = new OrbitControls(this.camera, this.elementCanvas);                
        }

        this.setupRoom();

        this.setupLight();
    }

    /* 
     * Setup the room (one plane in front...)
     */
    setupRoom() {
        this.roomGeometry = new THREE.PlaneGeometry(9,9);
        this.roomMaterial = new THREE.MeshStandardMaterial({ 
            color : "blue", 
            side  : THREE.DoubleSide,
            metalness : 0.25,
            roughness : 0.5,
            transparent : true,
            opacity: 0.75
        });
        this.roomMesh1 = new THREE.Mesh(this.roomGeometry, this.roomMaterial);
        this.roomMesh1.position.set(0, 0, -2);
        this.roomMesh1.receiveShadow = true;
        this.scene.add(this.roomMesh1);
    }

    /* 
     * Setup a spot light
     */
    setupLight() {
        this.spotLight = new THREE.SpotLight(0xfff0f0, 0.1, 20, Math.PI * 0.1, 0.25, 0.25);
        this.spotLight.position.set(1,1,10);
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.set(1024, 1024);
        this.spotLight.shadow.camera.near = 0.1; // default
        this.spotLight.shadow.camera.far = 1; // default
        this.spotLight.shadow.focus = 1; // default
        this.scene.add(this.spotLight, this.spotLight.target);
    }

    /* 
     * Virtual function called once to add custom things into the scene
     */
    setupScene() {
        this.loading = false;
    }

    /*
     * When the document is resized
     */
    eventResize() {
        // Get the width and height if they have auto size
        if (this.options.width  === "auto") { this.width  = window.innerWidth;  }
        if (this.options.height === "auto") { this.height = window.innerHeight; }
        // Get the pixel ratio limited to 2, whe dont need more than 2
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelRatio);

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }    

    /* 
     * Updates most basic things each frame
     */
    basicUpdate() {
        // Recalculate the time variables
        const currentTime = Date.now();
        this.timeDelta   = currentTime - this.timeCurrent;
        this.timeCurrent = currentTime;
        this.timeElapsed = this.timeCurrent - this.timeStart;
        // Recalculate Frames Per Second
        this.calculateFPS();

        if (this.songLoaded === true) {
            // get wave frequancy buffers
            this.analizer.getByteFrequencyData(this.analizerData);
            this.analizer.getByteTimeDomainData(this.analizerDataSin);        
            
            // get average frequency
            this.averageFrequency = this.getAverageFrequency();

            // Update light intensity adding averageFrequency of low sounds
            this.spotLight.intensity = 0.1 + (this.averageFrequency[2] / 255);

        }
        // paint audio texture ussing analizerData
        this.paintAudioTexture();
        
        // Vistual update from the parent class
        this.update(this.timeElapsed, this.timeDelta);

        // Render contents
        this.renderer.render(this.scene, this.camera);  
        
        // Call requestAnimationFrame for the next frame
        window.requestAnimationFrame(() => {
            this.basicUpdate();
        })
    }


    // Function to measure Frames Per Second
    calculateFPS() {
        // If the current time is superior from actualFrame
        if (this.timeCurrent > this.timeActualFrame) {
            // Setup the next frame is current time + 1000
            this.timeActualFrame = this.timeCurrent + 1000;
            
            // If FPS html element exist
            if (typeof(this.elementFPS) === "object") {
                // Write the new frames per second
                this.elementFPS.innerHTML = this.timeFrameCounter;
                // Set the parts per color
                const Part = 256 / 60; 
                // Put the color of the FPS text (Green 60fps, Red 0fps)        
                this.elementFPS.style.color = "rgb(" + Math.round(255 - (this.timeFrameCounter * Part)) + "," + Math.round(this.timeFrameCounter * Part) + ", 0)";
            }
            this.fps = this.timeFrameCounter;
            // Restart the counter of frames
            this.timeFrameCounter = 0;
        }
        // If the current time is inferior to actualFrame
        else {
            // Increment one frame for this actualFrame
            this.timeFrameCounter ++;
        }
    }    

    /* 
     * Virtual function called to update each frame
     */
    update(time, delta) {
    }

    audioUI(play) {
        this.elementPlay.setAttribute("play", play);
        this.elementPause.setAttribute("play", play);
        if (this.defaultSong === true && play === "true") 
            this.elementSongInfo.setAttribute("visible", play);
        else
            this.elementSongInfo.setAttribute("visible", false);
    }


    /* 
     * Setup the audio context (cannot be set at the start, needs user input like click)
     */
    setupAudio() {
        this.audioContext                     = new AudioContext();
        this.gainNode                         = this.audioContext.createGain();
        this.analizer                         = this.audioContext.createAnalyser();
        this.analizer.fftSize                 = this.fftSize;
        this.analizer.smoothingTimeConstant   = 0.8; // 
    }

    /*
     * Load a song specified by a path / url
     */
    loadSong(path) {
        this.loading = true;
        if (typeof this.song !== "undefined") {
            this.song.pause();
            this.songLoaded = false;
        }
         
        this.song                = new Audio();
        this.song.controls       = true;
        this.song.crossOrigin    = "anonymous";
        this.song.src            = path;          
        this.song.addEventListener('canplay', () => { this.canPlay() });
        this.song.addEventListener('ended'  , () => { 
            this.audioUI("true");
        });                
        
    }

    /*
     * Load a song droped into the navigator
     */
    loadSongDrop(files) {
        this.loading = true;
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
        // Not the default song
        this.defaultSong         = false;

        this.song.addEventListener('canplay', () => { this.canPlayDrop() });
        this.song.addEventListener('ended'  , () => { 
            this.audioUI("true");
        });                
    }    


    /* 
     * Function to play / pause the song. Retuns true on play, false on pause
     */
    playPause() {
        // If audioContext is not loaded
        if (typeof this.audioContext === "undefined") {
            this.setupAudio();
            this.loadSong(this.options.songPath);
        }
        
        this.audioContext.resume();
        
        if (this.song.duration > 0 && !this.song.paused) { 
            this.song.pause(); 
            this.audioUI("true");
            return false;  
        } 
        else {
            this.song.play();   
            this.audioUI("false");
            return true;   
        }        
    };    

    /*
     * Function called when the song is loaded and ready to play
     */
    canPlay() {
        if (this.songLoaded !== true) {
            if (typeof this.audioContext === "undefined") {
                this.setupAudio();
            }    
            this.loading     = false;
            this.songLoaded  = true;
            this.audioSource = this.audioContext.createMediaElementSource(this.song);
            this.audioSource.connect(this.analizer);
            this.analizer.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
        }
    }

    /*
     * Function called when is posible to play a drag & drop song
     */
    canPlayDrop() {
        this.canPlay();
        this.song.play();
        this.audioUI("false");
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

    /*
     * This function returns the average frequency in a array of 5 values :
     *  [0] High sounds
     *  [1] Medium sounds
     *  [2] Low sounds
     *  [3] Inaudible sounds
     *  [4] All sounds average
     */
    getAverageFrequency() {
        // high   from    0hz to   256hz
        // medium from  257hz to  2000hz
        // low    from 2001hz to 16000hz
        var hzBar      = this.audioContext.sampleRate / this.fftSize;
        var divisions  = [ 256, 2000, 16000, 50000 ];
        var total      = [ 0, 0, 0, 0, 0 ];
        var values     = [ 0, 0, 0, 0, 0 ];
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


    /* Updates internal audio data textures
     * For the floor whe need a 32x32 texture, and for the rest of the effects a 1024x1 texture
     * Red channel is the Frequency data, and the Green channel is the time domain data
     */
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
                // fill the 1024*1 image
                this.imageDataLinear.data[pos]     = rValue;
                this.imageDataLinear.data[pos + 1] = gValue;
                this.imageDataLinear.data[pos + 2] = 0;
                this.imageDataLinear.data[pos + 3] = 255;
            }
        }
        // Put the final data from imageDataLinear into bufferCanvasLinear texture
        this.bufferCanvasLinear.context.putImageData(this.imageDataLinear, 0, 0, 0, 0, 1024, 1);
        this.bufferCanvasLinear.texture.needsUpdate = true;
    }
}