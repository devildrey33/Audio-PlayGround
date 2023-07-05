uniform sampler2D uAudioTexture;
uniform float uTime;
uniform float uAudioStrength;
uniform float uAudioZoom;

varying vec2 vUv;

#define PI 3.14159265358979323846
float uThickness = 0.001;
float uRadius = 0.025;

void main() {
    vec2 center = vec2(0.5, 0.5);
    // Transforma las coordenadas de textura
/*    mat3 rotationMatrix = mat3(
        cos(0.785398), -sin(0.785398), 0.0,
        sin(0.785398), cos(0.785398), 0.0,
        0.0, 0.0, 1.0
    );
    // Rotated uv
    vec2 ruv = (rotationMatrix * vec3(vUv.xy, 1.0)).xy;*/

	vec2 uv = (vUv.xy - 0.5);
    
    float dist = length(vUv - center);

    // get angle in rads of current position from center
    float rad = atan(vUv.x - center.y, vUv.y - center.x);
    float normAngle = 0.0;

    // Divide the circle into two halfs and make a mirror 
    // I use linear audio textute form 0 to 1 in one half and in the other half i use the audio texture from 1 to 0.
    if (rad < 0.0) {
        normAngle = (rad + PI) / PI;
    } else {
//        normAngle = (rad + PI) / PI;
        normAngle = 1.0 - (1.0 + ((rad - PI) / PI));
    }
    float zoom = 1.0 - (1.0 / uAudioZoom);
//    float audioValue = ((texture2D(uAudioTexture, vec2(zoom + (uv.x / uAudioZoom), zoom + (uv.y / uAudioZoom))).g - 0.5)) * uAudioStrength;
    float audioValue = ((texture2D(uAudioTexture, vec2(zoom + (normAngle / uAudioZoom), 0.0)).r) * uAudioStrength);
//    float audioValue = texture2D(uAudioTexture, vec2(normAngle, 0.0)).r;


	float r = length(uv);
    float theta = atan(uv.y, uv.x);   
    vec3 col = vec3(0.0);
    if (fract(2.5 * theta / PI + 7.0 * pow(r, 0.4) - 2.5 * uTime)* audioValue > 0.5) {
        gl_FragColor = vec4(vec3(0.0, cos((1.0 - dist) * uTime), 1.0), (1.0 - dist));
    }
    else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, cos((1.0 - dist) * -uTime * 2.5));
    }
    if (vUv.x > 0.995 || vUv.x < 0.005 ) {
        gl_FragColor = vec4(vec3(0.0, cos((1.0 - dist) * uTime), 1.0), (1.0 - dist));;
    }
//    gl_FragColor = vec4(col, 1.0 - dist);
}

