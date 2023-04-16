import * as dat from 'lil-gui'
import Experience from '../Experience';
import * as THREE from 'three'

export default class Debug {
    constructor() {
        this.experience         = new Experience();
        this.environment        = this.experience.world.environment;
        this.osciloscope        = this.experience.world.osciloscope;
        this.floor              = this.experience.world.floor;
        this.frequencyTexture   = this.experience.world.frequencyTexture;
        this.bars               = this.experience.world.bars;
        this.circular           = this.experience.world.circular;
        this.circularSin        = this.experience.world.circularSin;
        this.circularDistorsion = this.experience.world.circularDistorsion;
        this.yinYang            = this.experience.world.yinYang;
        this.yinYangSin         = this.experience.world.yinYangSin;
        this.perlinSun          = this.experience.world.perlinSun;
        this.ssPerlinSun        = this.experience.world.ssPerlinSun;
        this.bloomPass          = this.experience.renderer.bloomPass;
        this.options            = this.experience.debugOptions;
        this.songs              = this.experience.songs;
//        this.active = true;
        
        this.active = window.location.hash === '#debug';

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
            // song name
            this.songNames = [];
            for (let s = 0; s < this.songs.length; s++) {
                this.songNames.push(this.songs[s].name);
            }

            this.debugAudio.add(this.options, 'songName', this.songNames).name("Song name").onChange(() => {
                for (let i = 0; i < this.songs.length; i++) {
                    if (this.options.songName === this.songs[i].name) {
                        this.experience.song = this.songs[i];
                        break;
                    }
                }
                
                this.experience.audioAnalizer.loadSong(this.experience.song.path);
                this.experience.audioAnalizer.playPause();
            });
            // Audio textures visible
/*            this.debugAudio.add(this.options, "frequencyTextureVisible").name("Audio textures visible").onChange(() => {
                this.frequencyTexture.visible(this.options.frequencyTextureVisible);
            });*/


            /*
             * Bars
             */
            this.debugBars = this.ui.addFolder("Bars").open(false);;
            // Visible
/*            this.debugBars.add(this.options, "barsVisible").name("Visible").onChange(() => {
                this.bars.visible(this.options.barsVisible);
            });*/
            // Count
            this.debugBars.add(this.options, "barsCount").min(32).max(512).step(1).name("Count").onChange(() => {
                this.experience.world.bars.createBars(this.options.barsCount, 1);                
            });        
            // Audio Strength    
            this.debugBars.add(this.options, "barsAudioStrength").min(0.5).max(10).step(0.1).name("Audio strength").onChange(() => {
                this.bars.material.uniforms.uAudioStrength.value = this.options.barsAudioStrength;
            });   

            /*
             * Floor
             */
            this.debugFloor = this.ui.addFolder("Floor").open(false);;
            // Color grid
            this.debugFloor.addColor(this.options, "floorColorGrid").name("Grid color").onChange(() => {
                this.perlinSun.material.uniforms.uColorGrid = new THREE.Color(this.options.floorColorGrid);
            });
            // Color background
            this.debugFloor.addColor(this.options, "floorColorBackground").name("Background color").onChange(() => {
                this.perlinSun.material.uniforms.uColorBackground = new THREE.Color(this.options.floorColorBackground);
            });

            // Audio strength
            this.debugFloor.add(this.options, "floorAudioStrength").min(1).max(20).step(0.1).name("Audio strength").onChange(() => {
                this.floor.material.uniforms.uAudioStrength.value = this.options.floorAudioStrength;
            });

            /*
             * Osciloscope
             */
            this.debugOsciloscope = this.ui.addFolder("Osciloscope").open(false);
            // Visible
/*            this.debugOsciloscope.add(this.options, "osciloscopeVisible").name("Visible").onChange(() => {
                this.osciloscope.visible(this.options.osciloscopeVisible);
            });*/
            // Osciloscope audio strength
            this.debugOsciloscope.add(this.options, "osciloscopeAudioStrength").min(0).max(1).step(0.01).name("Audio strength").onChange(() => {
                this.osciloscope.material.uniforms.uAudioStrength.value = this.options.osciloscopeAudioStrength;
            });            
            // Osciloscope audio zoom
            this.debugOsciloscope.add(this.options, "osciloscopeAudioZoom").min(1).max(32).step(0.1).name("Audio zoom").onChange(() => {
                this.osciloscope.material.uniforms.uAudioZoom.value = this.options.osciloscopeAudioZoom;
            });            
            // Osciloscope background alpha
            this.debugOsciloscope.add(this.options, "osciloscopeAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.osciloscope.material.uniforms.uAlpha.value = this.options.osciloscopeAlpha;
            });            
            // Osciloscope line size
            this.debugOsciloscope.add(this.options, "osciloscopeLineSize").min(0.001).max(0.2).step(0.001).name("Line size").onChange(() => {
                this.osciloscope.material.uniforms.uSize.value = this.options.osciloscopeLineSize;
            });

