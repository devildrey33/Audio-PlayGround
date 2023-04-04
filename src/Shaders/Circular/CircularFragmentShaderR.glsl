uniform sampler2D uAudioTexture;
uniform float     uAudioStrength;
uniform float     uSize;
varying vec2      vUv;

#define PI   3.14159265
#define TAU  PI * 2.0

void main() {
    float radius    = 0.2;
    float thickness = uSize;
    float space     = 0.5 - (thickness * 2.0) - radius;
    vec2  center    = vec2(vUv.x - 0.65, vUv.y - 0.5);
    float dist      = length(center);

    float rad = atan(vUv.y - 0.5, vUv.x - 0.5);
    // normalize angle 0 to 1    
    float normAngle = 0.0;
    // rad its greater than 0
    if (rad < 0.0) {
        normAngle = (rad + PI) / PI;
    }
    // rad its below 0
    else {
        // Invert the normalized angle        
        normAngle = 1.0 - (1.0 + ((rad - PI) / PI));
    }
 
    // Get the audio value from linear audio data texture (1024*1)
    // Red channel has the frequency that starts from 0 to 1
    float audioValue = texture2D(uAudioTexture, vec2(normAngle, 0.0)).r; 
    dist -= audioValue * uAudioStrength;

    if (dist > radius - thickness && dist < radius) {
        gl_FragColor = vec4(0.75, 0.0, 0.0, 1.0);
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}


/* Simple version */
/*void main() {
    float radius    = 0.25;
    float thickness = 0.03;
    vec2  center    = vUv - 0.5;
    float dist      = length(center);

    float audioValue = texture2D(uAudioTexture, vec2(vUv.x * radius, 0.5)).r; // Obtiene el valor del canal rojo de la textura
    dist -= audioValue * radius;

    if (dist > radius - thickness && dist < radius) {
        gl_FragColor = vec4(0.75, 0.0, 0.0, 1.0);
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}*/


/*void main() {
  float radius = 0.125;
  float thickness = 0.01;
  vec2 position = vUv - 0.5;
  float distance = length(position);
  float alpha = smoothstep(radius - thickness, radius, distance);
  alpha -= smoothstep(radius, radius + thickness, distance);

  float audioValue = texture2D(uAudioTexture, vec2(vUv.x, 0.5)).r; // Obtiene el valor del canal rojo de la textura
  float angle = (vUv.x - 0.5) * 180.0; // Calcula el ángulo a partir de la posición del fragmento

  // Aplica la deformación al círculo
  if (angle >= 0.0 && angle <= 180.0) {
    float deformation = 1.0 + audioValue * -1.0; // Define el factor de deformación
    position *= deformation; // Aplica la deformación
  }

  // Calcula la nueva distancia y alpha
  distance = length(position);
  alpha = smoothstep(radius - thickness, radius, distance);
  alpha -= smoothstep(radius, radius + thickness, distance);

  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}*/




/*
void main() {
  float radius = 0.25;
  float thickness = 0.01;
  vec2 position = vUv - 0.5;
  float distance = length(position);
  
  float alpha = smoothstep(radius - thickness, radius, distance);
  alpha -= smoothstep(radius, radius + thickness, distance);
  
  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}







/*
void main() {
  vec2 st = vUv;
  vec2 pos = vec2(0.5, 0.5);
  float radius = 0.5;
  float thickness = 0.4;
  float centerRadius = 0.2;
  
  float dist = length(st - pos);
  
  float angle = atan(st.y - pos.y, st.x - pos.x);
  float pct = (angle + 3.14159265) / 3.14159265;

  if (dist > radius - thickness && dist < radius) {
    
    // Limitar el ángulo a la mitad del círculo
    if (angle > 0.0) {
      angle = min(angle, 3.14159265);
    } else {
      angle = max(angle, -3.14159265);
    }
    
    // Usar la textura para obtener el radio basado en el ángulo
    float gradientValue = texture2D(uAudioTexture, vec2(pct, 0.5)).r;
    float newRadius = mix(radius - thickness, radius, gradientValue);
    
    if (dist < newRadius) {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
      discard;
    }
  } else if (dist < centerRadius) {
    // Usar la textura para obtener el radio del centro
    float gradientValue = texture2D(uAudioTexture, vec2(pct, 0.5)).r;
//    float newRadius = mix(centerRadius, 0.0, gradientValue);
    float newRadius = centerRadius - (gradientValue * 0.5);
    
    if (dist < newRadius) {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
      discard;
    }
  } else if (dist < radius - thickness) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    discard;
  }
}
*/