uniform sampler2D uAudioTexture;
varying vec2      vUv; // Coordenadas UV del fragmento


void main() {
    float color = texture2D(uAudioTexture, vUv).g;
    gl_FragColor = vec4(0.0, color, 0.0, 1.0);
}