import React, { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Menu,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowLeft,
  ChevronDown,
  LayoutGrid,
  Sparkles
} from 'lucide-react'
import { useAssessmentStore } from '../store/useAssessmentStore'

// Shared hook: true when orientation is portrait
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

export default function Header() {
  const { 
    screenStage, 
    setScreenStage,
    toggleMobileSidebar,
    notifications,
    markNotificationsAsRead,
    clearNotifications
  } = useAssessmentStore()

  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)
  const isPortrait = useIsPortrait()

  const unreadCount = notifications.filter(n => !n.read).length

  // Close notification panel on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setPanelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} className="text-success" />
      case 'error':   return <AlertCircle size={14} className="text-danger" />
      default:        return <Info size={14} className="text-info" />
    }
  }

  const handleBack = () => {
    if (screenStage === 'assignment_output') {
      setScreenStage('create_assignment')
    } else if (screenStage === 'create_assignment') {
      setScreenStage('assignments_list')
    }
  }

  const getMobilePageTitle = () => {
    if (screenStage === 'assignment_output') return 'Create New'
    if (screenStage === 'create_assignment') return 'Create Assignment'
    return 'Assignments'
  }

  // Shared notifications dropdown panel
  const NotifPanel = () => (
    <div className="notif-panel">
      <div className="notif-header">
        <h4>Notifications</h4>
        {notifications.length > 0 && (
          <button className="notif-clear-btn" onClick={() => { clearNotifications(); setPanelOpen(false) }}>
            Clear All
          </button>
        )}
      </div>
      <div className="notif-list">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div key={item.id} className={`notif-item ${item.read ? '' : 'unread'}`}>
              <div className="notif-title-row">
                <span className="notif-item-title">{item.title}</span>
                <span className="notif-time">{item.time}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {getNotifIcon(item.type)}
                <p className="notif-desc">{item.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="notif-empty">No notifications yet</div>
        )}
      </div>
    </div>
  )

  // ─── PORTRAIT (mobile) layout ───────────────────────────────────────────────
  if (isPortrait) {
    return (
      <header className="mobile-header no-print">
        {/* Row 1: VedaAI logo  |  Bell + Avatar + Hamburger */}
        <div className="mobile-header-top">
          <div className="mobile-logo">
            <img src="/icon.png" className="logo-icon-custom" alt="VedaAI" />
            <span className="logo-text">VedaAI</span>
          </div>

          <div className="mobile-header-actions">
            {/* Bell */}
            <div style={{ position: 'relative' }} ref={panelRef}>
              <button
                className="header-bell-btn"
                onClick={() => { setPanelOpen(!panelOpen); if (!panelOpen) markNotificationsAsRead() }}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-dot" />}
              </button>
              {panelOpen && <NotifPanel />}
            </div>

            {/* Avatar */}
            <img src="/teacher_avatar.svg" alt="John Doe" className="mobile-avatar" />

            {/* Hamburger → opens mobile sidebar drawer */}
            <button className="menu-toggle-btn" onClick={toggleMobileSidebar} aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Row 2: Back arrow | centered page title | spacer */}
        <div className="mobile-header-subnav">
          <button
            className="mobile-back-btn"
            onClick={handleBack}
            disabled={screenStage === 'assignments_list'}
            aria-label="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="mobile-page-title">{getMobilePageTitle()}</span>
          <div style={{ width: 36 }} />
        </div>
      </header>
    )
  }

  // ─── LANDSCAPE (desktop/tablet) layout ──────────────────────────────────────
  return (
    <header className="header no-print">
      {/* Left: back + breadcrumb */}
      <div className="header-left">
        <button
          className="header-back-btn"
          onClick={handleBack}
          disabled={screenStage === 'assignments_list'}
          aria-label="Go Back"
        >
          <ArrowLeft size={20} />
        </button>

        {screenStage === 'assignment_output' ? (
          <div className="breadcrumbs-custom">
            <Sparkles size={18} className="breadcrumb-icon star-icon-active" />
            <span className="breadcrumb-label">Create New</span>
          </div>
        ) : (
          <div className="breadcrumbs-custom">
            <LayoutGrid size={18} className="breadcrumb-icon" />
            <span className="breadcrumb-label">Assignment</span>
          </div>
        )}
      </div>

      {/* Right: Bell + profile */}
      <div className="header-right">
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button
            className="header-bell-btn"
            onClick={() => { setPanelOpen(!panelOpen); if (!panelOpen) markNotificationsAsRead() }}
            title="System alerts"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>
          {panelOpen && <NotifPanel />}
        </div>

        <div className="user-profile">
          <img src="/teacher_avatar.svg" alt="John Doe" className="user-avatar-img" />
          <span className="user-name-text">John Doe</span>
          <ChevronDown size={16} className="user-chevron" />
        </div>
      </div>
    </header>
  )
}