            /*
             * Osciloscope Cylinder
             */
            this.debugOsciloscopeCylinder = this.ui.addFolder("Osciloscope Cylinder").open(false);
            // Osciloscope audio strength
            this.debugOsciloscopeCylinder.add(this.options, "osciloscopeCylinderAudioStrength").min(0).max(1).step(0.01).name("Audio strength").onChange(() => {
                this.ssPerlinSun.osciloscopeCylinder1.material.uniforms.uAudioStrength.value = this.options.osciloscopeCylinderAudioStrength;
                this.ssPerlinSun.osciloscopeCylinder2.material.uniforms.uAudioStrength.value = this.options.osciloscopeCylinderAudioStrength;
                this.ssPerlinSun.osciloscopeCylinder3.material.uniforms.uAudioStrength.value = this.options.osciloscopeCylinderAudioStrength;
            });            
            // Osciloscope audio zoom
            this.debugOsciloscopeCylinder.add(this.options, "osciloscopeCylinderAudioZoom").min(1).max(32).step(0.1).name("Audio zoom").onChange(() => {
                this.ssPerlinSun.osciloscopeCylinder1.material.uniforms.uAudioZoom.value = this.options.osciloscopeCylinderAudioZoom;
                this.ssPerlinSun.osciloscopeCylinder2.material.uniforms.uAudioZoom.value = this.options.osciloscopeCylinderAudioZoom;
                this.ssPerlinSun.osciloscopeCylinder3.material.uniforms.uAudioZoom.value = this.options.osciloscopeCylinderAudioZoom;
            });            
            // Osciloscope line size
            this.debugOsciloscopeCylinder.add(this.options, "osciloscopeCylinderLineSize").min(0.001).max(0.2).step(0.001).name("Line size").onChange(() => {
                this.ssPerlinSun.osciloscopeCylinder1.material.uniforms.uSize.value = this.options.osciloscopeCylinderLineSize;
                this.ssPerlinSun.osciloscopeCylinder2.material.uniforms.uSize.value = this.options.osciloscopeCylinderLineSize;
                this.ssPerlinSun.osciloscopeCylinder3.material.uniforms.uSize.value = this.options.osciloscopeCylinderLineSize;
            });

         
            
            /*
             * Circular
             */
            this.debugCircular = this.ui.addFolder("Circular").open(false);;

            // Circle Bars Visible
/*            this.debugCircular.add(this.options, "circularRVisible").name("Circle bars visible").onChange(() => {
                this.circular.visibleR(this.options.circularRVisible);
            });
            // Circle Osci Visible
            this.debugCircular.add(this.options, "circularGVisible").name("Circle osciloscope visible").onChange(() => {
                this.circular.visibleG(this.options.circularGVisible);
            });
            // Circle deformed Visible
            this.debugCircular.add(this.options, "circularDistorsionVisible").name("Circle distorsion visible").onChange(() => {
                this.circular.visibleD(this.options.circularDistorsionVisible);
            });*/
            

