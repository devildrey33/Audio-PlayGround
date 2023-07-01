


uniform sampler2D uAudioTexture;
uniform float     uAudioStrengthFreq;
uniform float     uAudioStrengthSin;
uniform float     uRadiusFreq;
uniform float     uRadiusSin;
uniform float     uTime;
//uniform float     uHover;
uniform float     uNoiseStrength;
uniform float     uNoiseSpeed;
//uniform float     uLowFrequency;

varying vec2      vUv; // Coordenadas UV del fragmento

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


vec3 getColor(float time) {
  float t = fract(time);  // Fracción de tiempo entre 0 y 1
  
  // Red, green y blue varían en ciclos independientes de tiempo
  float red = cos(t * 6.2831);  // Variación sinusoidal en el rango [-1, 1]
  float green = cos(t * 6.2831); // Variación cosinusoidal en el rango [-1, 1]
  float blue = sin(t * 6.2831 * 2.0); // Variación sinusoidal rápida en el rango [-1, 1]
  
  // Normalización y asignación del color resultante
  vec3 color = vec3(red, green, blue) * 0.5 + 0.75;
  
  return color;
}

// Make a circle with the frequency data
vec4 circleFreq(vec4 currentColor, vec2 center) {
    vec2 pos = vec2(0.55, 0.5);
    float dist = length(vUv - pos);
    float rad = atan(vUv.y - pos.y, vUv.x - pos.x);

    float normAngle = 0.0;
    if (rad < 0.0) {
        normAngle = ((rad + PI) / PI);
    } else {
        normAngle = 1.0 - (1.0 + ((rad - PI) / PI));
    }

    float audioValue = (texture2D(uAudioTexture, vec2(normAngle, 0.0)).r - 0.5) * .25 * uAudioStrengthFreq;
    // Perlin noise
//    float distNS = dist * uNoiseStrength;
    float strength = cnoise(vec3(rad * 2.0, dist * uNoiseStrength,  uTime * uNoiseSpeed)) * 0.1;
//    float strength = cnoise(vec3(-PI + (rad * 2.0), -(distNS * 0.5) + dist * uNoiseStrength,  uTime * uNoiseSpeed)) * 0.1;

    if (dist - audioValue + strength + 0.005 < uRadiusFreq) {
        float angle = uTime * .5 * PI;  // Ángulo de rotación en función del tiempo
        
        // Aplicar matriz de rotación al vector de coordenadas UV
        float cosAngle = cos(angle);
        float sinAngle = sin(angle);
        mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
        vec2 rotatedUV = rotationMatrix * vUv;        
        return vec4(abs(sin(uTime * 0.1)), abs(rotatedUV.x), abs(rotatedUV.y), 1.0); //vec4(color, 1.0);
    }
    else if (dist - audioValue + strength < uRadiusFreq) {
        return vec4(1.0, 1.0, 1.0, 1.0);
    } 
    return currentColor;
}


// // Make a circle with the time domain data
vec4 circleSin(vec4 currentColor, vec2 center) {
    vec2 pos1 = vec2(0.4, 0.5);
    float dist = length(vUv - center);
    float rad = atan(vUv.y - center.y, vUv.x - center.x);

    float normAngle = 0.0;
    if (rad < 0.0) {
        normAngle = ((rad + PI) / PI);
    } else {
        normAngle = (1.0 + ((rad - PI) / PI));
    }

    float audioValue = (texture2D(uAudioTexture, vec2(normAngle, 0.0)).g - 0.5) * .5 * uAudioStrengthSin;
    // Perlin noise
    float strength = 0.0; //cnoise(vec3(rad * TAU * 5.0, dist * 100.0,  uTime + color.b)) * radius * 0.1;

    if (dist - audioValue + strength + 0.01 < uRadiusSin) {
        return vec4(getColor(uTime * 0.05) , 0.5 + (2.0 * dist) - sin(uTime) * 0.25);
    }
    else if (dist - audioValue + strength < uRadiusSin) {
//        color.g += 1.0 - audioValue;
        return vec4(1.0, 1.0, 1.0, 1.0);
    } 
    return currentColor;
}

void main() {

    // Center of the plane
    vec2 center = vec2(0.5, 0.5);
    // Base color
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    color = circleFreq(color, center);
    color = circleSin(color, center);

    gl_FragColor = color;
}