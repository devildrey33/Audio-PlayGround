uniform float     uAlpha;
uniform sampler2D uAudioTexture;
uniform float     uTime;
uniform float     uHighFrequency;
uniform float     uLowFrequency;
uniform float     uColorStrength;
uniform float     uHover;
uniform float     uRotate;
varying vec2      vUv; // Coordenadas UV del fragmento

#define PI   3.14159265


// Make a circle
vec4 circle(vec4 currentColor, vec2 st, vec2 center, float radius, vec3 color) {
    float dist = length(st - center);

    if (dist < radius) {
        return vec4(color, 1.0);
    } 
    return currentColor;
}

// Function to make a round rectangle when the 2d plane is hover
vec4 borderRoundRect(vec4 currentColor, vec2 size, float radius) {
    vec2  position   = vUv * size;
    vec2  rounded    = vec2(clamp(position.x, radius, size.x - radius), clamp(position.y, radius, size.y - radius));
    vec2  difference = position - rounded;
    float dist       = length(difference);
    vec4  color      = vec4(1.0, 1.0, 1.0, uHover); // Border color
    float borderSize = 0.015;                       // Border size
    float alpha      = step(0.2, smoothstep(radius - borderSize, radius- borderSize, dist) - smoothstep(radius, radius + borderSize, dist));
    color.a = alpha * uHover;
    // Its inside
    if (dist > radius - borderSize) {
        return color;
    }
    // Its outside
    return currentColor;
}


vec4 arc(vec4 currentColor, float radius, float startAngle, float endAngle, vec4 color) {
    vec2 fragmentToCenter = vUv - vec2(0.5, 0.5);
    float distanceToCenter = length(fragmentToCenter);

    if (distanceToCenter < radius) {
        float angle = atan(fragmentToCenter.y, fragmentToCenter.x);
        angle = mod(angle - startAngle, 2.0 * 3.14159265358979323846); // normalize angle
        if (angle <= (endAngle - startAngle)) {
            return color;
        }
    }
    return currentColor;
}


void main() {

    // Center of the plane
    vec2 center = vec2(0.5, 0.5);

    // Calculate rotation matrix based on uTime (do 16 cycles and then reverse)
    float angle = -sin(uTime * 0.025) * 32.0 * 3.14159265 * uRotate;  // 2pi radiants are 360deg, so whe are rotating 16 times
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
    vec4 color = vec4(0.0, 0.0, 0.0, (uAlpha + uHover) * 0.80);

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
    float audioValue = texture2D(uAudioTexture, vec2(normAngle, 0.0)).r * 0.25;
    dist -= audioValue;

    if (dist < radius) { // fill
    //if (dist > radius - 0.3 && dist < radius) { // Line
        // red part
        if (rad < 0.0) {
            color = vec4(uColorStrength, 0.0, 0.0, 1.0);
//            color = arc(color, audioValue * 5.0, rad, rad + (PI * 0.25), vec4(uColorStrength, 0.0, 0.0, 1.0));
        }
        // white part
        else {
            color = vec4(1.0, 1.0, 1.0, 1.0);
//            color = arc(color, audioValue * 5.0, rad, rad + (PI * 0.25), vec4(1.0, 1.0, 1.0, 1.0));
        }
    } 

    // White left circle 
    color = circle(color, finalCoords, vec2(0.25 + 0.125, 0.5), 0.125, vec3(1.0, 1.0, 1.0));
    // Black right circle
    color = circle(color, finalCoords, vec2(0.75 - 0.125, 0.5), 0.125, vec3(uColorStrength, 0.0, 0.0));
    // Black left mini circle 
    float miniRadiusB = 0.0625 * 0.35 + uHighFrequency;
    color = circle(color, finalCoords, vec2(0.25 + 0.125, 0.5), miniRadiusB, vec3(uColorStrength, 0.0, 0.0));
    // White right mini circle
    float miniRadiusW = 0.0625 * 0.35 + uLowFrequency;
    color = circle(color, finalCoords, vec2(0.75 - 0.125, 0.5), miniRadiusW, vec3(1.0, 1.0, 1.0));
    
    
    // Apply the round hover border
    color = borderRoundRect(color, vec2(1.0, 1.0), 0.125);
    
//    color = arc(color, 1.0, rad, rad + (PI * 0.5), vec4(0, uColorStrength, uColorStrength, 1.0));

    // Set the final color
    gl_FragColor = color;
}