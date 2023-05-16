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
        return vec4(newColor, 1.0);
    } 
    return color;
}


void main() {

    // Center of the plane
    vec2 center = vec2(0.5, 0.5);

    // Calculate rotation matrix based on uTime (do 16 cycles and then reverse)
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
    // Base color
//    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    float dist = length(finalCoords - center);
    // get angle in rads of current position from center
    float rad = atan(finalCoords.y - center.y, finalCoords.x - center.x);
    float normAngle = 0.0;

    // Divide the circle into two halfs and make a mirror 
    // I use linear audio textute form 0 to 1 in one half and in the other half i use the audio texture from 1 to 0.
    if (rad < 0.0) {
        normAngle = (rad + PI) / PI;            // red part
    } 
    else {
        normAngle = (1.0 + ((rad - PI) / PI));  // white part
    }

    
    // Use the audio texture to obtain the radius based in the angle
//    float audioValue = texture2D(uAudioTexture, vec2(normAngle, 0.0)).r * 0.25;
    float audioValue = texture2D(uAudioTexture, vec2(normAngle / uAudioZoom, 0.0)).r * uAudioStrength * radius;

    dist -= audioValue;

    if (dist < radius) { // fill
    //if (dist > radius - 0.3 && dist < radius) { // Line
        // red part
        if (rad < 0.0) {
            color = vec4(uColor, 1.0);
        }
        // white part
        else {
            color = vec4(uColor2, 1.0);
        }
    } 

    // White left circle 
    color = circle(finalCoords, vec2(0.25 + 0.125, 0.5), 0.125, uColor2);
    // Black right circle
    color = circle(finalCoords, vec2(0.75 - 0.125, 0.5), 0.125, uColor);
    // Black left mini circle 
    color = circle(finalCoords, vec2(0.25 + 0.125, 0.5), 0.0425, uColor);
    // White right mini circle
    color = circle(finalCoords, vec2(0.75 - 0.125, 0.5), 0.0425, uColor2);
    
    

    // Set the final color
    gl_FragColor = color;
}