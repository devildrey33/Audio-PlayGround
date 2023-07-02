
uniform sampler2D uAudioTexture;
uniform float uTime;
uniform float uAudioStrength;
uniform float uAudioZoom;
varying vec2  vUv;


/* 
 * Three.js globals
 */
#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

/*  * Three.js main
 */
void main() {
    #include <uv_vertex>
    #include <color_vertex>
    #include <morphcolor_vertex>
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    #include <normal_vertex>
    #include <begin_vertex>


    float audioValue = 0.0;
    float zoom = 1.0 - (1.0 / uAudioZoom);
    if (uv.x > 0.001 && uv.x < 0.999 && uv.y > 0.001 && uv.y < 0.999)  {
        audioValue = abs((texture2D(uAudioTexture, vec2(zoom + (uv.x / uAudioZoom), zoom + (uv.y / uAudioZoom))).g - 0.5) * 0.55) * uAudioStrength;
    }
    // On the edges of the shape use a medium value 
    else {
        audioValue = abs((texture2D(uAudioTexture, vec2(1.0, zoom + (uv.y / uAudioZoom))).g - 0.5) * 0.55) * uAudioStrength;
    }

    transformed.z = transformed.z + (transformed.z * audioValue * uAudioStrength);
    transformed.x = transformed.x + (transformed.x * audioValue * uAudioStrength);
    transformed.y = transformed.y + (transformed.y * audioValue * uAudioStrength);

    vUv = uv;


    /*
     * Three.js main end
     */


    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    vViewPosition = - mvPosition.xyz;
    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
  #ifdef USE_TRANSMISSION
    vWorldPosition = worldPosition.xyz;
  #endif
}

