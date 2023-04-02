# Audio-Experience
 
First i want to see how hard i can push a mobile device, i need to replicate the screens of [EspectroAudible](https://github.com/devildrey33/EspectroAudible) in GLSL

At the moment i did a texture of 32*32 (1024 values * 4 channels) to pass Frequency (in channel R) and TimeDomain (in channel G) of the song

Has a plane of 32*32 to use Frequency array and move y-axis of the mesh in a shader (red channel)

I have an aproach to an osciloscope that uses the TimeDomain in GLSL, its a start but needs more work... (green channel)

You can drag & drop a song of your hard disk into the experience to play it.

![Audio-playground](https://user-images.githubusercontent.com/15678544/229359184-8299a25f-1c2f-46f6-86ed-1746620316a9.png)
