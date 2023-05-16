//uniform float     uAlpha;
uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uAudioZoom;
uniform float     uTime;
uniform vec3      uColor;
uniform vec3      uColor2;

varying vec2      vUv; // Coordenadas UV del fragmento

#define PI   3.14159265

// Base color
vec4 color = vec4(0.0, 0.0, 0.0, 0.0);



// Make a circle
vec4 circle(vec2 st, vec2 center, float radius, vec3 newColor) {
    float dist = length(st - center);

    if (dist < radius) {
//        vec3 col = smoothstep(newColor, vec3(color.rgb), vec3(dist + radius * 2.0));
//        return vec4(col, 1.0);
        return vec4(newColor, 1.0);
    } 
    return color;
}



void main() {

    // Center of the plane
    vec2 center = vec2(0.5, 0.5);

    // Calculate rotation matrix based on uTime (do 16 cycles and then reverse in 60 seconds aprox..)
    float angle = sin(uTime * 0.000075) * 32.0 * PI;  // 2pi radiants are 360deg, so whe are rotating 16 times
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    // Translate coordinates to the center of the object
    vec2 translated = vUv - center;
    // Rotate coordinates
    vec2 rotated = rotation * translated;    
    // Translate coordinates to their original position
    vec2 finalCoords = rotated + center;

    // yin yang circle radius
    float radius = 0.25;


    float dist = length(finalCoords - center);
    // get angle in rads of current position from center
    float rad = atan(finalCoords.y - center.y, finalCoords.x - center.x);
    float normAngle = 0.0;

    // Divide the circle into two halfs and make a mirror 
    // I use linear audio textute form 0 to 1 in one half and in the other half i use the audio texture from 1 to 0.
    if (rad < 0.0) { normAngle = ((rad + PI) / PI);    }
    else           { normAngle = (((rad - PI) / PI));  }

    normAngle = mod(normAngle + uTime * 0.25, 1.0);
    
    // Use the audio texture to obtain the radius based in the angle
    float audioValue = (texture2D(uAudioTexture, vec2(normAngle / uAudioZoom, 0.0)).g - 0.5) * 0.5 * uAudioStrength;
    dist -= audioValue;


    if (dist < radius) { // fill
        if (rad >= 0.0) {
            color = vec4(uColor, 1.0);
        }
        else {
            color = vec4(uColor2, 1.0);
        }
    } 


    // White left circle 
    color = circle(finalCoords, vec2(0.25 + 0.125, 0.5), 0.125, uColor);
    // Black right circle
    color = circle(finalCoords, vec2(0.75 - 0.125, 0.5), 0.125, uColor2);
    // Black left mini circle 
    color = circle(finalCoords, vec2(0.25 + 0.125, 0.5), 0.0425, uColor2);
    // White right mini circle
    color = circle(finalCoords, vec2(0.75 - 0.125, 0.5), 0.0425, uColor);      


    // Set the final color
//    gl_FragColor = smoothstep(color, vec4(0.0), vec4(vec3(dist * 2.5), 0.0));
    gl_FragColor = color;
}