# Audio-PlayGround
 
First i want to see how hard i can push a mobile device, in my mobile works at 50fps +o-... but its 6 years old. My friends told me it runs at 60fps on their mobiles.

Based on two textures : 32*32 for square operations and 1024*1 for lineal operations.
Red channel has the Frequency, and green channel the TimeDomain of the song.

- 32*32 plane to use Frequency array and move y-axis of the mesh in a shader (red channel)
- 256 Bars moved using a vertex shader 
- Fragment shader Oscyloscope (green channel)
- Fragment shader Circular Frequency (red channel)
- Fragment shader Circular TimeDomain (green channel)
- Fragment shader Circular Distortion (red channel)
- Fragment shader Perlin sun (a mix of circular freuency + circular time domain + perlin noise)

Im having a loot of problems with shadows, so at the moment this example runs without shadows...

You can drag & drop a song of your hard disk into the experience to play it.

live version : [Audio-PlayGround](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/)



https://user-images.githubusercontent.com/15678544/231241903-63c07007-e20d-4e32-abef-6c86786b8484.mp4


You need run [code]npm install[/code] once to get all dependencies.

And then you can use [code]npm run dev[/code] to start the local test server.
