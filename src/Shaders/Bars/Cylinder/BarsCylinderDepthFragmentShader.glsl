uniform sampler2D uAudioTexture;
//uniform float     uAudioStrength;
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

    float normPos = 0.0;
    if (vUv.x > 0.5) normPos = 1.0 - vUv.x;
    else             normPos = vUv.x;
    float audioValue = 0.01 + texture2D(uAudioTexture, vec2(normPos, 0.0)).r;


    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
    if ((vUv.y - audioValue) < 0.0) {
//        gl_FragColor = vec4(color, 0.6);
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