uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uSize;
uniform float     uAlpha;
uniform float     uTime;
uniform float     uHover;
varying vec2      vUv;




#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif


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
    else {
        discard;
    }

    diffuseColor = color;
//    gl_FragColor = vec4(color.r);
//    if (color.a == 0.0) discard;



	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	
    #if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif

}