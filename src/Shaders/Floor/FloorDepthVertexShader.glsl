uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uTime;


#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>

//vec4 audioValue = vec4(1.0);
    vec4 audioValue = texture2D(uAudioTexture, vec2(aId, 0.0));

    if (uv.y > 0.5) {
        // Add the red channel intensity to the Y of the model
        transformed.y +=  audioValue.r * uAudioStrength;
    }
    else {
        transformed.y -=  audioValue.r * uAudioStrength;
    }
    

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}
