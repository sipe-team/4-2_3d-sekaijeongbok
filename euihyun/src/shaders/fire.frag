uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 center = vec2(0.5, 0.5);
  vec2 pos = vUv - center;
  
  float dist = length(pos);
  float angle = atan(pos.y, pos.x);
  
  // Fire parameters - much smaller to match 3D sun core
  float sunRadius = 0.1;
  float maxFlameRadius = 0.5;
  
  // Slow time
  float slowTime = time * 0.5;
  
  // Petal-shaped flames
  float petalCount = 8.0;
  float petalShape = sin(angle * petalCount + slowTime * 2.0) * 0.5 + 0.5;
  petalShape = pow(petalShape, 0.5); // Softer, thicker petal edges
  
  // Add gentle variation
  float variation = sin(angle * petalCount * 2.0 + slowTime * 1.5) * 0.2 + 0.8;
  petalShape *= variation;
  
  float flameRadius = sunRadius + 0.02 + petalShape * 0.03;
  
  // Simple intensity
  float intensity = smoothstep(sunRadius, sunRadius + 0.01, dist) * 
                   (1.0 - smoothstep(flameRadius, maxFlameRadius, dist));
  
  // Add flickering flame effect
  float flicker1 = sin(slowTime * 4.0 + angle * 5.0) * 0.2 + 0.8;
  float flicker2 = sin(slowTime * 6.0 + angle * 3.0) * 0.15 + 0.85;
  float flicker3 = sin(slowTime * 8.0 + dist * 20.0) * 0.1 + 0.9;
  
  intensity *= flicker1 * flicker2 * flicker3;
  
  // Simple colors
  vec3 orange = vec3(1.0, 0.5, 0.0);
  vec3 red = vec3(1.0, 0.2, 0.0);
  
  vec3 fireColor = mix(red, orange, intensity);
  
  vec3 color = fireColor * intensity;
  
  gl_FragColor = vec4(color, 1.0);
}