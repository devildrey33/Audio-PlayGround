uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uAudioZoom;
uniform float     uFrequency;
uniform float     uSpeed;
uniform float     uThickness;
uniform float     uAudioStrengthSin;
uniform float     uAudioZoomSin;
uniform float     uFrequencySin;
uniform float     uSpeedSin;
uniform float     uThicknessSin;
uniform float     uTime;
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



    float audioX = 0.0;
    // adapt audio position to be 0.0 => 1.0 => 0.0
    // So when x is below 0.5 use vUv * 2, else invert the position
    if (vUv.x < 0.5) audioX = vUv.x * 2.0;
    else             audioX = 1.0 - ((vUv.x  - 0.5) * 2.0);

    float audioValue = ((texture2D(uAudioTexture, vec2((audioX / uAudioZoom), 0.0)).r) * uAudioStrength) * uFrequency;
    //float audioValue = (((texture2D(uAudioTexture, vec2(audioX / uAudioZoom, 0.0)).g - 0.5) * 0.55) * uAudioStrength) * uFrequency;

    diffuseColor = vec4(0.0, 0.0, 0.0, 0.0);

    // Bars spiral
    vec2 nPos = vec2(vUv.x, vUv.y + (vUv.x * uFrequency) - mod(uTime * uSpeed, 1.0) - audioValue);
    float p = mod(nPos.y, uFrequency);

    // Oscyloscope spiral
    float audioValueSin = (((texture2D(uAudioTexture, vec2(audioX / uAudioZoomSin, 0.0)).g - 0.5) * 0.55) * uAudioStrength) * uFrequency;

    vec2 nPosSin = vec2(vUv.x, vUv.y + (vUv.x * uFrequencySin) - mod(uTime * uSpeedSin, 1.0) - audioValueSin);
    float pSin = mod(nPosSin.y, uFrequencySin);

    if (p < (uFrequency * uThickness)) {
        diffuseColor = vec4(0.0, 0.3, 0.1, smoothstep(0.0, uFrequency * uThickness, p));
    }

    else if (pSin < (uFrequencySin * uThicknessSin)) {
        diffuseColor = vec4(1.0, 1.0, 1.0, 0.8);
    }
    else {
//        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.8);
        discard;
    }
/*    float audioX = 0.0;
    if (vUv.x < 0.5) {
        audioX = vUv.x * 2.0;
    }
    else {
        audioX = 1.0 - ((vUv.x  - 0.5) * 2.0);
    }


    //float audioValue = ((texture2D(uAudioTexture, vec2((audioX / uAudioZoom), 0.0)).r) * uAudioStrength) * uFrequency;
    float audioValue = (((texture2D(uAudioTexture, vec2(audioX / uAudioZoom, 0.0)).g - 0.5) * 0.55) * uAudioStrength) * uFrequency;

    vec2 nPos = vec2(vUv.x, vUv.y + (vUv.x * uFrequency) - mod(uTime * uSpeed, 1.0) - audioValue);
    float p = mod(nPos.y, uFrequency);
    if (p < (uFrequency * uThickness)) {
        diffuseColor = vec4(1.0, 1.0, 0.0, 0.8);
    }
    else {
        discard;
    }*/




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