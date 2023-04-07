uniform sampler2D uAudioTexture;
uniform float     uHover;
varying vec2      vUv;           // uv coordinates from fragment



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
    float audioValue = texture2D(uAudioTexture, vUv).g;
    vec4 color = vec4(0.0, audioValue, 0.0, 1.0);

    // Apply the round hover border
    color = borderRoundRect(color, vec2(1.0, 1.0), 0.125);

    gl_FragColor = color;
}