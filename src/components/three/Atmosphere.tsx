import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  Color,
  FogExp2,
  MathUtils,
  Mesh,
  PlaneGeometry,
  PointLight,
  ShaderMaterial,
  SpotLight,
} from 'three'
import { getAboutComposition, getComposition, sceneState } from '@/animation/sceneState'
import { CAMERA_END } from './CameraRig'

const WALL_Z = -42
const GLOW_CORE = new Color('#1a2233')
const GLOW_CORE_ABOUT = new Color('#14244a')
/** Visible height of the back wall plane from the settled camera. */
const WALL_VIEW_HEIGHT = 2 * (CAMERA_END.z - WALL_Z) * Math.tan(MathUtils.degToRad(CAMERA_END.fov / 2))

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const glowFragment = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uEdge;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float d = length((vUv - 0.5) * vec2(1.0, 1.15));
    float core = smoothstep(0.42, 0.0, d);
    float halo = smoothstep(0.5, 0.12, d) * 0.35;
    vec3 col = mix(uEdge * halo, uCore, core * core);
    gl_FragColor = vec4(col * uIntensity, 1.0);
  }
`

/**
 * Light and air: exponential fog that swallows the sculpture while it is far
 * away, a soft back-wall spotlight that silhouettes the portrait, and a key and
 * blue rim light that sculpt highlights on top of the environment reflections.
 */
export function Atmosphere() {
  const scene = useThree((s) => s.scene)
  const size = useThree((s) => s.size)
  const key = useRef<SpotLight>(null)
  const rim = useRef<PointLight>(null)
  const wall = useRef<Mesh>(null)

  const fog = useMemo(() => new FogExp2('#050505', 0.016), [])
  const glow = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        depthWrite: false,
        transparent: true,
        blending: AdditiveBlending,
        uniforms: {
          uCore: { value: GLOW_CORE.clone() },
          uEdge: { value: new Color('#0c1220') },
          uIntensity: { value: 0 },
        },
      }),
    [],
  )
  const plane = useMemo(() => new PlaneGeometry(1, 1), [])

  useEffect(() => {
    scene.fog = fog
    scene.background = new Color('#050505')
    return () => {
      scene.fog = null
      glow.dispose()
      plane.dispose()
    }
  }, [scene, fog, glow, plane])

  useFrame((state) => {
    const { reveal, approach, exit, still } = sceneState
    const t = still ? 0 : state.clock.elapsedTime

    scene.environmentIntensity = reveal * 1.3 * (1 - exit * 0.5)
    // Reflections sweep across the chrome as the lights come up, then drift slowly.
    // Reflections sweep around the chrome as the camera travels to the next chapter.
    scene.environmentRotation.y = 0.5 + (1 - reveal) * 1.6 + t * 0.025 + exit * 2.2

    // Fog thins as the object arrives, then thickens as it retreats into the haze.
    fog.density = 0.024 - approach * 0.01 + exit * 0.006

    if (key.current) key.current.intensity = reveal * 220 * (1 - exit * 0.45)
    if (rim.current) rim.current.intensity = reveal * (60 + exit * 70)

    // The back-wall pool of light dips mid-move, shifts cooler and follows the sculpture.
    const aspect = size.width / size.height
    const c = getComposition(size.width, size.height)
    const a = getAboutComposition(size.width, size.height)
    const dip = 1 - Math.sin(Math.PI * exit) * 0.55
    glow.uniforms.uIntensity.value = reveal * (0.85 + Math.sin(t * 0.4) * 0.05) * dip
    glow.uniforms.uCore.value.lerpColors(GLOW_CORE, GLOW_CORE_ABOUT, exit)
    if (wall.current) {
      const h = WALL_VIEW_HEIGHT
      const fx = MathUtils.lerp(c.focusX, a.focusX, exit)
      const fy = MathUtils.lerp(c.focusY, a.focusY, exit)
      wall.current.position.set((fx - 0.5) * h * aspect, (0.5 - fy) * h, WALL_Z)
    }
  })

  return (
    <>
      <mesh ref={wall} geometry={plane} material={glow} scale={[72, 60, 1]} renderOrder={-1} />
      <spotLight
        ref={key}
        position={[-6, 8, 9]}
        angle={0.5}
        penumbra={1}
        decay={2}
        distance={60}
        color="#ffffff"
        intensity={0}
      />
      <pointLight ref={rim} position={[7, 1.5, -2]} color="#4d8dff" decay={2} distance={30} intensity={0} />
    </>
  )
}
