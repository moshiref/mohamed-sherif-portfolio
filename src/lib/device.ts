export type QualityTier = 'high' | 'medium' | 'low'

export interface DeviceProfile {
  tier: QualityTier
  isMobile: boolean
  finePointer: boolean
  maxDpr: number
  particles: number
  ringSegments: [tubular: number, radial: number]
  antialias: boolean
}

export function getDeviceProfile(): DeviceProfile {
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  const finePointer = window.matchMedia('(pointer: fine)').matches
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8

  let tier: QualityTier = 'high'
  if (isMobile || cores <= 4 || memory <= 4) tier = 'medium'
  if (cores <= 2 || memory <= 2) tier = 'low'

  return {
    tier,
    isMobile,
    finePointer,
    maxDpr: tier === 'high' ? 1.75 : tier === 'medium' ? 1.5 : 1,
    particles: tier === 'high' ? 900 : tier === 'medium' ? 450 : 220,
    ringSegments: tier === 'high' ? [420, 72] : tier === 'medium' ? [280, 48] : [180, 32],
    antialias: tier !== 'low',
  }
}

let webglCache: boolean | null = null

export function supportsWebGL(): boolean {
  if (webglCache !== null) return webglCache
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    webglCache = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglCache = false
  }
  return webglCache
}
