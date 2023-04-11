import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import Experience from '../Experience.js'
import EventEmitter from './EventEmitter.js'


export default class Resources extends EventEmitter {
    constructor(sources) {
        super();

        this.experience = new Experience();

        // options
        this.sources = sources;
        // setup
        this.items  = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;

        this.setLoaders();
        this.startLoading();
    }

    setLoaders() {
        this.loaders = {
            gltfLoader          : new GLTFLoader(),
            textureLoader       : new THREE.TextureLoader(),
            cubeTextureLoader   : new THREE.CubeTextureLoader(),
            rgbeLoader          : new RGBELoader(),
            fontLoader          : new FontLoader()
        }
    }

    startLoading() {
        for (const source of this.sources) {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(source.path, (model) =>{
                    this.sourceLoaded(source, model);
                })
            }
            else if (source.type === 'texture') {
                this.loaders.textureLoader.load(source.path, (texture) =>{
                    this.sourceLoaded(source, texture);
                })
            }
            else if (source.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(source.path, (texture) =>{
                    this.sourceLoaded(source, texture);
                })
            }
            else if (source.type === "hdrTexture") {
                this.loaders.rgbeLoader.load(source.path, (texture) =>{
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    this.sourceLoaded(source, texture);
                })
            }
            else if (source.type === "jsonFont") { 
                this.loaders.fontLoader.load(source.path, (font) => {
                    console.log(font);
                    this.sourceLoaded(source, font);
                })
            }
        }

        // No items to load
        if (this.toLoad === 0) {
            // hide the loading 
            this.experience.loading = false;
            this.trigger('ready');
        }
    }


    sourceLoaded(source, file) {
        this.items[source.name] = file;
        this.loaded ++;

        if (this.loaded === this.toLoad) {
            // hide the loading 
            this.experience.loading = false;
            this.trigger('ready');
        }
    }
}