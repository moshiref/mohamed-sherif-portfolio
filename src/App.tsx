import { useCallback, useState } from 'react'
import { Contact } from '@/components/contact/Contact'
import { FloatingNav } from '@/components/nav/FloatingNav'
import { Story } from '@/components/story/Story'
import { Work } from '@/components/work/Work'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { SmoothScrollProvider } from '@/providers/SmoothScroll'

export default function App() {
  const [navVisible, setNavVisible] = useState(false)
  const showNav = useCallback(() => setNavVisible(true), [])

  return (
    <SmoothScrollProvider>
      <NavigationProvider>
        <FloatingNav visible={navVisible} />
        <main>
          {/* Hero → About, one pinned cinematic sequence. */}
          <Story onNavReady={showNav} />
          <Work />
          <Contact />
        </main>
      </NavigationProvider>
    </SmoothScrollProvider>
  )
}
