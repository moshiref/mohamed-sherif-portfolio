import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import type { DeviceProfile } from '@/lib/device'
import { Atmosphere } from './Atmosphere'
import { CameraRig, CAMERA_START } from './CameraRig'
import { ChromeSculpture } from './ChromeSculpture'
import { Dust } from './Dust'
import { StudioEnvironment } from './StudioEnvironment'

interface Props {
  profile: DeviceProfile
  onReady: () => void
  onError: () => void
}

/** Fires once the GPU has actually produced frames (shaders compiled, env baked). */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    if (++frames.current >= 3) {
      done.current = true
      onReady()
    }
  })
  return null
}

export default function HeroCanvas({ profile, onReady, onError }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)

  // Stop rendering entirely when the hero is scrolled away.
  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={host} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, profile.maxDpr]}
        gl={{
          antialias: profile.antialias,
          alpha: false,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: CAMERA_START.fov, near: 0.1, far: 220, position: [CAMERA_START.x, CAMERA_START.y, CAMERA_START.z] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            onError()
          })
        }}
        style={{ pointerEvents: 'none' }}
        aria-hidden
      >
        <StudioEnvironment />
        <Atmosphere />
        <CameraRig />
        <ChromeSculpture segments={profile.ringSegments} />
        <Dust count={profile.particles} />
        <ReadySignal onReady={onReady} />
      </Canvas>
    </div>
  )
}
