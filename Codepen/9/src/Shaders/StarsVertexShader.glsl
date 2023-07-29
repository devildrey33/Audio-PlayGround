uniform float uPixelRatio;
uniform float uTime;
uniform float uSize;
uniform float uAudioStrength;

attribute float aSpeed;
attribute float aRadius;
attribute float aAngle;

void main() {
    vec4 modelPosition      = modelMatrix       * vec4(position , 1.0);

    // Position of the star
    modelPosition.z = 60.0 - mod(uTime * aSpeed, 70.0);
//    modelPosition.z = reciprocal_mod(abs(modelPosition.z), 60.0);

    modelPosition.x = cos(aAngle + (uTime * (aSpeed + uAudioStrength * 5.0) * 0.02)) * aRadius;
    modelPosition.y = sin(aAngle + (uTime * (aSpeed + uAudioStrength * 5.0) * 0.02)) * aRadius;

    vec4 viewPosition       = viewMatrix        * modelPosition;
    vec4 projectionPosition = projectionMatrix  * viewPosition;
//projectionPosition.z = 60.0 - uTime;

    gl_Position = projectionPosition;

    // Adapt point size to pixel ratio and random scale
    gl_PointSize = uSize * 0.25 * uPixelRatio; // * (uAudioStrength * 10.0) ;

    // Size attenuation
    gl_PointSize *= (1.0 / - viewPosition.z);
//    gl_PointSize = uSize;
}