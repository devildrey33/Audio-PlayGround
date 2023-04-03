//uniform float     uTime;
//uniform vec2      uResolution;
uniform float     uSize;
uniform float     uAlpha;
uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uAudioZoom;
varying vec2      vUv; // Coordenadas UV del fragmento

/*float getTextureRow(float x) {
  return floor(x * 32.0);
}

float getTextureCol(float x) {
  return (mod(x * 32.0, 32.0));
}*/

void main() {

//    float pos = vUv.x * ((1023.0) / 32.0) ;
//    float tx = (mod(pos, 32.0));
//    float ty = (pos / 32.0);
//    float audioValue = texture2D(uAudioTexture, vec2(tx, ty)).g;

    

    
/*    float idx = vUv.x * 32.0; // índice correspondiente al valor
    float row2 = idx / 32.0; // fila correspondiente al índice
    float col2 = mod(idx, 32.0); // columna correspondiente al índice
    float audioValue = texture2D(uAudioTexture, vec2(row2, col2)).g;*/

/*
    float row = getTextureRow(vUv.x);
    float col = getTextureCol(vUv.x);
    float audioValue = texture2D(uAudioTexture, vec2(col / 32.0, row / 32.0)).g;*/

//    float audioValue = texture2D(uAudioTexture, vec2(vUv.x, mod(vUv.x, 32.0))).g;
    float audioValue = ((texture2D(uAudioTexture, vec2(vUv.x / uAudioZoom, 0.0)).g - .5) * uAudioStrength) + .5;

    if (abs(vUv.y - audioValue) < uSize) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    } 
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
}

/*
void main() {
  float threshold = 0.5; // Umbral a partir del cual se dibuja la línea
  float value = texture2D(uAudioTexture, vUv).g; // Valor de la textura en las coordenadas actuales
  
  // Escala el valor de la textura a un rango de 0 a 1, donde 1 es la altura máxima de la línea del osciloscopio
  float scaledValue = value;

  // Calcula la altura máxima de la línea del osciloscopio como la mitad del alto de la textura
  float maxHeight = 0.5 / 32.0;

  // Calcula la posición vertical de la línea del osciloscopio como la altura máxima multiplicada por el valor de la textura
  float yPosition = maxHeight * scaledValue;

  // Calcula la posición horizontal de la línea del osciloscopio como el valor normalizado del tiempo, multiplicado por el ancho de la textura
  float xPosition = mod(uTime, 1.0) * 32.0;

  // Define el ancho de la línea del osciloscopio en píxeles
  float lineWidth = 1.0;

  // Calcula la distancia del fragmento actual a la línea del osciloscopio
  float distance = abs(vUv.x * 32.0 - xPosition);

  // Dibuja la línea del osciloscopio si el fragmento actual se encuentra a una distancia menor o igual al ancho de la línea
  if (distance <= lineWidth) {
    // Dibuja la línea en blanco
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  } else {
    // Dibuja el fondo en negro
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}*/
/*
float getTextureRow(float x) {
  return floor(x * 32.0);
}

float getTextureCol(float x) {
  return floor(mod(x * 32.0, 32.0));
}

float getAudioHeight(sampler2D audioTexture, vec2 uv) {
  float row = getTextureRow(uv.x);
  float col = getTextureCol(uv.x);
  vec4 texel = texture2D(audioTexture, vec2(col / 32.0, row / 32.0));
  float audioValue = texel.g * 255.0 + texel.r;
  float height = audioValue / 255.0;
  return height * 2.0 - 1.0;
}

void main() {
//  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float audioHeight = getAudioHeight(uAudioTexture, vUv);
  float y = audioHeight;
  float x = vUv.x * 2.0 - 1.0;

  float lineY = 0.0;
  float lineWidth = 0.01;

  if (abs(y) < lineWidth) {
    lineY = mix(-1.0, 1.0, (abs(y) - lineWidth) / (2.0 * lineWidth));
  }

  vec3 color = vec3(1.0, 1.0, 1.0);
  if (lineY == gl_FragCoord.y) {
    color = vec3(0.0, 0.0, 0.0);
  }

  gl_FragColor = vec4(color, 1.0);
}*/