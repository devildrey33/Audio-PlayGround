uniform sampler2D uAudioTexture;
uniform float uTime;
uniform float uAudioStrength;
uniform float uAudioZoom;
uniform float uAudioStrengthSin;
uniform float uAudioZoomSin;

uniform float uFrequency; // 0.1 are 10 lines, 0.01 are 100 lines
uniform float uSpeed;
uniform float uThickness;

uniform float uFrequencySin; // 0.1 are 10 lines, 0.01 are 100 lines
uniform float uSpeedSin;
uniform float uThicknessSin;

varying vec2 vUv;

void main() {
    float audioX = 0.0;
    // adapt audio position to be 0.0 => 1.0 => 0.0
    // So when x is below 0.5 use vUv * 2, else invert the position
    if (vUv.x < 0.5) audioX = vUv.x * 2.0;
    else             audioX = 1.0 - ((vUv.x  - 0.5) * 2.0);

    float audioValue = ((texture2D(uAudioTexture, vec2((audioX / uAudioZoom), 0.0)).r) * uAudioStrength) * uFrequency;
    //float audioValue = (((texture2D(uAudioTexture, vec2(audioX / uAudioZoom, 0.0)).g - 0.5) * 0.55) * uAudioStrength) * uFrequency;

    // Bars spiral
    vec2 nPos = vec2(vUv.x, vUv.y + (vUv.x * uFrequency) - mod(uTime * uSpeed, 1.0) - audioValue);
    float p = mod(nPos.y, uFrequency);

    // Oscyloscope spiral
    float audioValueSin = (((texture2D(uAudioTexture, vec2(audioX / uAudioZoomSin, 0.0)).g - 0.5) * 0.55) * uAudioStrength) * uFrequency;

    vec2 nPosSin = vec2(vUv.x, vUv.y - (vUv.x * uFrequencySin) - mod(uTime * uSpeedSin, 1.0) - audioValueSin);
    float pSin = mod(nPosSin.y, uFrequencySin);

    if (pSin < (uFrequencySin * uThicknessSin)) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 0.8);
    }
    else if (p < (uFrequency * uThickness)) {        
        gl_FragColor = vec4(0.0, sin(uTime * 0.5), cos(uTime), smoothstep(0.0, uFrequency * uThickness, p));
    }
    else {
//        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.8);
        discard;
    }
}