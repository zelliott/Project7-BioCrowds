varying vec3 vNormal;
varying float noise;
uniform sampler2D image;


void main() {
  vec3 color = vec3(0.0, 0.0, 0.0);
  gl_FragColor = vec4( color, 1.0 );
}