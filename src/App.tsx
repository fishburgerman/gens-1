import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ComposerProvider } from './components/Composer'
import { AppLayout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { ClassView } from './pages/ClassView'
import { Explore } from './pages/Explore'
import { Generation } from './pages/Generation'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Welcome } from './pages/Welcome'
import { StoreProvider, useStore } from './state/store'

function Gate() {
  const { profile } = useStore()
  if (!profile) return <Welcome />
  return (
    <ComposerProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="generation" element={<Generation />} />
          {/* v0.1/v0.2 links: My Class is now Home */}
          <Route path="class" element={<Navigate to="/" replace />} />
          <Route path="explore" element={<Explore />} />
          <Route path="explore/:year" element={<ClassView />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ComposerProvider>
  )
}

/**
 * HashRouter keeps every route on index.html, so GitHub Pages never
 * returns 404 on reload or deep links.
 */
export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <Gate />
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  )
}
