uniform sampler2D   uAudioTexture;
uniform float       uAudioStrength;
uniform float       uAudioZoom;
uniform float       uAudioStrengthSin;
uniform float       uAudioZoomSin;

uniform float       uFrequency; // 0.1 are 10 lines, 0.01 are 100 lines
uniform float       uSpeed;
uniform float       uThickness;

uniform float       uFrequencySin; // 0.1 are 10 lines, 0.01 are 100 lines
uniform float       uSpeedSin;
uniform float       uThicknessSin;

uniform float       uTime;

varying vec2        vUv; 


// https://www.shadertoy.com/view/XljGzV
// Created by anastadunbar
vec3 hsl2rgb( in vec3 c ) {
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}


vec4 drawAudio(vec2 pos) {
    float mirror = 2.0;
    float mirrorSin = 1.0;
    float audioX = 0.0;
    float audioXSin = 0.0;
    // adapt audio position to be 0.0 => 1.0 => 0.0
    // So when x is below 0.5 use pos * 2, else invert the position
    if (mod(pos.x * mirror, 1.0) < 0.5) audioX = mod(pos.x * mirror, 1.0) * 2.0;
    else                                audioX = 1.0 - ((mod(pos.x * mirror, 1.0)  - 0.5) * 2.0);
    // adapt audio position to be 0.0 => 1.0 => 0.0
    // So when x is below 0.5 use pos * 2, else invert the position
    if (mod(pos.x * mirrorSin, 1.0) < 0.5)  audioXSin = mod(pos.x * mirrorSin, 1.0) * 2.0;
    else                                    audioXSin = 1.0 - ((mod(pos.x * mirrorSin, 1.0)  - 0.5) * 2.0);

    // Get audio bars value
    float audioValue = ((texture2D(uAudioTexture, vec2((audioX / uAudioZoom), 0.0)).r) * uAudioStrength) * uFrequency;

    // Bars spiral
    vec2 nPos = vec2(pos.x, pos.y - (pos.x * uFrequency) + mod(uTime * uSpeed, 1.0) + audioValue);
    // pos y of each line
    float p = mod(nPos.y, uFrequency);

    // Get audio osciloscpe value
    float audioValueSin = (((texture2D(uAudioTexture, vec2(audioXSin / uAudioZoomSin, 0.0)).g - 0.5) * 0.55) * uAudioStrengthSin) * uFrequencySin;

    // Oscyloscope spiral
    vec2 nPosSin = vec2(pos.x, pos.y + (pos.x * uFrequencySin) + mod(uTime * uSpeedSin, 1.0) + audioValueSin);
    float pSin = mod(nPosSin.y, uFrequencySin);

    

    // Paint the spiral osciloscope
    if (pSin < (uFrequencySin * uThicknessSin)) {        
        return vec4(1.0, 1.0, 1.0, (1.0 - pos.y) * 1.5);
        //return vec4(hsl2rgb(vec3(uTime * 0.331, 1, pos.y * 0.75 )), pSin * 10.0) * 1.5;
    }
    // Paint the spiral
    if (p < (uFrequency * uThickness)) {        
        return vec4(hsl2rgb(vec3(uTime * -0.05, 1, (1.0 - pos.y) * 0.5 )), 1.0);
    }

    discard;
}



void main() {
    vec4 color = drawAudio(vUv);
    gl_FragColor = color;
//    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}