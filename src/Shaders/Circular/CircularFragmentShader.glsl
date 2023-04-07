uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uSize;
uniform float     uAlpha;
uniform float     uTime;
uniform float     uHover;
varying vec2      vUv;

#define PI   3.14159265

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


void main() {
    vec2  center       = vec2(0.65, 0.5); // projected center of the circle a bit down of the uv center
    float radius       = 0.2;
    float thickness    = uSize;
    //  float centerRadius = 0.2;

    float dist = length(vUv - center);
    // get angle in rads of current position from center
    float rad = atan(vUv.y - center.y, vUv.x - center.x);
    float normAngle = 0.0;

    // Divide the circle into two halfs and make a mirror 
    // I use linear audio textute form 0 to 1 in one half and in the other half i use the audio texture from 1 to 0.
    if (rad < 0.0) {
        normAngle = (rad + PI) / PI;
    } else {
        normAngle = 1.0 - (1.0 + ((rad - PI) / PI));
    }

    // Usar la textura para obtener el radio basado en el ángulo
    float audioValue = texture2D(uAudioTexture, vec2(normAngle, 0.0)).r * uAudioStrength;
    dist -= audioValue;

    // Base color
    vec4 color = vec4(0.25, 0.25, 0.25, (uAlpha + uHover) * 0.125);

    //if (dist < radius) { // fill
    if (dist > radius - thickness && dist < radius) { // Line
        color = vec4(1.0, 0.0, 0.0, 1.0);
    } 

    // Apply the round hover border
    color = borderRoundRect(color, vec2(1.0, 1.0), 0.125);

    gl_FragColor = color;
}
