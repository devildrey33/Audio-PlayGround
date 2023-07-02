varying vec2 vUv;

void main() {

    // Aplicar las transformaciones de modelo, vista y proyección
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    // Asignar la posición transformada a gl_Position
    gl_Position = projectionPosition;

    // Pasar las coordenadas de textura sin transformar a la etapa de fragmentos
    vUv = uv;
}