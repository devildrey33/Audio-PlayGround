uniform sampler2D uAudioTexture;
uniform float uTime;
uniform float uAudioStrength;
uniform float uAudioZoom;


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



    float audioValue = 0.0;
    float zoom = 1.0 - (1.0 / uAudioZoom);
    if (uv.x > 0.001 && uv.x < 0.999 && uv.y > 0.001 && uv.y < 0.999)  {
        audioValue = abs((texture2D(uAudioTexture, vec2(uv.x / uAudioZoom, uv.y / uAudioZoom)).r) * uAudioStrength);
    }
    // On the edges of the shape use a medium value 
    else {
        audioValue = abs((texture2D(uAudioTexture, vec2(0.5, uv.y / uAudioZoom)).r) * uAudioStrength);
    }

    transformed.z = transformed.z + (transformed.z * audioValue);
    transformed.x = transformed.x + (transformed.x * audioValue);
    transformed.y = transformed.y + (transformed.y * audioValue);





	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}