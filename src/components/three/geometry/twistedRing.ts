import { BufferGeometry, Float32BufferAttribute } from 'three'

export interface TwistedRingOptions {
  /** Distance from the ring centre to the centre of the ribbon. */
  radius?: number
  /** Half-width of the ribbon cross-section (in the ring plane). */
  width?: number
  /** Half-thickness of the ribbon cross-section. */
  thickness?: number
  /** Number of half-turns the cross-section makes around the loop. 1 = Möbius band. */
  halfTurns?: number
  /** Superellipse exponent: 2 = ellipse, higher = squarer, softly bevelled. */
  exponent?: number
  /** Gentle width breathing along the loop, for a sculpted rather than machined feel. */
  swell?: number
  tubularSegments?: number
  radialSegments?: number
}

/**
 * A closed ribbon whose superellipse cross-section twists around the loop.
 * With an odd number of half-turns it becomes a Möbius band. Vertices at the
 * seam are shared (not duplicated) so vertex normals stay perfectly smooth,
 * which matters for chrome: any normal discontinuity shows up as a hard
 * reflection seam.
 */
export function createTwistedRingGeometry({
  radius = 2.2,
  width = 0.62,
  thickness = 0.17,
  halfTurns = 1,
  exponent = 5,
  swell = 0.18,
  tubularSegments = 420,
  radialSegments = 72,
}: TwistedRingOptions = {}): BufferGeometry {
  // The cross-section is symmetric under a 180° rotation, so the seam closes
  // when the radial index is shifted by half a revolution per half-turn.
  const M = radialSegments - (radialSegments % 2)
  const N = tubularSegments
  const seamShift = ((halfTurns % 2) * M) / 2

  const positions = new Float32Array(N * M * 3)
  const uvs = new Float32Array(N * M * 2)
  const p = 2 / exponent

  // Precompute the cross-section profile.
  const profile = new Float32Array(M * 2)
  for (let j = 0; j < M; j++) {
    const t = (j / M) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    profile[j * 2] = Math.sign(c) * Math.pow(Math.abs(c), p)
    profile[j * 2 + 1] = Math.sign(s) * Math.pow(Math.abs(s), p)
  }

  for (let i = 0; i < N; i++) {
    const u = (i / N) * Math.PI * 2
    const cu = Math.cos(u)
    const su = Math.sin(u)
    const twist = (u / (Math.PI * 2)) * Math.PI * halfTurns
    const ct = Math.cos(twist)
    const st = Math.sin(twist)
    // Width breathes twice around the loop (periodic, so the seam stays clean).
    const w = width * (1 + swell * Math.sin(u * 2))

    for (let j = 0; j < M; j++) {
      const px = profile[j * 2] * w
      const py = profile[j * 2 + 1] * thickness
      // Rotate the cross-section by the twist angle.
      const radial = px * ct - py * st
      const lift = px * st + py * ct
      const k = (i * M + j) * 3
      positions[k] = (radius + radial) * cu
      positions[k + 1] = (radius + radial) * su
      positions[k + 2] = lift
      const q = (i * M + j) * 2
      uvs[q] = i / N
      uvs[q + 1] = j / M
    }
  }

  const index = (i: number, j: number) => {
    if (i === N) return (j + seamShift) % M
    return i * M + (j % M)
  }

  const indices: number[] = []
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = index(i, j)
      const b = index(i + 1, j)
      const c = index(i + 1, j + 1)
      const d = index(i, j + 1)
      indices.push(a, b, d, b, c, d)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
