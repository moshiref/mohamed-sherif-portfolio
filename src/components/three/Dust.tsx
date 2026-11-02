import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, ShaderMaterial } from 'three'
import { sceneState } from '@/animation/sceneState'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uReveal;
  attribute float aScale;
  attribute float aSpeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Slow upward drift, wrapped inside the volume.
    p.y = mod(p.y + uTime * aSpeed * 0.18 + 9.0, 18.0) - 9.0;
    p.x += sin(uTime * 0.15 * aSpeed + position.z * 0.3) * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float depth = -mv.z;
    gl_PointSize = uSize * aScale * uPixelRatio / depth;
    // Fade out in the far haze and just before passing the lens.
    vAlpha = smoothstep(70.0, 18.0, depth) * smoothstep(2.5, 7.0, depth) * uReveal;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha * 0.55);
  }
`

export function Dust({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18
      positions[i * 3 + 2] = -80 + Math.random() * 94
      scales[i] = 0.4 + Math.pow(Math.random(), 4) * 1.1
      speeds[i] = 0.3 + Math.random() * 0.7
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(positions, 3))
    g.setAttribute('aScale', new Float32BufferAttribute(scales, 1))
    g.setAttribute('aSpeed', new Float32BufferAttribute(speeds, 1))
    return g
  }, [count])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: dpr },
          uSize: { value: 70 },
          uReveal: { value: 0 },
          uColor: { value: new Color('#b8cdf5') },
        },
      }),
    // dpr is synced in the frame loop, so the material is built once.
    [],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame((state) => {
    const u = material.uniforms
    if (!sceneState.still) u.uTime.value = state.clock.elapsedTime
    // Dust brightens a touch mid-travel so the camera push reads as motion through air.
    u.uReveal.value = sceneState.reveal * (1 + Math.sin(Math.PI * sceneState.exit) * 0.6 - sceneState.exit * 0.25)
    u.uPixelRatio.value = state.viewport.dpr
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
