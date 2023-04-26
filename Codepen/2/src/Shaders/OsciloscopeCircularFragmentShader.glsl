uniform sampler2D uAudioTexture;    // AUdio data values
uniform float     uAudioStrength;   // Audio strength
uniform float     uAudioZoom;       // Audio Zoom
uniform vec3      uColor;           // Color
uniform float     uSize;            // Line size
uniform float     uRadius;          // Radius size
varying vec2      vUv; 

#define PI   3.14159265

void main() {
    float thickness = uSize;
    float space     = 0.5 - (thickness * 2.0) - uRadius;
    vec2  center    = vec2(vUv.x - 0.5, vUv.y - 0.5);
    float dist      = length(center);

    float rad = atan(vUv.y - 0.5, vUv.x - 0.5);
    // normalize angle 0 to 1    
    float normAngle = 0.0;
    // rad its greater than 0
    if (rad < 0.0) {
        normAngle = (rad + PI) / PI;
    }
    // rad its below 0
    else {
        // Invert the normalized angle        
        normAngle = 1.0 - (1.0 + ((rad - PI) / PI));
    }
 
    // Get the audio value from linear audio data texture (1024*1)
    // Red channel has the frequency that starts from 0 to 1
    float audioValue = ((texture2D(uAudioTexture, vec2(vUv.x / uAudioZoom, 0.0)).g - .5) * uAudioStrength) + .5;
    dist -= audioValue * uAudioStrength;

    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    if (dist > uRadius - thickness && dist < uRadius) {
        color = vec4(uColor, 1.0);
    }


    gl_FragColor = color;
}