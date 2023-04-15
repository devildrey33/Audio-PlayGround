uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uSize;
uniform float     uAlpha;
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
    float radius    = 0.2;
    float thickness = uSize;
    float space     = 0.5 - (thickness * 2.0) - radius;
    vec2  center    = vec2(vUv.x - 0.5, vUv.y - 0.5);
    float dist      = length(center);

    float rad = atan(vUv.y - 0.5, vUv.x - 0.5);
    // normalize angle 0 to 1    
    float normAngle = 0.0;
    // rad its greater than 0
    if (rad < 0.0) {
        normAngle = (rad + PI) / PI;
    }
    // rad its below 0
    else {
        // Invert the normalized angle        
        normAngle = 1.0 - (1.0 + ((rad - PI) / PI));
    }
 
    // Get the audio value from linear audio data texture (1024*1)
    // Red channel has the frequency that starts from 0 to 1
    float audioValue = texture2D(uAudioTexture, vec2(normAngle, 0.0)).g; 
    dist -= audioValue * uAudioStrength;

    vec4 color = vec4(0.0, 0.0, 0.0, (uAlpha + uHover) * 0.80);

    if (dist > radius - thickness && dist < radius) {
        color = vec4(0.0, 0.75, 0.0, 1.0);
    }

    // Apply the round hover border
    color = borderRoundRect(color, vec2(1.0, 1.0), 0.125);

    if (color.r == 0.0 && color.g == 0.0 && color.b == 0.0 && color.a == 0.0) discard;

    gl_FragColor = color;
}