import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AssignmentsList from './components/AssignmentsList'
import AssessmentForm from './components/AssessmentForm'
import A4PreviewCanvas from './components/A4PreviewCanvas'
import RealtimeProgress from './components/RealtimeProgress'
import { useAssessmentStore } from './store/useAssessmentStore'
import { LayoutGrid, FileText, BookOpen, Sparkles } from 'lucide-react'
import './components.css'

// Hook: returns true when device is in portrait orientation
function useIsPortrait() {
  const [isPortrait, setIsPortrait] = useState(
    () => window.matchMedia('(orientation: portrait)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const handler = (e) => setIsPortrait(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isPortrait
}

// Mobile bottom tab bar — only rendered in portrait mode
function MobileBottomNav() {
  const { screenStage, setScreenStage } = useAssessmentStore()

  const tabs = [
    { id: 'home',        label: 'Home',        icon: LayoutGrid },
    { id: 'assignments', label: 'Assignments',  icon: FileText  },
    { id: 'library',     label: 'Library',      icon: BookOpen  },
    { id: 'aitoolkit',   label: 'AI Toolkit',   icon: Sparkles  },
  ]

  const activeTab = (id) => {
    if (id === 'aitoolkit')   return screenStage === 'assignment_output'
    if (id === 'assignments') return screenStage === 'assignments_list' || screenStage === 'create_assignment'
    return false
  }

  const handleTab = (id) => {
    if (id === 'assignments') setScreenStage('assignments_list')
    else if (id === 'aitoolkit') setScreenStage('assignment_output')
    else if (id === 'home') setScreenStage('assignments_list')
  }

  return (
    <nav className="mobile-bottom-nav no-print">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            className={`mobile-bottom-tab ${activeTab(tab.id) ? 'active' : ''}`}
            onClick={() => handleTab(tab.id)}
            aria-label={tab.label}
          >
            <Icon size={22} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default function App() {
  const {
    screenStage,
    sidebarCollapsed,
    darkMode,
    mobileSidebarOpen
  } = useAssessmentStore()

  const isPortrait = useIsPortrait()

  // Initialize theme mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Sync orientation class on <html> so CSS can also react
  useEffect(() => {
    if (isPortrait) {
      document.documentElement.classList.add('portrait-mode')
      document.documentElement.classList.remove('landscape-mode')
    } else {
      document.documentElement.classList.add('landscape-mode')
      document.documentElement.classList.remove('portrait-mode')
    }
  }, [isPortrait])

  const layoutClass = [
    'app-layout',
    sidebarCollapsed   ? 'sidebar-collapsed-layout' : '',
    mobileSidebarOpen  ? 'sidebar-mobile-open'       : '',
    isPortrait         ? 'portrait-layout'            : 'landscape-layout',
  ].filter(Boolean).join(' ')

  const renderStageContent = () => {
    switch (screenStage) {
      case 'assignments_list':  return <AssignmentsList />
      case 'create_assignment': return <AssessmentForm />
      case 'assignment_output': return <A4PreviewCanvas />
      default:                  return <AssignmentsList />
    }
  }

  return (
    <div className={layoutClass}>
      {/* Sidebar — hidden in portrait, visible in landscape */}
      <Sidebar />

      {/* Main content */}
      <div className="main-container">
        <Header />
        <main className="content-area">
          {renderStageContent()}
        </main>
      </div>

      {/* Websocket progress overlay */}
      <RealtimeProgress />

      {/* Bottom tab bar — portrait only */}
      {isPortrait && <MobileBottomNav />}
    </div>
  )
}