            this.debugCircular.add(this.options, "circularAudioStrength").min(0.1).max(0.5).step(0.01).name("Audio strength").onChange(() => {
                this.circular.material.uniforms.uAudioStrength.value = this.options.circularAudioStrength;
                this.circularSin.material.uniforms.uAudioStrength.value = this.options.circularAudioStrength;
                this.circularDistorsion.material.uniforms.uAudioStrength.value = this.options.circularAudioStrength * 0.5;
            });            
            // Osciloscope background alpha
            this.debugCircular.add(this.options, "circularAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.circular.material.uniforms.uAlpha.value = this.options.circularAlpha;
                this.circularSin.material.uniforms.uAlpha.value = this.options.circularAlpha;
                this.circularDistorsion.material.uniforms.uAlpha.value = this.options.circularAlpha;
            });            

            this.debugCircular.add(this.options, "circularLineSize").min(0.001).max(0.1).step(0.001).name("Line Size").onChange(() => {
                this.circular.material.uniforms.uSize.value = this.options.circularLineSize;
                this.circularSin.material.uniforms.uSize.value = this.options.circularLineSize;
                this.circularDistorsion.material.uniforms.uSize.value = this.options.circularLineSize;
            });            

            /*
             * Yin Yang
             */
            this.debugYinYang = this.ui.addFolder("Yin Yang").open(false);
            // Yinyang background alpha
            this.debugYinYang.add(this.options, "yinYangAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.yinYang.material.uniforms.uAlpha.value = this.options.yinYangAlpha;
                this.yinYangSin.material.uniforms.uAlpha.value = this.options.yinYangAlpha;
            });            

            // Yinyang rotation enabled
            this.debugYinYang.add(this.options, "yinYangRotate").name("Rotate").onChange(() => {
                this.yinYang.material.uniforms.uRotate.value = this.options.yinYangRotate;
                this.yinYangSin.material.uniforms.uRotate.value = this.options.yinYangRotate;
            });
    
            /*
             * Perlin sun
             */
            this.debugPerlinSun = this.ui.addFolder("Perlin sun").open(false);
            // PerlinSun background alpha
            this.debugPerlinSun.add(this.options, "perlinSunAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.perlinSun.material.uniforms.uAlpha.value = this.options.perlinSunAlpha;
                this.perlinSun.material.uniforms.uAlpha.value = this.options.perlinSunAlpha;
            });            
            this.debugPerlinSun.addColor(this.options, "perlinSunColorFrequency").name("Color freq.").onChange(() => {
                this.perlinSun.material.uniforms.perlinSunColorFrequency = new THREE.Color(this.options.perlinSunColorFrequency);
            });

            this.debugPerlinSun.addColor(this.options, "perlinSunColorSin").name("Color sin").onChange(() => {
                this.perlinSun.material.uniforms.perlinSunColorFrequency = new THREE.Color(this.options.perlinSunColorSin);
            });


            /*
            * Bloom
            */
            this.debugBloom = this.ui.addFolder("Bloom (postprocessing)").open(false);
            // Enable / disable bloom
            this.debugBloom.add(this.options, "bloomEnabled").onChange(() => {
                this.bloomPass.enabled = this.options.bloomEnabled;
            });
            // Bloom Threshold
            this.debugBloom.add(this.options, "bloomThreshold").min(-20).max(20).step(0.01).name("Threshold").onChange(() => {
                this.bloomPass.threshold = this.options.bloomThreshold;
            });
            // Bloom Radius
            this.debugBloom.add(this.options, "bloomRadius").min(-20).max(20).step(0.01).name("Radius").onChange(() => {
                this.bloomPass.radius = this.options.bloomRadius;
            });
            // Bloom Strength
            this.debugBloom.add(this.options, "bloomStrength").min(0).max(1).step(0.01).name("Strength").onChange(() => {
                this.bloomPass.strength = this.options.bloomStrength;
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

    exponent(x) {
        return Math.floor(1024 / (2 ** (x - 1)));
    }
}