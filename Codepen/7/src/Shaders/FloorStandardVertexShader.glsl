/* 
 * Perlin noise audio floor globals
 */
uniform sampler2D uAudioTexture;
//uniform float uTime;
uniform float uAudioStrength;
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

/* 
 * Three.js main
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

    // Audio value on Y axis
    vec4 textureColor = texture2D(uAudioTexture, uv);
    transformed.z += textureColor.r * uAudioStrength;

    vUv = uv;

    // Perlin noise displacement
/*    vec2 displacement = uv + cnoise(vec3(uv * .3, uTime * 0.0001)) * 1.0;
    float strength = cnoise(vec3(displacement, uTime *0.0004));
    transformed.x += strength;
    transformed.y += strength;*/

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


