
uniform float uTime;
varying vec2 vUv;
/*
void main() {
    // Apply model transforms, view, and projection
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Rotate around Z-axis
    float angle = radians(mod(uTime * 10.5, 360.0));  // Angulo de rotación en grados (puedes cambiarlo a tu preferencia)
    mat4 rotationMatrix = mat4(
        vec4(cos(angle), -sin(angle), 0.0, 0.0),
        vec4(sin(angle), cos(angle), 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );
    vec4 rotatedPosition = rotationMatrix * modelPosition;
    
    vec4 viewPosition = viewMatrix * rotatedPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    // Set transformed position to gl_Position
    gl_Position = projectionPosition;

    // Pass the uv to the fragment shader
    vUv = uv;
}
*/

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
