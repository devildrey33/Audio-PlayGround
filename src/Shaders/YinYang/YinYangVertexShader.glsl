varying vec2 vUv;
uniform float uTime;
uniform float uRotate;

void main() {
    // Definir un ángulo de rotación en radianes (por ejemplo, 45 grados)
    float angle = 0.0;
    
    angle = radians(uTime * 0.025) * uRotate;

    // Crear la matriz de rotación 2D en el eje Z
    mat2 rotationMatrix = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));

    // Transformar la posición del vértice aplicando la matriz de rotación
    vec2 rotatedPosition = rotationMatrix * position.xy;

    // Aplicar las transformaciones de modelo, vista y proyección
    vec4 modelPosition = modelMatrix * vec4(rotatedPosition, 0.0, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    // Asignar la posición transformada a gl_Position
    gl_Position = projectionPosition;

    // Pasar las coordenadas de textura sin transformar a la etapa de fragmentos
    vUv = uv;
}