
varying vec2  vUv;
varying float vAudioValue;

vec4 drawLine(vec2 start, vec2 end, float width, vec3 color) {
    vec2 dir = normalize(end - start);
    vec2 offset = vec2(-dir.y, dir.x) * width / 2.0;
    vec2 p1 = start + offset;
    vec2 p2 = end + offset;
    vec2 p3 = end - offset;
    vec2 p4 = start - offset;
    vec4 newColor = vec4(color, 1.0);
//    gl_FragColor = vec4(color, 1.0);
    newColor *= step(0.0, dot(p1 - vUv, dir)) * step(dot(p2 - vUv, dir), 0.0);
    newColor *= step(0.0, dot(p3 - vUv, dir)) * step(dot(p4 - vUv, dir), 0.0);
    return newColor;
}

void main() {
//    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
//    float strength = 0.05 / distanceToCenter - 0.1;
    float lineWidth = 1.0;
    
    float gridLineSize = 0.05;
    vec2 uv = vUv * vec2(32.0, 32.0) - gridLineSize * 0.5; // Escala la posición para crear una cuadrícula de 32x32
    vec4 color = vec4(0.0, 0.0, 0.5, 1.0); // Establece el color de la cuadrícula en blanco

    float lineOffset = lineWidth / 2.0;

    float gridLineStrength = step(1.0 - gridLineSize, mod(uv.x, 1.0));
    gridLineStrength += step(1.0 - gridLineSize, mod(uv.y, 1.0));

    color.b = gridLineStrength  + vAudioValue * .125;
//    color.a = gridLineStrength;

    // Dibuja la cuadrícula
/*    if (mod(uv.x, lineWidth) < lineOffset || mod(uv.y, lineWidth) < lineOffset) { // Dibuja una línea principal
        color = vec3(0.0);
    } else if (mod(uv.x, lineWidth) > lineWidth - lineOffset || mod(uv.y, lineWidth) > lineWidth - lineOffset) { // Dibuja una línea secundaria
        color = vec3(0.8);
    }*/
/*
    for (float i = 0.0; i < 32.0; i++) {
        gl_FragColor = drawLine(step(1.0, uv) / 32.0, (uv + 1.0) / 32.0, 0.5, vec3(1.0, 0.0, 0.0));
    }*/


  // Dibuja la línea adicional
/*  if ((vUv.y > 0.98 && vUv.x < 0.02) || (vUv.y < 0.02 && vUv.x > 0.98)) {
    color = vec3(0.8, 0.8, 0.8);
  }*/

    gl_FragColor = color; // Establece el color del fragmento
}