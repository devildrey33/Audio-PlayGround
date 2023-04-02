uniform sampler2D uAudioTexture;
varying vec2      vUv; // Coordenadas UV del fragmento


void main() {
    float color = texture2D(uAudioTexture, vUv).r;
    gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
}