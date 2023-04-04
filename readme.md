# Audio-Experience
 
First i want to see how hard i can push a mobile device, i need to replicate the screens of [EspectroAudible](https://github.com/devildrey33/EspectroAudible) in GLSL

Based on two textures : 32*32 for square operations and 1024*1 for lineal operations.
Red channel has the Frequency, and green channel the TimeDomain of the song.

- 32*32 planeto use Frequency array and move y-axis of the mesh in a shader (red channel)
- 256 Bars moved using a vertex shader 
- Fragment shader Oscyloscope (green channel)
- Fragment shader Circular Frequency (red channel)
- Fragment shader Circular TimeDomain (green channel)
- Fragment shader Circular Distortion (red channel)

You can drag & drop a song of your hard disk into the experience to play it.

live version : [Audio-Experience](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-Experience/)


https://user-images.githubusercontent.com/15678544/229850780-5f61a9ab-4900-44fc-a702-64910d9d2619.mp4

