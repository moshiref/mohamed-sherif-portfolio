import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, Group, MathUtils, MeshPhysicalMaterial, TorusGeometry } from 'three'
import { getAboutComposition, getComposition, sceneState } from '@/animation/sceneState'
import { createTwistedRingGeometry } from './geometry/twistedRing'
import { CAMERA_END, CAMERA_TRAVEL } from './CameraRig'

const FAR_Z = -78
/** Depth the sculpture retreats to behind the About chapter. */
const ABOUT_Z = -26
/** Outer diameter of the sculpture in local units (radius + ribbon width + swell). */
const LOCAL_DIAMETER = 2 * (2.2 + 0.62 * 1.18)

interface Props {
  segments: [number, number]
}

export function ChromeSculpture({ segments }: Props) {
  const root = useRef<Group>(null)
  const band = useRef<Group>(null)
  const orbit = useRef<Group>(null)
  const size = useThree((s) => s.size)

  const ribbon = useMemo(
    () => createTwistedRingGeometry({ tubularSegments: segments[0], radialSegments: segments[1] }),
    [segments],
  )
  const wire = useMemo(() => new TorusGeometry(3.45, 0.018, 8, 220), [])

  const chrome = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color('#e4e8ef'),
        metalness: 1,
        roughness: 0.07,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
    [],
  )
  const brushed = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color('#b9c2d0'),
        metalness: 1,
        roughness: 0.22,
      }),
    [],
  )

  useEffect(
    () => () => {
      ribbon.dispose()
      wire.dispose()
      chrome.dispose()
      brushed.dispose()
    },
    [ribbon, wire, chrome, brushed],
  )

  // Hero placement in world units, derived from the final camera framing.
  const layout = useMemo(() => {
    const c = getComposition(size.width, size.height)
    const aspect = size.width / size.height
    const h = 2 * CAMERA_END.z * Math.tan(MathUtils.degToRad(CAMERA_END.fov / 2))
    const w = h * aspect
    const diameter = Math.min(c.size * h, 0.92 * w)

    // Resting place behind the About chapter, framed from the travelled camera.
    const a = getAboutComposition(size.width, size.height)
    const depth = CAMERA_END.z - CAMERA_TRAVEL.push - ABOUT_Z
    const ah = 2 * depth * Math.tan(MathUtils.degToRad((CAMERA_END.fov + CAMERA_TRAVEL.fov) / 2))
    return {
      x: (c.focusX - 0.5) * w,
      y: (0.5 - c.focusY) * h,
      aboutX: CAMERA_TRAVEL.x + (a.focusX - 0.5) * ah * aspect,
      aboutY: CAMERA_TRAVEL.y + (0.5 - a.focusY) * ah,
      scale: diameter / LOCAL_DIAMETER,
    }
  }, [size.width, size.height])

  useFrame((state, delta) => {
    const g = root.current
    if (!g || !band.current || !orbit.current) return
    const t = state.clock.elapsedTime
    const { approach, exit, pointer, still } = sceneState
    const idle = still ? 0 : 1

    // Genuine travel through depth: the sculpture flies in along z for the intro,
    // then retreats deep into the scene as the story moves to the About chapter.
    const z = MathUtils.lerp(FAR_Z, 0, approach) + exit * ABOUT_Z
    g.position.set(
      MathUtils.lerp(layout.x, layout.aboutX, exit),
      MathUtils.lerp(layout.y, layout.aboutY, exit) + Math.sin(t * 0.45) * 0.06 * idle,
      z,
    )
    g.scale.setScalar(layout.scale)

    // Arrives edge-on, then turns to present itself, settling into a gentle tilt.
    // On the way out it banks away, like an object passing the camera.
    g.rotation.x = MathUtils.lerp(1.15, 0.34, approach) + pointer.y * 0.1 + exit * 0.55
    g.rotation.y =
      MathUtils.lerp(-0.85, -0.32, approach) + Math.sin(t * 0.21) * 0.05 * idle + pointer.x * 0.16 + exit * 0.7

    // Spinning about its own axis makes the Möbius twist travel around the loop.
    band.current.rotation.z += delta * (0.07 + (1 - approach) * 0.9) * idle
    orbit.current.rotation.z -= delta * 0.04 * idle
    orbit.current.rotation.x = 0.42 + Math.sin(t * 0.17) * 0.03 * idle
  })

  return (
    <group ref={root}>
      <group ref={band}>
        <mesh geometry={ribbon} material={chrome} />
      </group>
      <group ref={orbit} rotation={[0.42, 0.28, 0]}>
        <mesh geometry={wire} material={brushed} />
      </group>
    </group>
  )
}
