//uniform float     uTime;
//uniform vec2      uResolution;
uniform float     uSize;
uniform float     uAlpha;
uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uAudioZoom;
varying vec2      vUv; // Coordenadas UV del fragmento

void main() {
    // Get the audio value from texture green channel
    float audioValue = ((texture2D(uAudioTexture, vec2(vUv.x / uAudioZoom, 0.0)).g - .5) * uAudioStrength) + .5;

    if (abs(vUv.y - audioValue) < uSize) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    } 
    else {
        gl_FragColor = vec4(0.25, 0.25, 0.25, uAlpha);
    }
}
