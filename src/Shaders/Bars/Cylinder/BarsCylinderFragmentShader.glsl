uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform vec3      uColor;
uniform vec3      uColor2;
varying vec2      vUv;


void main () {

    float normPos = 0.0;
    if (vUv.x > 0.5) {
        normPos = 1.0 - vUv.x;
    }
    else {
        normPos = vUv.x * 2.0;
    }
    float audioValue = 0.1 + texture2D(uAudioTexture, vec2(normPos, 0.0)).r;



    if ((vUv.y - audioValue) < 0.0) {
        gl_FragColor = vec4(mix(uColor, uColor2, vUv.y), 0.6);
    }
    else {
        discard;
    }

}
