uniform sampler2D uAudioTexture;    // AUdio data values
uniform float     uAudioStrength;   // Audio strength
uniform float     uAudioZoom;       // Audio Zoom
uniform vec3      uColor;           // Color
uniform float     uSize;            // Line size
uniform float     uRadius;          // Radius size
varying vec2      vUv; 

#define PI   3.14159265


void main() {
    vec2  center    = vUv - 0.5;
    float dist      = length(center);

    float audioValue = ((texture2D(uAudioTexture, vec2(vUv.x / uAudioZoom, 0.0) * uRadius).r) * uAudioStrength);

//    float audioValue = texture2D(uAudioTexture, vec2(vUv.x * uRadius, 0.5)).r; // Obtiene el valor del canal rojo de la textura
    dist -= audioValue * uAudioStrength;

    // base color
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    
    if (dist > uRadius - uSize && dist < uRadius) {
        color = vec4(uColor, 1.0);
    }
    else {
        discard;
    }

    gl_FragColor = color;

}
