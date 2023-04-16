//uniform float     uTime;
//uniform vec2      uResolution;
uniform float     uSize;
uniform float     uAlpha;
uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uAudioZoom;
uniform float     uHover;
uniform float     uTime;
uniform vec3      uColor;
varying vec2      vUv; // Coordenadas UV del fragmento


vec4 posColor(float alpha, float x) {
    // Cambia el valor de 'interval' para controlar la velocidad de cambio de colores
    float interval = 5.0;
    
    // Calcula un valor entre 0 y 1 que representa el tiempo transcurrido desde el inicio de la ejecución del programa
    float t = mod(uTime, interval) / interval;
    
    // Calcula un color que cambia gradualmente entre los colores rojo, verde, azul y amarillo
    vec3 color = mix(vec3(1.0, 0.0, 0.0), mix(vec3(0.0, 1.0, 0.0), mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 1.0, 0.0), t), t), t);
    
    // Calcula un gradiente de transparencia basado en la coordenada x
    float alphaGradient = smoothstep(0.0, 1.0, x);
    
    // Suaviza la transición del color al inicio y al final del gradiente
    float smoothstepX = smoothstep(0.05, 0.95, x);
    
    // Combina el color y la transparencia en un vec4
    return vec4(color * smoothstepX, alpha * smoothstep(alphaGradient, 1.0 - alphaGradient, smoothstepX));
}


void main() {
    // Get the audio value from texture green channel
    float audioValue = ((texture2D(uAudioTexture, vec2(vUv.x / uAudioZoom, 0.0)).g - .5) * uAudioStrength) + .5;

    

    if (abs(vUv.y - audioValue) < uSize) {
        gl_FragColor = vec4(uColor, 1.0);
    }
    else {
        discard;
    }

    //gl_FragColor = color;
}
