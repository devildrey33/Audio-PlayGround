// Vertex shader
varying vec2 vUv;

void main() {
  // Transform the vertex position to clip space
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  
  // Pass the UV coordinates to the fragment shader
  vUv = uv;
  
  // Calculate the vector from the vertex position to the camera position
  vec3 cameraDirection = cameraPosition - modelMatrix[3].xyz;
  
  // Calculate the angle between the camera direction and the vertex normal
  float angle = dot(normal, normalize(cameraDirection));
  
  // Rotate the vertex position around the normal to face the camera
  vec3 rotatedPosition = position + normal * angle * length(cameraDirection);
  
  // Set the transformed position as the final position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(rotatedPosition, 1.0);
}