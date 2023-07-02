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
    if (uv.x > 0.001 && uv.x < 0.999 && uv.y > 0.001 && uv.y < 0.999)  {
        audioValue = ((texture2D(uAudioTexture, vec2(uv.x * uAudioZoom, uv.y * uAudioZoom)).g - 0.5) * 0.55) * uAudioStrength;
    }
    // On the edges of the shape use a medium value 
    else {
        audioValue = ((texture2D(uAudioTexture, vec2(0.0, uv.y * uAudioZoom)).g - 0.5) * 0.55) * uAudioStrength;
    }

    transformed.z = transformed.z + (transformed.z * audioValue * uAudioStrength);
    transformed.x = transformed.x + (transformed.x * audioValue * uAudioStrength);
    transformed.y = transformed.y + (transformed.y * audioValue * uAudioStrength);





	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}