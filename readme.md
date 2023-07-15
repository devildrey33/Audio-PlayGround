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







https://github.com/devildrey33/Audio-PlayGround/assets/15678544/692b213f-ec32-4305-ab86-0eab711a14fe






You need run <code>npm install</code> once to get all dependencies.

And then you can use <code>npm run dev</code> to start the local test server.



Im creating a separate project for each shader effect.
You can find them in : [Codepen AudioShaders](https://github.com/devildrey33/Audio-PlayGround/tree/main/Codepen)




Audio-Shaders live versions : 

https://user-images.githubusercontent.com/15678544/233856539-5433525a-dfa8-40b9-9434-1201412165c0.mp4

Live version : [Audio-Shader #1 Osciloscope](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/1/)



https://user-images.githubusercontent.com/15678544/234913322-4a4b95bb-9ec4-4a3d-ad07-228a605267f8.mp4



Live version : [Audio-Shader #2 Circular osciloscope](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/2/)


https://user-images.githubusercontent.com/15678544/234913365-def0e49b-ea9a-47f9-833d-519d8d48f549.mp4



Live version : [Audio-Shader #3 Sunset](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/3/)



https://user-images.githubusercontent.com/15678544/236633400-1310db30-0002-4c68-bad1-1c4dcc7ce69d.mp4



Live version : [Audio-Shader #4 Onion](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/4/)



https://github.com/devildrey33/Audio-PlayGround/assets/15678544/ba610cb6-e8eb-414e-8b6e-bfdc82254517



Live version : [Audio-Shader #5 YinYang](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/5/)



https://github.com/devildrey33/Audio-PlayGround/assets/15678544/6610bf9e-5926-4a24-ab2a-ebb4a7a0a7dd



Live version : [Audio-Shader #6 YinYang Punk](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/6/)




https://github.com/devildrey33/Audio-PlayGround/assets/15678544/999a848e-0e91-46a1-a9b7-1a3c66c803f4



Live version : [Audio-Shader #7 Floor and Bars](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/7/)



https://github.com/devildrey33/Audio-PlayGround/assets/15678544/1af81003-cc71-4113-8cdf-5c93951750f4



Live version : [Audio-Shader #8 Perlin SUn](https://devildrey33.es/Ejemplos/Three.js-Journey/Audio-PlayGround/8/)

