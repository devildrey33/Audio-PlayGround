uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uSize;
uniform float     uAlpha;
varying vec2      vUv;

#define PI   3.14159265
#define TAU  PI * 2.0

void main() {
    float radius    = 0.2;
    float thickness = uSize;
    float space     = 0.5 - (thickness * 2.0) - radius;
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
    float audioValue = texture2D(uAudioTexture, vec2(normAngle, 0.0)).g; 
    dist -= audioValue * uAudioStrength;

    if (dist > radius - thickness && dist < radius) {
        gl_FragColor = vec4(0.0, 0.75, 0.0, 1.0);
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
}