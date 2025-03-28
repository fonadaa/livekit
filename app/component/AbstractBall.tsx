"use client"

import type React from "react"

import * as THREE from "three"
import { useEffect, useRef } from "react"

interface AbstractBallProps {
  perlinTime: number
  chromaRGBr: number
  chromaRGBg: number
  chromaRGBb: number
  state: string
}

// Define shaders as constants
const vertexShader = `
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float time;
  uniform float weight;
  uniform float morph;
  uniform float psize;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 1.2 * n_xyz;
  }

  void main() {
    float f = morph * cnoise(normal + time);
    vNormal = normalize(normal);
    vUv = uv;
    vec4 pos = vec4(position + f * normal, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * pos;
    gl_PointSize = psize;
  }
`

// Update the fragment shader to include texture mapping for the logo
const fragmentShader = `
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float time;
  uniform float RGBr;
  uniform float RGBg;
  uniform float RGBb;
  uniform float RGBn;
  uniform float RGBm;
  uniform float dnoise;
  uniform vec3 baseColor;
  uniform float isSpeaking;
  uniform float isDisconnected;
  uniform float isThinking;
  uniform sampler2D logoTexture;
  uniform float hasLogo;
  uniform float opacity;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;
    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);
    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.x);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);
    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }

  void main() {
    vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);

    // Update color palette to remove pink and use more beautiful colors
    vec3 emeraldGreen = vec3(0.314, 0.784, 0.471);    // #50C878
    vec3 skyBlue = vec3(0.529, 0.808, 0.922);         // #87CEEB
    vec3 deepTeal = vec3(0.000, 0.502, 0.502);        // #008080
    vec3 lightGreen = vec3(0.502, 0.780, 0.627);      // #80C7A0
    vec3 oceanBlue = vec3(0.373, 0.620, 0.627);       // #5F9EA0
    vec3 silverGray = vec3(0.753, 0.753, 0.753);      // #C0C0C0
    
    // Enhanced gradient calculation
    float heightGradient = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
    float sphericalGradient = dot(normalize(vNormal), normalize(vec3(1.0, 1.0, 1.0)));
    
    // Create more complex color mixing
    vec3 color;
    
    if (isDisconnected > 0.5 && hasLogo > 0.5) {
        // For disconnected state with logo
        
        // Calculate spherical coordinates for better logo mapping
        float phi = atan(vNormal.z, vNormal.x);
        float theta = acos(vNormal.y);
        
        // Map spherical coordinates to UV coordinates for logo projection
        vec2 logoUV = vec2(
            0.5 + phi / (2.0 * 3.14159),
            1.0 - theta / 3.14159
        );
        
        // Rotate the logo based on time
        float rotationSpeed = time * 0.5;
        float s = sin(rotationSpeed);
        float c = cos(rotationSpeed);
        vec2 rotatedUV = vec2(
            0.5 + (logoUV.x - 0.5) * c - (logoUV.y - 0.5) * s,
            0.5 + (logoUV.x - 0.5) * s + (logoUV.y - 0.5) * c
        );
        
        // Sample the logo texture
        vec4 logoColor = texture2D(logoTexture, rotatedUV);
        
        // Only show logo on the front hemisphere
        float frontFacing = dot(vNormal, vec3(0.0, 0.0, 1.0));
        float logoVisibility = smoothstep(-0.2, 0.3, frontFacing);
        
        // Create a base color for the ball
        vec3 baseColor;
        if (heightGradient > 0.6) {
            float t = (heightGradient - 0.6) * 2.5;
            baseColor = mix(silverGray, deepTeal, t);
        } else if (heightGradient > 0.4) {
            float t = (heightGradient - 0.4) * 5.0;
            baseColor = mix(emeraldGreen, silverGray, t);
        } else {
            float t = heightGradient * 2.5;
            baseColor = mix(oceanBlue, emeraldGreen, t);
        }
        
        // Add subtle pulsing effect
        float pulse = sin(time * 3.0) * 0.1 + 0.9;
        baseColor *= pulse;
        
        // Combine logo with base color
        color = mix(baseColor, logoColor.rgb, logoColor.a * logoVisibility);
        
        // Add rim lighting
        float rimPower = 2.0;
        float rimStrength = 0.7;
        float rimLight = pow(1.0 - max(dot(vNormal, viewDir), 0.0), rimPower) * rimStrength;
        color += vec3(rimLight);
        
    } else if (isSpeaking > 0.5) {
        float rotationTime = time * 6.0;
        
        // Create revolving pattern
        float angle = atan(vNormal.y, vNormal.x) + rotationTime;
        float radius = length(vNormal.xy);
        
        // Create multiple layers of revolving patterns
        float wave1 = sin(angle * 8.0 + rotationTime * 2.0) * 0.5 + 0.5;
        float wave2 = cos(angle * 6.0 - rotationTime * 1.5) * 0.5 + 0.5;
        float wave3 = sin(angle * 4.0 + rotationTime) * 0.5 + 0.5;
        
        // Add vertical movement
        float verticalWave = sin(vNormal.y * 10.0 + rotationTime) * 0.5 + 0.5;
        
        // Combine waves with depth variation
        float depthEffect = (vNormal.z + 1.0) * 0.5;
        float pattern = mix(
            mix(wave1, wave2, verticalWave),
            wave3,
            depthEffect
        );

        // Create dynamic color transitions
        vec3 color1 = mix(emeraldGreen, skyBlue, wave1);
        vec3 color2 = mix(deepTeal, lightGreen, wave2);
        vec3 color3 = mix(oceanBlue, emeraldGreen, wave3);
        
        // Combine colors with smooth transitions
        vec3 finalColor = mix(
            mix(color1, color2, pattern),
            color3,
            depthEffect
        );

        // Add depth and dimension
        float innerGlow = pow(1.0 - radius, 2.0) * 0.5;
        finalColor += vec3(innerGlow) * skyBlue * 0.3;
        
        // Add subtle shimmer
        float shimmer = sin(dot(vNormal, vec3(rotationTime * 3.0))) * 0.5 + 0.5;
        finalColor += vec3(shimmer * 0.1) * lightGreen;

        // Apply final color with smooth transition
        color = mix(color, finalColor, 0.9);
    } else if (isThinking > 0.5) {
        // For thinking state
        float rotationTime = time * 6.0;
        
        // Create revolving pattern
        float angle = atan(vNormal.y, vNormal.x) + rotationTime;
        float radius = length(vNormal.xy);
        
        // Create multiple layers of revolving patterns
        float wave1 = sin(angle * 8.0 + rotationTime * 2.0) * 0.5 + 0.5;
        float wave2 = cos(angle * 6.0 - rotationTime * 1.5) * 0.5 + 0.5;
        float wave3 = sin(angle * 4.0 + rotationTime) * 0.5 + 0.5;
        
        // Add vertical movement
        float verticalWave = sin(vNormal.y * 10.0 + rotationTime) * 0.5 + 0.5;
        
        // Combine waves with depth variation
        float depthEffect = (vNormal.z + 1.0) * 0.5;
        float pattern = mix(
            mix(wave1, wave2, verticalWave),
            wave3,
            depthEffect
        );

        // Create dynamic color transitions for thinking state - using purples and blues
        vec3 purpleColor = vec3(0.5, 0.0, 0.5);       // Purple
        vec3 lavenderColor = vec3(0.7, 0.5, 0.9);     // Lavender
        vec3 royalBlue = vec3(0.25, 0.41, 0.88);      // Royal Blue
        
        vec3 color1 = mix(purpleColor, lavenderColor, wave1);
        vec3 color2 = mix(royalBlue, deepTeal, wave2);
        vec3 color3 = mix(oceanBlue, purpleColor, wave3);
        
        // Combine colors with smooth transitions
        vec3 finalColor = mix(
            mix(color1, color2, pattern),
            color3,
            depthEffect
        );

        // Add depth and dimension
        float innerGlow = pow(1.0 - radius, 2.0) * 0.5;
        finalColor += vec3(innerGlow) * lavenderColor * 0.3;
        
        // Add subtle shimmer
        float shimmer = sin(dot(vNormal, vec3(rotationTime * 3.0))) * 0.5 + 0.5;
        finalColor += vec3(shimmer * 0.1) * royalBlue;

        // Apply final color with smooth transition
        color = finalColor;
    } else {
        // For non-speaking states, use the original gradient but without pink
        if (heightGradient > 0.6) {
            float t = (heightGradient - 0.6) * 2.5;
            color = mix(lightGreen, deepTeal, t);
        } else if (heightGradient > 0.4) {
            float t = (heightGradient - 0.4) * 5.0;
            color = mix(emeraldGreen, lightGreen, t);
        } else {
            float t = heightGradient * 2.5;
            color = mix(oceanBlue, emeraldGreen, t);
        }
    }

    // Enhanced 3D lighting
    float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
    color += vec3(1.0) * fresnel * 0.3; // Stronger rim light
    color *= diffuse * 0.7 + 0.3; // Softer diffuse lighting

    gl_FragColor = vec4(color, opacity);
  }
`

