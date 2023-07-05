varying vec2 vUv;

void main() {

    // Apply model transforms, view an projection
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    // Set transformed position to gl_Position
    gl_Position = projectionPosition;

    // Pass the uv to the fragment shader
    vUv = uv;
}
