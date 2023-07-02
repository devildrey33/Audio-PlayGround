uniform sampler2D tDiffuse;
uniform float uTime;
uniform vec2 uAmplitude;
uniform vec2 uFrequency;

varying vec2 vUv;

void main() {
    vec2 newUv = vec2(
        vUv.x + sin(vUv.y * uFrequency.y + uTime) * uAmplitude.y,
        vUv.y + -sin(vUv.x * uFrequency.x + uTime) * uAmplitude.x
    );
    vec4 color = texture2D(tDiffuse, newUv);

    gl_FragColor = color;
}


/*
varying vec2 vUv;

void main() {
    float LineWidth = 0.001;
    float Amplitude = 0.001;
    vec4 Color = texture2D(tDiffuse, vUv);
    

    float x = vUv.x - 0.5;
    float y = vUv.y - 0.5;
    
    float angle = atan(y, x);
    float radius = Amplitude * angle;
    
    float distanceToCenter = length(vec2(x, y));
    float lineAlpha = smoothstep(LineWidth - 0.005, LineWidth + 0.005, distanceToCenter - radius);
    
    gl_FragColor = vec4(Color.rgb, lineAlpha);
}*/