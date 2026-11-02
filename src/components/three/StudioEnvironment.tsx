import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import {
  BackSide,
  BoxGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  PlaneGeometry,
  Scene,
  TorusGeometry,
} from 'three'

/**
 * Builds a procedural HDR "photo studio" and bakes it into a PMREM environment
 * map. There is no HDRI download: softboxes, strip lights and a single
 * electric-blue kicker exist only to be reflected in the chrome. Values above 1
 * are deliberate, because the render target is half-float so highlights stay HDR.
 */
export function StudioEnvironment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const env = new Scene()
    const disposables: { dispose(): void }[] = []

    const room = new Mesh(
      new BoxGeometry(40, 40, 40),
      // Not pure black: a faint grey room keeps the chrome reading as metal, not void.
      new MeshBasicMaterial({ color: new Color(0.022, 0.024, 0.03), side: BackSide }),
    )
    env.add(room)
    disposables.push(room.geometry, room.material)

    const plane = new PlaneGeometry(1, 1)
    disposables.push(plane)

    const panel = (
      rgb: [number, number, number],
      intensity: number,
      pos: [number, number, number],
      scale: [number, number],
      rot: [number, number, number] = [0, 0, 0],
    ) => {
      const mat = new MeshBasicMaterial({
        color: new Color(rgb[0] * intensity, rgb[1] * intensity, rgb[2] * intensity),
        side: DoubleSide,
      })
      const mesh = new Mesh(plane, mat)
      mesh.position.set(...pos)
      mesh.scale.set(scale[0], scale[1], 1)
      mesh.rotation.set(...rot)
      mesh.lookAt(0, 0, 0)
      env.add(mesh)
      disposables.push(mat)
    }

    // Overhead key softbox.
    panel([1, 1, 1], 3.2, [0, 14, 2], [18, 8])
    // Large frontal soft panel, camera left: broad silver gradient across the band.
    panel([0.92, 0.95, 1], 1.2, [-9, 4, 12], [10, 12])
    // Tall white strip, camera left: the main sweeping highlight.
    panel([1, 0.98, 0.96], 8, [-12, 2, 4], [1.6, 18])
    // Thin secondary strip, camera left and behind: an edge kicker.
    panel([1, 1, 1], 5, [-8, 0, -10], [0.5, 16])
    // Electric-blue strip, camera right: the accent colour lives only in reflections.
    panel([0.3, 0.55, 1], 8, [12, 1, 2], [1.4, 18])
    // Cool silver back rim.
    panel([0.75, 0.82, 0.95], 3, [6, -2, -12], [10, 0.6])
    // Low warm-neutral fill so blacks keep some shape.
    panel([1, 0.95, 0.9], 0.6, [0, -12, 6], [18, 4])

    // Ring light behind the camera adds a crisp circular catchlight on the chrome.
    const ringMat = new MeshBasicMaterial({ color: new Color(4, 4, 4.2) })
    const ring = new Mesh(new TorusGeometry(3.2, 0.12, 12, 96), ringMat)
    ring.position.set(3, 4, 14)
    ring.lookAt(0, 0, 0)
    env.add(ring)
    disposables.push(ring.geometry, ringMat)

    const pmrem = new PMREMGenerator(gl)
    const target = pmrem.fromScene(env, 0.035)
    scene.environment = target.texture

    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      disposables.forEach((d) => d.dispose())
    }
  }, [gl, scene])

  return null
}
