# Audio-PlayGround
 
First i want to see how hard i can push a mobile device, in my mobile works at 25fps +o-... but its 6 years old. My friends told me it runs at 60fps on hig end mobiles. Need to implement a shadows removal if framerate drops on 3 first seconds or something like that

Based on two textures : 32x32 for square operations and 1024x1 for lineal operations.
Red channel has the Frequency, and green channel the TimeDomain of the song.

- 32*32 plane to use Frequency array and move y-axis of the mesh in a shader (red channel)
- 256 Bars moved using a vertex shader 
- Fragment shader Oscyloscope (green channel)
- Fragment shader Circular Frequency (red channel)
- Fragment shader Circular TimeDomain (green channel)
- Fragment shader Circular Distortion (red channel)
- Fragment shader Perlin sun (a mix of circular freuency + circular time domain + perlin noise)
- Super Sayan Perlin sun (a combination of various effects)
- Shadows added for all the effects

You can drag & drop a song of your hard disk into the experience to play it.

live version : [Audio-PlayGround](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/)






https://user-images.githubusercontent.com/15678544/232332632-74db47bc-60d3-4aae-baf4-2bbc2e0ce9e6.mp4





You need run <code>npm install</code> once to get all dependencies.

And then you can use <code>npm run dev</code> to start the local test server.



Im creating a separate projects for each fragment shader effect, this is the first one the osciloscope :


https://user-images.githubusercontent.com/15678544/233856539-5433525a-dfa8-40b9-9434-1201412165c0.mp4


Live version : [Audio-Shader #1](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/1/)

