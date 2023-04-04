uniform sampler2D uAudioTexture;
varying vec2      vUv; // Coordenadas UV del fragmento


void main() {
    vec4 color = texture2D(uAudioTexture, vUv);
    gl_FragColor = color;
}