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

    vec2  center       = vec2(0.60, 0.5); // projected center of the circle a bit down of the uv center
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
	float audioValue = texture2D(uAudioTexture, vec2(normAngle / uAudioZoom, 0.0)).r * uAudioStrength;
    dist -= audioValue;


    //if (dist < radius) { // fill
    if (dist > uRadius - thickness && dist < uRadius) { // Line
        diffuseColor = vec4(1.0, 0.0, 0.0, 1.0);
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