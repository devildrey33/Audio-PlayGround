import * as dat from 'lil-gui'
import Experience from '../Experience';
import * as THREE from 'three'

export default class Debug {
    constructor() {
        this.experience         = new Experience();
        this.resources          = this.experience.resources;
        this.world              = this.experience.world;
//        this.environment        = this.experience.world.environment;
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
        this.sphere             = this.experience.world.sphere;
        this.sphereSin          = this.experience.world.sphereSin;
        this.spiral             = this.experience.world.spiral;
        this.bloomPass          = this.experience.renderer.bloomPass;
        this.displacementPass   = this.experience.renderer.displacementPass;
        this.options            = this.experience.debugOptions;
        this.songs              = this.experience.songs;
//        this.active = true;
        
        this.active = window.location.hash === '#debug';

        if (this.active) {
            this.ui = new dat.GUI();

            /*
             * Lights
             */
            this.debugLights = this.ui.addFolder("Lights").open(false);

            this.debugDirectional = this.debugLights.addFolder("Directional").open(false);            
            // Visible
            this.debugDirectional.add(this.options, "sunLightVisible").name("Visible").onChange(() => {
                this.world.environment.sunLight.visible = this.options.sunLightVisible;
                this.world.environment.sunLightHelper.visible = this.options.sunLightVisible;
            });
            // Color
            this.debugDirectional.addColor(this.options, "sunLightColor").name("Color").onChange(() => {
                this.world.environment.sunLight.color = this.options.sunLightColor;
            });        
            // Intensity
            this.debugDirectional.add(this.options, "sunLightIntensity").min(0.1).max(10).step(0.1).name("Intensity").onChange(() => {
                this.world.environment.sunLight.intensity = this.options.sunLightIntensity;
            });        
            // Position X
            this.debugDirectional.add(this.options, "sunLightPosX").min(-100).max(100).step(0.1).name("Position X").onChange(() => {
                this.world.environment.sunLight.position.set(this.options.sunLightPosX, this.options.sunLightPosY, this.options.sunLightPosZ);
            });        
            // Position Y
            this.debugDirectional.add(this.options, "sunLightPosY").min(-100).max(100).step(0.1).name("Position Y").onChange(() => {
                this.world.environment.sunLight.position.set(this.options.sunLightPosX, this.options.sunLightPosY, this.options.sunLightPosZ);
            });        
            // Position Z
            this.debugDirectional.add(this.options, "sunLightPosZ").min(-100).max(100).step(0.1).name("Position Z").onChange(() => {
                this.world.environment.sunLight.position.set(this.options.sunLightPosX, this.options.sunLightPosY, this.options.sunLightPosZ);
            });        

            this.debugSpot = this.debugLights.addFolder("Spot").open(false);
            // Visible
            this.debugSpot.add(this.options, "spotLightVisible").name("Visible").onChange(() => {
                this.world.environment.spotLight.visible = this.options.spotLightVisible;
                this.world.environment.splhelper.visible = this.options.spotLightVisible;
            });
            // Color
            this.debugSpot.addColor(this.options, "spotLightColor").name("Color").onChange(() => {
                this.world.environment.spotLight.color = this.options.spotLightColor;
            });        
            // Intensity
            this.debugSpot.add(this.options, "spotLightIntensity").min(0.1).max(10).step(0.1).name("Intensity").onChange(() => {
                this.world.environment.spotLight.intensity = this.options.spotLightIntensity;
            });        
            // Position X
            this.debugSpot.add(this.options, "spotLightPosX").min(-100).max(100).step(0.1).name("Position X").onChange(() => {
                this.world.environment.spotLight.position.set(this.options.spotLightPosX, this.options.spotLightPosY, this.options.spotLightPosZ);
            });        
            // Position Y
            this.debugSpot.add(this.options, "spotLightPosY").min(-100).max(100).step(0.1).name("Position Y").onChange(() => {
                this.world.environment.spotLight.position.set(this.options.spotLightPosX, this.options.spotLightPosY, this.options.spotLightPosZ);
            });        
            // Position Z
            this.debugSpot.add(this.options, "spotLightPosZ").min(-100).max(100).step(0.1).name("Position Z").onChange(() => {
                this.world.environment.spotLight.position.set(this.options.spotLightPosX, this.options.spotLightPosY, this.options.spotLightPosZ);
            });        

            // Shadows
            this.debugLights.add(this.options, "shadows").name("Shadows").onChange(() => {
                this.experience.world.shadows(this.options.shadows);
            });

            /* 
             * Audio
             */
/*            this.debugAudio = this.ui.addFolder("Audio").open(false);
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
            });*/


            /*
             * Bars
             */
            this.debugBars = this.ui.addFolder("Bars").open(false);;
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
                this.floor.material.uniforms.uColorGrid.value = new THREE.Color(this.options.floorColorGrid);
            });
            // Color background
            this.debugFloor.addColor(this.floor.material, "color").name("Background color").onChange(() => {
//                this.floor.material.uniforms.uColorBackground.value = new THREE.Color(this.options.floorColorBackground);
//                this.floor.material.color = new THREE.Color(this.options.floorColorBackground);
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
             * Circular
             */
            this.debugCircular = this.ui.addFolder("Circular").open(false);          

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
            /*this.debugPerlinSun = this.ui.addFolder("Perlin sun").open(false);
            // PerlinSun background alpha
            this.debugPerlinSun.add(this.options, "perlinSunAlpha").min(0).max(1).step(0.01).name("Background apha").onChange(() => {
                this.perlinSun.material.uniforms.uAlpha.value = this.options.perlinSunAlpha;
                this.perlinSun.material.uniforms.uAlpha.value = this.options.perlinSunAlpha;
            });            
            this.debugPerlinSun.addColor(this.options, "perlinSunColorFrequency").name("Color freq.").onChange(() => {
                this.perlinSun.material.uniforms.perlinSunColorFrequency.value = new THREE.Color(this.options.perlinSunColorFrequency);
            });

            this.debugPerlinSun.addColor(this.options, "perlinSunColorSin").name("Color sin").onChange(() => {
                this.perlinSun.material.uniforms.uColorSin.value = new THREE.Color(this.options.perlinSunColorSin);
            });*/


            /*
             * SSPerlin sun
             */
            this.debugSSPerlinSun           = this.ui.addFolder("SSPerlin sun").open(false);
            this.debugOsciloscopeCylinder   = this.debugSSPerlinSun.addFolder("Osciloscope Cylinder").open(false);
            this.debugBarsCylinder          = this.debugSSPerlinSun.addFolder("Bars Cylinder").open(false);
            // Color Frequency
            this.debugSSPerlinSun.addColor(this.options, "ssPerlinSunColorFrequency").name("Color freq.").onChange(() => {
                this.ssPerlinSun.material.uniforms.uColorFrequency.value = new THREE.Color(this.options.ssPerlinSunColorFrequency);
            });
            // Color Sin
            this.debugSSPerlinSun.addColor(this.options, "ssPerlinSunColorSin").name("Color sin").onChange(() => {
                this.ssPerlinSun.material.uniforms.uColorSin.value = new THREE.Color(this.options.ssPerlinSunColorSin);
            });
            // Perlin noise strength
            this.debugSSPerlinSun.add(this.options, "ssPerlinSunNoiseStrength").min(.1).max(50).step(0.01).name("Noise strength").onChange(() => {
                this.ssPerlinSun.material.uniforms.uNoiseStrength.value = this.options.ssPerlinSunNoiseStrength;
                this.ssPerlinSun.mesh.customDepthMaterial.uniforms.uNoiseStrength.value = this.options.ssPerlinSunNoiseStrength;
            });
            // Perlin noise speed
            this.debugSSPerlinSun.add(this.options, "ssPerlinSunNoiseSpeed").min(.1).max(50).step(0.01).name("Noise speed").onChange(() => {
                this.ssPerlinSun.material.uniforms.uNoiseSpeed.value = this.options.ssPerlinSunNoiseSpeed;
                this.ssPerlinSun.mesh.customDepthMaterial.uniforms.uNoiseSpeed.value = this.options.ssPerlinSunNoiseSpeed;
            });
            /*
             * Osciloscope Cylinder
             */
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
            
            /*
             * Bars Cylinder
             */
            // Color 1
/*            this.debugBarsCylinder.addColor(this.options, "barsCylinderColor1").name("Color one").onChange(() => {
                this.ssPerlinSun.barsCylinder.material.uniforms.uColor.value = new THREE.Color(this.options.barsCylinderColor1);
            });
            // Color 2
            this.debugBarsCylinder.addColor(this.options, "barsCylinderColor2").name("Color two").onChange(() => {
                this.ssPerlinSun.barsCylinder.material.uniforms.uColor2.value = new THREE.Color(this.options.barsCylinderColor2);
            });
            // Audio strength            
            this.debugBarsCylinder.add(this.options, "barsCylinderAudioStrength").min(0.1).max(2).step(0.1).name("Audio strength").onChange(() => {
                this.ssPerlinSun.barsCylinder.material.uniforms.uAudioStrength.value = this.options.barsCylinderAudioStrength;
            });            
            // Rotation strength            
            this.debugBarsCylinder.add(this.options, "barsCylinderRotation").min(0).max(32).step(0.1).name("Rotation strength");
            */

            /*
             * Sphere
             */
            this.debugSphere = this.ui.addFolder("Sphere").open(false);
            // sphere audio strength
            this.debugSphere.add(this.options, "sphereAudioStrength").min(0).max(6).step(0.01).name("Audio strength").onChange(() => {
                this.sphere.material.uniforms.uAudioStrength.value = this.options.sphereAudioStrength;
            });            
            // sphere audio zoom
            this.debugSphere.add(this.options, "sphereAudioZoom").min(1).max(8).step(0.01).name("Audio zoom").onChange(() => {
                this.sphere.material.uniforms.uAudioZoom.value = this.options.sphereAudioZoom;
            });            
            // sphere audio zoom
            this.debugSphere.add(this.sphere.material, "wireframe").name("wireframe");

            /*
             * SphereSin
             */
            if (typeof this.sphereSin !== "undefined") {
                this.debugSphereSin = this.ui.addFolder("Sphere Sin").open(false);
                // sphere sin audio strength
                this.debugSphereSin.add(this.options, "sphereSinAudioStrength").min(0).max(10).step(0.01).name("Audio strength").onChange(() => {
                    this.sphereSin.material.uniforms.uAudioStrength.value = this.options.sphereSinAudioStrength;
                });            
                // sphere sin audio zoom
                this.debugSphereSin.add(this.options, "sphereSinAudioZoom").min(1).max(8).step(0.01).name("Audio zoom").onChange(() => {
                    this.sphereSin.material.uniforms.uAudioZoom.value = this.options.sphereSinAudioZoom;
                });            
                // sphere sin audio zoom
                this.debugSphereSin.add(this.sphereSin.material, "wireframe").name("wireframe");
            }


            /*
             * Spiral
             */
            this.debugSpiral = this.ui.addFolder("Spiral").open(false);
            // Spiral audio strength
            this.debugSpiral.add(this.options, "spiralAudioStrength").min(0).max(10).step(0.01).name("Audio strength").onChange(() => {
                this.spiral.material.uniforms.uAudioStrength.value = this.options.spiralAudioStrength;
                this.spiral.mesh.customDepthMaterial.uniforms.uAudioStrength.value = this.options.spiralAudioStrength;
            });            
            // Spiral audio zoom
            this.debugSpiral.add(this.options, "spiralAudioZoom").min(1).max(8).step(0.01).name("Audio zoom").onChange(() => {
                this.spiral.material.uniforms.uAudioZoom.value = this.options.spiralAudioZoom;
                this.spiral.mesh.customDepthMaterial.uniforms.uAudioZoom.value = this.options.spiralAudioZoom;
            });            
            // Spiral frequency
            this.debugSpiral.add(this.options, "spiralFrequency").min(0.025).max(1).step(0.1).name("Frequency").onChange(() => {
                this.spiral.material.uniforms.uFrequency.value = this.options.spiralFrequency;
                this.spiral.mesh.customDepthMaterial.uniforms.uFrequency.value = this.options.spiralFrequency;
            });            
            // Spiral speed
            this.debugSpiral.add(this.options, "spiralSpeed").min(0.01).max(4).step(0.01).name("Speed").onChange(() => {
                this.spiral.material.uniforms.uSpeed.value = this.options.spiralSpeed;
                this.spiral.mesh.customDepthMaterial.uniforms.uSpeed.value = this.options.spiralSpeed;
            });            
            // Spiral thickness
            this.debugSpiral.add(this.options, "spiralThickness").min(0.01).max(0.75).step(0.01).name("Thickness").onChange(() => {
                this.spiral.material.uniforms.uThickness.value = this.options.spiralThickness;
                this.spiral.mesh.customDepthMaterial.uniforms.uThickness.value = this.options.spiralThickness;
            });            
            // Spiral audio strength sin
            this.debugSpiral.add(this.options, "spiralAudioStrengthSin").min(0).max(10).step(0.01).name("Audio strength Sin").onChange(() => {
                this.spiral.material.uniforms.uAudioStrengthSin.value = this.options.spiralAudioStrengthSin;
                this.spiral.mesh.customDepthMaterial.uniforms.uAudioStrengthSin.value = this.options.spiralAudioStrengthSin;
            });            
            // Spiral audio zoom sin
            this.debugSpiral.add(this.options, "spiralAudioZoomSin").min(1).max(8).step(0.01).name("Audio zoom Sin").onChange(() => {
                this.spiral.material.uniforms.uAudioZoomSin.value = this.options.spiralAudioZoomSin;
                this.spiral.mesh.customDepthMaterial.uniforms.uAudioZoomSin.value = this.options.spiralAudioZoomSin;
            });            
            // Spiral frequency sin
            this.debugSpiral.add(this.options, "spiralFrequencySin").min(0.025).max(1).step(0.1).name("Frequency Sin").onChange(() => {
                this.spiral.material.uniforms.uFrequencySin.value = this.options.spiralFrequencySin;
                this.spiral.mesh.customDepthMaterial.uniforms.uFrequencySin.value = this.options.spiralFrequencySin;
            });            
            // Spiral speed sin
            this.debugSpiral.add(this.options, "spiralSpeedSin").min(0.01).max(4).step(0.01).name("Speed Sin").onChange(() => {
                this.spiral.material.uniforms.uSpeedSin.value = this.options.spiralSpeedSin;
                this.spiral.mesh.customDepthMaterial.uniforms.uSpeedSin.value = this.options.spiralSpeedSin;
            });            
            // Spiral thickness sin
            this.debugSpiral.add(this.options, "spiralThicknessSin").min(0.01).max(0.75).step(0.01).name("Thickness Sin").onChange(() => {
                this.spiral.material.uniforms.uThicknessSin.value = this.options.spiralThicknessSin;
                this.spiral.mesh.customDepthMaterial.uniforms.uThicknessSin.value = this.options.spiralThicknessSin;
            });            

            /*
             * Bloom PostProcessing
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
            

            /*
            * Displacement PostProcessing
            */
            this.debugDisplacement = this.ui.addFolder("Displacement (postprocessing)").open(false);
            // Enable / disable bloom
            this.debugDisplacement.add(this.options, "displacementEnabled").onChange(() => {
                this.displacementPass.enabled = this.options.displacementEnabled;
            });
            // Displacement Amplitude X
            this.debugDisplacement.add(this.options, "displacementAmplitudeX").min(0.001).max(0.5).step(0.01).name("Amplitude X").onChange(() => {
                this.displacementPass.uniforms.uAmplitude.value = new THREE.Vector2(
                    this.options.displacementAmplitudeX,
                    this.options.displacementAmplitudeY
                );
            });
            // Displacement Amplitude Y
            this.debugDisplacement.add(this.options, "displacementAmplitudeY").min(0.001).max(0.5).step(0.01).name("Amplitude Y").onChange(() => {
                this.displacementPass.uniforms.uAmplitude.value = new THREE.Vector2(
                    this.options.displacementAmplitudeX,
                    this.options.displacementAmplitudeY
                );
            });
            // Displacement Frequency X
            this.debugDisplacement.add(this.options, "displacementFrequencyX").min(0.01).max(100).step(0.1).name("Frequency X").onChange(() => {
                this.displacementPass.uniforms.uFrequency.value = new THREE.Vector2(
                    this.options.displacementFrequencyX,
                    this.options.displacementFrequencyY
                );
            });
            // Displacement Frequency Y
            this.debugDisplacement.add(this.options, "displacementFrequencyY").min(0.01).max(100).step(0.1).name("Frequency Y").onChange(() => {
                this.displacementPass.uniforms.uFrequency.value = new THREE.Vector2(
                    this.options.displacementFrequencyX,
                    this.options.displacementFrequencyY
                );
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