const AbstractBall: React.FC<AbstractBallProps> = ({ perlinTime, chromaRGBr, chromaRGBg, chromaRGBb, state }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const animationFrameId = useRef<number>()
  const blinkRef = useRef<boolean>(false)

  useEffect(() => {
    const currentRef = mountRef.current;
    if (!currentRef) return

    const scene = new THREE.Scene()

    // Update camera settings for better 3D perspective
    const camera = new THREE.PerspectiveCamera(
      35, // Wider FOV for better depth perception
      currentRef.clientWidth / currentRef.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 200
    camera.position.y = 30 // Slight angle for better 3D appearance
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: "highp",
    })
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    currentRef.appendChild(renderer.domElement)

    // Even higher resolution sphere
    const geometry = new THREE.SphereGeometry(
      35, // larger radius
      256, // maximum smoothness
      256, // maximum smoothness
    )

    // Load the Fonada logo texture
    const textureLoader = new THREE.TextureLoader()
    const logoTexture = textureLoader.load(
      "https://images.yourstory.com/cs/images/companies/Fonadalogo-1717149286235.jpg?fm=auto&ar=1:1&mode=fill&fill-color=fff",
    )

    // Set texture properties for better quality
    logoTexture.minFilter = THREE.LinearFilter
    logoTexture.magFilter = THREE.LinearFilter
    logoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()

    // Update uniforms for wave-like effects and add logo-related uniforms
    const uniforms = {
      time: { value: 0 },
      RGBr: { value: chromaRGBr / 15 },
      RGBg: { value: chromaRGBg / 15 },
      RGBb: { value: chromaRGBb / 15 },
      RGBn: { value: 0.05 },
      RGBm: { value: 0.1 },
      morph: { value: 1.0 },
      dnoise: { value: 0.1 },
      psize: { value: 1.0 },
      baseColor: { value: new THREE.Vector3(0.5, 0.8, 0.6) },
      isSpeaking: { value: 0.0 },
      isDisconnected: { value: 0.0 },
      isThinking: { value: 0.0 },
      logoTexture: { value: logoTexture },
      hasLogo: { value: 1.0 }, // Flag to indicate logo is available
      waveTime: { value: 0.0 }, // New uniform for wave effect
      opacity: { value: 1.0 },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.FrontSide,
      transparent: true,
      opacity: 1,
    })

    const mesh = new THREE.Mesh(geometry, material)

    // Update lighting setup for better 3D appearance
    const lights = [
      new THREE.DirectionalLight(0xffffff, 0.7),
      new THREE.PointLight(0xffffff, 0.5),
      new THREE.AmbientLight(0xffffff, 0.3),
    ]

    lights.forEach((light, i) => {
      if (light instanceof THREE.DirectionalLight) {
        light.position.set(Math.sin(i * Math.PI) * 100, 50, Math.cos(i * Math.PI) * 100)
      } else if (light instanceof THREE.PointLight) {
        light.position.set(100, 100, 100)
      }
      scene.add(light)
    })

    scene.add(mesh)

    // Add rotation state variables
    const rotationState = {
      current: new THREE.Vector3(0, 0, 0),
      target: new THREE.Vector3(0, 0, 0),
      timeoutId: null as NodeJS.Timeout | null,
    }

    // Function to generate new random rotation target
    const updateRotationTarget = () => {
      if (state === "speaking") {
        rotationState.target = new THREE.Vector3(
          (Math.random() - 0.5) * 0.015, // 3x faster for speaking
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.01,
        )

        // Shorter intervals during speaking
        rotationState.timeoutId = setTimeout(
          updateRotationTarget,
          Math.random() * 1000 + 500, // Faster direction changes
        )
      } else {
        rotationState.target = new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.002,
        )

        rotationState.timeoutId = setTimeout(updateRotationTarget, Math.random() * 3000 + 2000)
      }
    }

    // Initialize random rotation
    updateRotationTarget()

    // Add a variable to track blink timing
    let lastBlinkTime = 0;
    const blinkInterval = 500; // Blink every 500ms

    // Enhanced animation with random rotation
    const animate = () => {
      uniforms.time.value += perlinTime / 35000 // Slower time progression
      uniforms.waveTime.value += 0.005 // Slower wave movement
      uniforms.RGBr.value = chromaRGBr / 15
      uniforms.RGBg.value = chromaRGBg / 15
      uniforms.RGBb.value = chromaRGBb / 15

      // Update state uniforms
      uniforms.isSpeaking.value = state === "speaking" ? 1.0 : 0.0
      uniforms.isDisconnected.value = state === "disconnected" ? 1.0 : 0.0
      uniforms.isThinking.value = state === "thinking" ? 1.0 : 0.0

      // Handle blinking effect for thinking state
      if (state === "thinking") {
        const currentTime = Date.now();
        if (currentTime - lastBlinkTime > blinkInterval) {
          blinkRef.current = !blinkRef.current;
          lastBlinkTime = currentTime;
          
          // Toggle opacity between 0.4 and 1.0 for blinking effect
          uniforms.opacity.value = blinkRef.current ? 1.0 : 0.4;
          
          // Also pulse the size slightly
          if (blinkRef.current) {
            mesh.scale.set(1.0, 1.0, 1.0);
          } else {
            mesh.scale.set(0.95, 0.95, 0.95);
          }
        }
      } else {
        // Reset opacity for other states
        uniforms.opacity.value = 1.0;
        mesh.scale.set(1.0, 1.0, 1.0);
      }

      if (state === "disconnected") {
        // Special rotation for disconnected state with logo
        mesh.rotation.y += 0.003 // Slow, steady rotation

        // Add slight wobble
        const time = Date.now() * 0.0003
        mesh.rotation.x = Math.sin(time) * 0.03
        mesh.rotation.z = Math.cos(time * 0.7) * 0.02

        // Subtle floating motion
        mesh.position.y = Math.sin(time * 0.5) * 0.3
      } else if (state === "speaking") {
        // Keep the ball stationary
        mesh.rotation.set(0, 0, 0)
        mesh.position.set(0, 0, 0)

        // Increase the speed of internal color movement
        uniforms.time.value += perlinTime / 10000 // Faster internal rotation
      } else if (state === "thinking") {
        // Special rotation for thinking state with blinking
        mesh.rotation.y += 0.008; // Slightly faster rotation
        
        const time = Date.now() * 0.0006;
        mesh.rotation.x = Math.sin(time) * 0.08;
        mesh.rotation.z = Math.cos(time * 0.9) * 0.08;
        
        // Add a subtle pulsing motion
        const pulseScale = 1.0 + Math.sin(time * 5) * 0.03;
        mesh.scale.set(pulseScale, pulseScale, pulseScale);
      } else {
        // Normal globe rotation for other states
        mesh.rotation.y += 0.005

        const time = Date.now() * 0.0005
        mesh.rotation.x = Math.sin(time) * 0.05
        mesh.rotation.z = Math.cos(time * 0.8) * 0.05

        // Gentle floating motion
        mesh.position.x = Math.sin(time * 0.5) * 0.5
        mesh.position.y = Math.cos(time * 0.4) * 0.5
        mesh.position.z = Math.sin(time * 0.3) * 0.5
      }

      // Camera movement
      const cameraTime = Date.now() * 0.0001
      camera.position.x = Math.sin(cameraTime) * 20
      camera.position.y = 35 + Math.cos(cameraTime * 0.8) * 10
      camera.position.z = 200 + Math.sin(cameraTime * 0.5) * 15
      camera.lookAt(mesh.position)

      renderer.render(scene, camera)
      animationFrameId.current = requestAnimationFrame(animate)
    }

    animate()

    // Center the sphere on resize
    const handleResize = () => {
      if (!currentRef) return

      const width = currentRef.clientWidth
      const height = currentRef.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)

      // Ensure sphere stays centered
      mesh.position.set(0, 0, 0)
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial positioning

    // Clean up timeouts on unmount
    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      if (rotationState.timeoutId) {
        clearTimeout(rotationState.timeoutId)
      }
      if (currentRef) {
        currentRef.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [perlinTime, chromaRGBr, chromaRGBg, chromaRGBb, state])

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "300px",
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    />
  )
}

export default AbstractBall

