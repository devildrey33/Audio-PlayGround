uniform sampler2D uAudioTexture;    // AUdio data values
uniform float     uAudioStrength;   // Audio strength
uniform float     uAudioZoom;       // Audio Zoom
uniform vec3      uColor;           // Color
uniform float     uSize;            // Line size
uniform float     uRadius;          // Radius size
varying vec2      vUv; 

#define PI   3.14159265


void main() {
    vec2  center       = vec2(0.60, 0.5); // projected center of the circle a bit down of the uv center
    float radius       = 0.2;
    float thickness    = uSize;
    //  float centerRadius = 0.2;

    float dist = length(vUv - center);
    // get angle in rads of current position from center
    float rad = atan(vUv.y - center.y, vUv.x - center.x);
    float normAngle = 0.0;

    // Divide the circle into two halfs and make a mirror 
    // I use linear audio textute form 0 to 1 in one half and in the other half i use the audio texture from 1 to 0.
    if (rad < 0.0) {
        normAngle = (rad + PI) / PI;
    } else {
        normAngle = 1.0 - (1.0 + ((rad - PI) / PI));
    }

    //float audioValue = ((texture2D(uAudioTexture, vec2(vUv.x / uAudioZoom, 0.0) * uRadius).r) * uAudioStrength);
    // Usar la textura para obtener el radio basado en el ángulo
    float audioValue = texture2D(uAudioTexture, vec2(normAngle / uAudioZoom, 0.0)).r * uAudioStrength;
    dist -= audioValue;

    // Base color
    vec4 color = vec4(0.0, 0.0, 0.0, 0.80);


    //if (dist < radius) { // fill
    if (dist > uRadius - thickness && dist < uRadius) { // Line
        color = vec4(uColor, 1.0);
    } 
    else {
        discard;
    }


    gl_FragColor = color;
}
