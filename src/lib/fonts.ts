const FACES = ['800 1em "Archivo"', '500 1em "Archivo"', '400 1em "Geist"', '400 1em "Geist Mono"']

/**
 * Resolves once the display and UI faces are usable. The Google Fonts sheet is
 * loaded non-blocking, so `document.fonts.ready` alone could resolve before the
 * @font-face rules even exist; wait for the sheet first, then for the faces.
 */
export async function waitForFonts(): Promise<void> {
  const link = document.querySelector<HTMLLinkElement>('link[href*="fonts.googleapis.com/css2"]')
  if (link && link.rel !== 'stylesheet') {
    await new Promise<void>((resolve) => {
      link.addEventListener('load', () => resolve(), { once: true })
      link.addEventListener('error', () => resolve(), { once: true })
    })
  }
  await Promise.all(FACES.map((face) => document.fonts.load(face).catch(() => [])))
}
