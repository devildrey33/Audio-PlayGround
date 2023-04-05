uniform float     uAlpha;
uniform sampler2D uAudioTexture;
//uniform float     uAudioStrength;
uniform float     uHighFrequency;
uniform float     uLowFrequency;
varying vec2      vUv; // Coordenadas UV del fragmento

#define PI   3.14159265

// Make a black and white circle
vec4 circleBW(vec4 currentColor, vec2 st, vec2 center, float radius) {
    float dist = length(st - center);

    if (dist < radius) {
        vec3 color = vec3(0.0);
        if (st.y > center.y) {
            color += vec3(1.0);
        }
        if (st.y < center.y) {
            color += vec3(0.0, 0.0, 0.0);
        }
        return vec4(color, 1.0);
    } else {
        return currentColor;
    }
}

// Make a circle
vec4 circle(vec4 currentColor, vec2 st, vec2 center, float radius, vec3 color) {
    float dist = length(st - center);

    if (dist < radius) {
        return vec4(color, 1.0);
    } else {
        return currentColor;
    }
}


void main() {

    float radius = 0.25;
    vec2  center = vec2(0.5, 0.5);
    vec4  color  = vec4(0.25, 0.25, 0.25, uAlpha);

    float dist = length(vUv - center);
    // get angle in rads of current position from center
    float rad = atan(vUv.y - center.y, vUv.x - center.x);
    float normAngle = 0.0;

    // Divide the circle into two halfs and make a mirror 
    // I use linear audio textute form 0 to 1 in one half and in the other half i use the audio texture from 1 to 0.
    if (rad < 0.0) {
        normAngle = (rad + PI) / PI;
    } else {
        normAngle = (1.0 + ((rad - PI) / PI));
    }

    // Usar la textura para obtener el radio basado en el ángulo
    float audioValue = (texture2D(uAudioTexture, vec2(normAngle, 0.0)).g - 0.5) * 0.75;
//    float audioValue = texture2D(uAudioTexture, vec2(normAngle, 0.0)).r * 0.25;
    dist -= audioValue;

    if (dist < radius) { // fill
    //if (dist > radius - 0.3 && dist < radius) { // Line
        if (rad > 0.0) {
            color = vec4(1.0, 1.0, 1.0, 1.0);
        }
        else {
            color = vec4(0.0, 0.0, 0.0, 1.0);
        }
    } 

    // First big circle black / white
    color = circleBW(color, vUv, center, radius);
    // White left circle 
    color = circle(color, vUv, vec2(0.25 + 0.125, 0.5), 0.125, vec3(1.0, 1.0, 1.0));
    // Black right circle
    color = circle(color, vUv, vec2(0.75 - 0.125, 0.5), 0.125, vec3(0.0, 0.0, 0.0));
    // Black left mini circle 
    float miniRadiusB = 0.0625 * 0.35 + uHighFrequency;
    color = circle(color, vUv, vec2(0.25 + 0.125, 0.5), miniRadiusB, vec3(0.0, 0.0, 0.0));
    // White right mini circle
    float miniRadiusW = 0.0625 * 0.35 + uLowFrequency;
    color = circle(color, vUv, vec2(0.75 - 0.125, 0.5), miniRadiusW, vec3(1.0, 1.0, 1.0));
    
    
    
    
    // Set the final color
    gl_FragColor = color;
}