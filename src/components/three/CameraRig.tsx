import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { sceneState } from '@/animation/sceneState'

/** Opening: low, offset, long lens. Settled: centred, closer, slightly wider. */
export const CAMERA_START = { x: 2.4, y: -1.3, z: 20, fov: 22 }
export const CAMERA_END = { x: 0, y: 0, z: 12, fov: 32 }
/**
 * Hero → About travel, applied on top of CAMERA_END by `sceneState.exit`:
 * a lateral truck and a push forward while the lens widens, so the dust streams
 * past and the sculpture falls away into depth.
 */
export const CAMERA_TRAVEL = { x: -0.8, y: 0.6, push: 7, fov: 9, roll: 0.045 }

const target = new Vector3()

export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera

  useFrame((state) => {
    const { dolly, exit, pointer, still } = sceneState
    const t = state.clock.elapsedTime
    const idle = still ? 0 : 1
    const tx = CAMERA_TRAVEL.x * exit
    const ty = CAMERA_TRAVEL.y * exit

    camera.position.set(
      MathUtils.lerp(CAMERA_START.x, CAMERA_END.x, dolly) + pointer.x * 0.5 + tx,
      MathUtils.lerp(CAMERA_START.y, CAMERA_END.y, dolly) + pointer.y * 0.32 + Math.sin(t * 0.3) * 0.05 * idle + ty,
      MathUtils.lerp(CAMERA_START.z, CAMERA_END.z, dolly) - exit * CAMERA_TRAVEL.push,
    )

    const fov = MathUtils.lerp(CAMERA_START.fov, CAMERA_END.fov, dolly) + exit * CAMERA_TRAVEL.fov
    if (Math.abs(camera.fov - fov) > 1e-3) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

    // Look straight ahead along the truck so the framing maths stays exact.
    target.set(tx, ty, 0)
    camera.lookAt(target)
    // A whisper of roll mid-move: the hand-held feel of a real camera.
    camera.rotateZ(Math.sin(Math.PI * exit) * CAMERA_TRAVEL.roll)
  })

  return null
}
