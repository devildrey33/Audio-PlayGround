uniform sampler2D uAudioTexture;    // AUdio data values
uniform float     uAudioStrength;   // Audio strength
uniform float     uAudioZoom;       // Audio Zoom
uniform vec3      uColor;           // Color
uniform float     uSize;            // Line size
varying vec2      vUv; 

void main() {
    // Get the audio value from texture green channel
    float audioValue = ((texture2D(uAudioTexture, vec2(vUv.x / uAudioZoom, 0.0)).g - .5) * uAudioStrength) + .5;
    // Its inside the line
    if (abs(vUv.y - audioValue) < uSize) {
        gl_FragColor = vec4(uColor, 1.0);
    }
    // Its outside the line
    else {
        discard;
    }
}
