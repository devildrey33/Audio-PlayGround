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

// https://www.shadertoy.com/view/XljGzV
// Created by anastadunbar
vec3 hsl2rgb( in vec3 c ) {
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

void main() {
    float audioX = 0.0;
    // adapt audio position to be 0.0 => 1.0 => 0.0
    // So when x is below 0.5 use vUv * 2, else invert the position
    if (vUv.x < 0.5) audioX = vUv.x * 2.0;
    else             audioX = 1.0 - ((vUv.x  - 0.5) * 2.0);

    // Get audio bars value
    float audioValue = ((texture2D(uAudioTexture, vec2((audioX / uAudioZoom), 0.0)).r) * uAudioStrength) * uFrequency;

    // Bars spiral
    vec2 nPos = vec2(vUv.x, vUv.y + (vUv.x * uFrequency) - mod(uTime * uSpeed, 1.0) - audioValue);
    float p = mod(nPos.y, uFrequency);

    // Get audio osciloscpe value
    float audioValueSin = (((texture2D(uAudioTexture, vec2(audioX / uAudioZoomSin, 0.0)).g - 0.5) * 0.55) * uAudioStrength) * uFrequency;

    // Oscyloscope spiral
    vec2 nPosSin = vec2(vUv.x, vUv.y - (vUv.x * uFrequencySin) - mod(uTime * uSpeedSin, 1.0) - audioValueSin);
    float pSin = mod(nPosSin.y, uFrequencySin);

    // First paint the osciloscope
/*    if (pSin < 0.01) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 0.8);
    }*/
    if (pSin < (uFrequencySin * uThicknessSin)) {        
//        gl_FragColor = vec4(hsl2rgb(vec3(-uTime * 0.25, 1, 0.5 )), p);
        gl_FragColor = vec4(1.0, 1.0, 1.0, 0.8);
    }
    // Then paint the bars
    else if (p < (uFrequency * uThickness)) {        
//        gl_FragColor = vec4(0.0, sin(uTime * 0.5), 0.5 + cos(uTime * 1.25), smoothstep(0.0, uFrequency * uThickness, p));
        gl_FragColor = vec4(hsl2rgb(vec3(uTime * 0.25, 1, vUv.y *0.75 )), p);
    }
    // discard the rest
    else {
        discard;
    }
}