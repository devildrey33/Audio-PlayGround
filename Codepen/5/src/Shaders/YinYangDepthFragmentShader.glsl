uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uAudioZoom;
uniform float     uTime;
uniform vec3      uColor;
uniform vec3      uColor2;
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



    // Center of the plane
    vec2 center = vec2(0.5, 0.5);

    // Calculate rotation matrix based on uTime (do 16 cycles and then reverse)
    float angle = sin(uTime * 0.000075) * 32.0 * PI;  // 2pi radiants are 360deg, so whe are rotating 16 times
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    // Translate coordinates to the center of the object
    vec2 translated = vUv - center;
    // Rotate coordinates
    vec2 rotated = rotation * translated;    
    // Translate coordinates to their original position
    vec2 finalCoords = rotated + center;

    // yin yang circle radius
    float radius = 0.25;
    // Base color
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);


    float dist = length(finalCoords - center);
    // get angle in rads of current position from center
    float rad = atan(finalCoords.y - center.y, finalCoords.x - center.x);
    float normAngle = 0.0;

    // Divide the circle into two halfs and make a mirror 
    // I use linear audio textute form 0 to 1 in one half and in the other half i use the audio texture from 1 to 0.
    if (rad < 0.0) {
        normAngle = ((rad + PI) / PI);
    } else {
        normAngle = (((rad - PI) / PI));
    }

    normAngle = mod(normAngle + uTime * 0.25, 1.0);
    
    // Use the audio texture to obtain the radius based in the angle
    float audioValue = (texture2D(uAudioTexture, vec2(normAngle / uAudioZoom, 0.0)).g - 0.5) * 0.5 * uAudioStrength;
    dist -= audioValue;

    if (dist < radius) { // fill
    //if (dist > radius - 0.3 && dist < radius) { // Line
        if (rad >= 0.0) {
            color = vec4(uColor, 1.0);
        }
        else {
            color = vec4(uColor2, 1.0);
        }
    } 

    


    diffuseColor = color;
//    gl_FragColor = vec4(color.r);
    if (color.a == 0.0) discard;



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