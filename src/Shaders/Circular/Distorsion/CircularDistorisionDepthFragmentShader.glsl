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

    float radius    = 0.20;
    float thickness = uSize;
    vec2  center    = vUv - 0.5;
    float dist      = length(center);

    float audioValue = texture2D(uAudioTexture, vec2(vUv.x * radius, 0.5)).r; // Obtiene el valor del canal rojo de la textura
    dist -= audioValue * uAudioStrength;

    // base color
    vec4 color = vec4(0.0, 0.0, 0.0, (uAlpha + uHover) * 0.80);


    if (dist > radius - thickness && dist < radius) {
        color = vec4(0.75, 0.0, 0.0, 1.0);
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