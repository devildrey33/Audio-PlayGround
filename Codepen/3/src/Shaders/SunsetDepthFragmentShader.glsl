uniform float     uSize;
uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uAudioZoom;
uniform float     uRadius;
varying vec2      vUv; // Coordenadas UV del fragmento

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

    vec2  center    = vUv - 0.5;
    float dist      = length(center);

    float audioValue = ((texture2D(uAudioTexture, vec2(vUv.x / uAudioZoom, 0.0) * uRadius).r) * uAudioStrength);
    dist -= audioValue * uAudioStrength;   
    if (dist > uRadius - uSize && dist < uRadius) {
        diffuseColor = vec4(0.0, 0.75, 0.0, 1.0);
    }
    else {
        discard;
    }

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