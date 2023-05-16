varying vec2 vUv;

void main() {
    float dist = length(vUv - vec2(0.5));


    // Fill the bar with red
    gl_FragColor = vec4(0.75 + dist, 1.0 - dist, 0.0, 1.0);
}