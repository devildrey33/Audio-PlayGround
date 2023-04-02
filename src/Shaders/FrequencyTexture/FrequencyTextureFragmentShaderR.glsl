uniform sampler2D uAudioTexture;
varying vec2      vUv; // Coordenadas UV del fragmento
/* second Attempt to pass a 1024*1 texture to 32*32
void main() {
  // Escala las coordenadas de textura de 0-1 a 0-32
  vec2 scaledUV = vUv * vec2(32.0, 32.0);

  // Redondea las coordenadas a los valores más cercanos en un espacio discreto de 32x32
  vec2 discreteUV = floor(scaledUV + 0.5) / vec2(32.0, 32.0);

  // Escala las coordenadas de textura de 0-32 a 0-1 para muestrear la textura original
  vec2 sampledUV = discreteUV / vec2(1024.0, 1.0);

  // Obtener el color de la textura original en las coordenadas transformadas
  vec4 color = texture2D(uAudioTexture, sampledUV);

  // Asignar el color al fragmento actual
  gl_FragColor = color;
}*/


void main() {
    // Attempt to pass a 1024*1 texture to 32*32
/*    float textureSize = 32.0;
    vec2 uv = vUv * vec2(textureSize);
    uv = (uv + 0.5) / textureSize;    
    float color = texture2D(uAudioTexture, uv).r;*/

    float color = texture2D(uAudioTexture, vUv).r;
    gl_FragColor = vec4(color, 0.0, 0.0, 1.0);
}