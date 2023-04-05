uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uSize;
uniform float     uAlpha;
varying vec2      vUv;


void main() {
    float radius    = 0.25;
    float thickness = uSize;
    vec2  center    = vUv - 0.5;
    float dist      = length(center);

    float audioValue = texture2D(uAudioTexture, vec2(vUv.x * radius, 0.5)).r; // Obtiene el valor del canal rojo de la textura
    dist -= audioValue * uAudioStrength;

    if (dist > radius - thickness && dist < radius) {
        gl_FragColor = vec4(0.75, 0.0, 0.0, 1.0);
    }
    else {
        gl_FragColor = vec4(0.25, 0.25, 0.25, uAlpha);
    }
}