/*
#define PI 3.14159265358979323846
#define e  2.71828182845904523


void main() {
    float dis=.5;
    float width=.1;
    float blur=.1;

    vec2 uv = 0.5 - vUv ;
    vec2 pos = vec2(0.5 *(vUv.x / vUv.y),.5);
    uv.x = (vUv.x / vUv.y) * uv.x; 

    uv*=10.;
    pos*=10.;    

    vec3 col;
    vec3 lineColor=vec3(.5,0.2,0.4);
    //left top
    if((uv.x<uv.x*.5)&&(uv.y>uv.y*.5)){
        vec2 o=uv+vec2(.5*pos.x,-0.5*pos.y);
        float angle=atan(o.y,o.x);
        float l=length(o);
        float offset=l+(angle/(2.*PI))*dis;
        float circles=mod(offset-uTime,dis);
        col=(smoothstep(circles-blur,circles,width)-smoothstep(circles,circles+blur,width))*lineColor;
    }    
//right top
    if((uv.x>=uv.x*.5)&&(uv.y>uv.y*.5)){
        vec2 o=uv+vec2(-0.5*pos.x,-0.5*pos.y);
        float angle=atan(o.y,o.x);
        float l=length(o);
        float offset=abs(o.x)+abs(o.y)+(angle/(2.*PI))*dis;
        float circles=mod(offset-uTime,dis);
        col=(smoothstep(circles-blur,circles,width)-smoothstep(circles,circles+blur,width))*lineColor;
    }
    //left bottom
    if((uv.x<uv.x*.5)&&(uv.y<uv.y*.5))
    {
        vec2 o=uv+vec2(0.5*pos.x,0.5*pos.y);
        float angle=atan(o.y,o.x);
        float l=length(o);
        float offset=(log(l)+(angle/(2.*PI))*dis);
        float circles=mod(offset-uTime,dis);
        col=(smoothstep(circles-blur,circles,width)-smoothstep(circles,circles+blur,width))*lineColor;
    }
    //right bottom
   if((uv.x>=uv.x*.5)&&(uv.y<uv.y*.5))
    {
     	vec2 o=uv+vec2(-0.5*pos.x,0.5*pos.y);
        float angle=atan(o.y,o.x);
        float l=length(o);
        float offset=(log(l)/log(e*5.)+(angle/(2.*PI))*dis);
        float circles=mod(offset-uTime,dis);
        col=(smoothstep(circles-blur,circles,width)-smoothstep(circles,circles+blur,width))*lineColor;   
    }

    float hl=smoothstep(0.01,0.03,abs(uv.x-uv.x*.5));
    float vl=smoothstep(0.01,0.03,abs(uv.y-uv.y*.5));
    //x×(1−a)+y×a.
    col=mix(vec3(1,1,0),col,hl);
    col=mix(vec3(1,1,0),col,vl);

    gl_FragColor = vec4(col, 1.0);  
}

*/
/*
void main() {
    // Add the audio frequency
    float zoom = 1.0 - (1.0 / uAudioZoom);
//    float audioValue = abs((texture2D(uAudioTexture, vec2(zoom + (vUv.x / uAudioZoom), zoom + (vUv.y / uAudioZoom))).g - 0.5) * 0.55) * uAudioStrength;
    float audioValue = texture2D(uAudioTexture, vec2(vUv.x, 0.0)).r * 0.25;

    // Create a polar coordinate from the center of the screen
    vec2 polar = (vUv - 0.5) * 2.0;
    float radius = length(polar) * 1.0;
    float angle = atan(polar.y, polar.x);
//    float angle = atan(polar.y + audioValue * 2.0, polar.x + audioValue * 2.0);

    // Calculate the height of the tornado
    float height = abs(sin(radius * 30.0 - uTime * 3.0) * 0.3 + cos(angle * 10.0 + uTime * 5.0) * 0.1);

    // Calculate the distance from the center of the tornado
    float distance = pow(radius, 2.0) * 5.0;

    // Calculate the rotation of the tornado
    float rotation = uTime * 3.0 - radius * 10.0;

    // Transform polar coordinates to Cartesian coordinates
    vec2 cartesian = vec2(cos(angle), sin(angle)) * (distance + height * 5.0);


    // Apply rotation to the direction vector
    vec2 rotated = vec2(
      cartesian.x * cos(rotation) - cartesian.y * sin(rotation),
      cartesian.x * sin(rotation) + cartesian.y * cos(rotation)
    );

    // Apply manga-style drawing to the tornado
    float thickness = pow(smoothstep(0.0, 0.1, 1.0 - height), 0.5) * 0.05;
    float line = pow(smoothstep(0.0, thickness, 1.0 - abs(rotated.y)), 10.0);
    float edge = smoothstep(0.0, thickness * 2.0, abs(rotated.x) - 0.5 + thickness);

    // Add a dot pattern to simulate shading
    float dotSize = smoothstep(0.0, 0.1, height) * 0.03;
    float dots = fract(length(rotated * 5.0) * 10.0);
    

    // Apply color and shading to the tornado
    vec3 color = vec3(1.0, 0.4 + height, 0.1) * line * edge;
    color += vec3(1.0, 0.8, 0.2) * dots * height * thickness;


    // Apply color to the pixel
    gl_FragColor = vec4(color, line * edge);    
}*/