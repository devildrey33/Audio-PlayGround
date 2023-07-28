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

varying vec2        vUv; // Coordenadas UV del fragmento

#define PI   3.14159265
#define TAU  PI * 2.0

//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x)       { return mod(((x*34.0)+1.0)*x, 289.0);            }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t)          { return t*t*t*(t*(t*6.0-15.0)+10.0);             }

float cnoise(vec3 P){
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
}

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
    vec2 nPos = vec2(pos.x, pos.y - (pos.x * uFrequency) + mod(uTime * uSpeed, 1.0) - audioValue);
    // pos y of each line
    float p = mod(nPos.y, uFrequency);

    // Get audio osciloscpe value
    float audioValueSin = (((texture2D(uAudioTexture, vec2(audioXSin / uAudioZoomSin, 0.0)).g - 0.5) * 0.55) * uAudioStrengthSin) * uFrequencySin;

    // Oscyloscope spiral
    vec2 nPosSin = vec2(pos.x, pos.y - (pos.x * uFrequencySin) + mod(uTime * uSpeedSin, 1.0) - audioValueSin);
    float pSin = mod(nPosSin.y, uFrequencySin);

    

    // Paint the spiral osciloscope
    if (pSin < (uFrequencySin * uThicknessSin)) {        
        return vec4(1.0, 1.0, 1.0, (1.0 - pos.y));
        //return vec4(hsl2rgb(vec3(uTime * 0.331, 1, pos.y * 0.75 )), pSin * 10.0) * 1.5;
    }
    // Paint the spiral bars
    /*if (p < 0.001) {
        return vec4(0.0, 0.0, 0.0, 1.0);        
    }
    else*/ if (p < (uFrequency * uThickness)) {        
        return vec4(hsl2rgb(vec3(uTime * -0.25, 1, (1.0 - pos.y) * 0.75 )), 1.0);
    }

    discard;
}



void main() {
    vec4 color = drawAudio(vUv);
    gl_FragColor = color;
//    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}