import React from 'react'
import { 
  Sparkles, 
  LayoutGrid, 
  Users, 
  FileText, 
  BookOpen, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from 'lucide-react'
import { useAssessmentStore } from '../store/useAssessmentStore'

export default function Sidebar() {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    darkMode, 
    toggleDarkMode,
    screenStage,
    setScreenStage,
    mobileSidebarOpen,
    toggleMobileSidebar,
    assignments
  } = useAssessmentStore()

  const activeItemsCount = assignments.length

  const handleSidebarAction = () => {
    if (screenStage === 'assignment_output') {
      // Transition back or toggle settings
      setScreenStage('create_assignment')
    } else {
      setScreenStage('create_assignment')
    }
  }

  const navItems = [
    { 
      id: 'home',
      label: 'Home',
      icon: LayoutGrid,
      active: screenStage === 'assignment_output',
      onClick: () => {
        if (screenStage === 'assignment_output') {
          // Keep it on output as in Figma
        } else {
          setScreenStage('assignments_list')
        }
      }
    },
    { 
      id: 'groups', 
      label: 'My Groups', 
      icon: Users, 
      active: false,
      onClick: () => {} 
    },
    { 
      id: 'assignments', 
      label: 'Assignments', 
      icon: FileText, 
      active: screenStage === 'assignments_list' || screenStage === 'create_assignment',
      badge: activeItemsCount > 0 ? activeItemsCount : null,
      onClick: () => {
        setScreenStage('assignments_list')
        if (mobileSidebarOpen) toggleMobileSidebar()
      }
    },
    { 
      id: 'toolkit', 
      label: "AI Teacher's Toolkit", 
      icon: BookOpen, 
      active: false,
      onClick: () => {} 
    },
    { 
      id: 'library', 
      label: 'My Library', 
      icon: History, 
      badge: screenStage === 'create_assignment' ? 32 : null, // hardcoded 32 in selector screen as in Figma
      active: false,
      onClick: () => {} 
    }
  ]

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={toggleMobileSidebar}
        />
      )}

      <aside className="sidebar">
        {/* Header containing Logo */}
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/icon.png" className="logo-icon-custom" alt="VedaAI" />
            <span className="logo-text">VedaAI</span>
          </div>
        </div>

        {/* Sidebar Primary Action Button */}
        <div className="sidebar-action-container no-print">
          <button className="sidebar-action-btn" onClick={handleSidebarAction}>
            <Sparkles size={16} />
            <span>
              {screenStage === 'assignment_output' ? "AI Teacher's Toolkit" : "Create Assignment"}
            </span>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                onClick={item.onClick}
                className={`nav-item ${item.active ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </div>
            )
          })}
        </nav>

        {/* Settings and Profile Footer */}
        <div className="sidebar-footer">
          <div 
            className="nav-item" 
            style={{ padding: '8px 16px', marginBottom: '8px' }}
            onClick={() => {}}
          >
            <Settings size={20} className="flex-shrink-0" />
            <span className="nav-label">Settings</span>
          </div>

          {/* School Profile Card */}
          <div className="school-profile-card">
            <img src="/avatar.jpg" alt="DPS Bokaro Logo" className="school-avatar" />
            <div className="school-info">
              <span className="school-name">Delhi Public School</span>
              <span className="school-city">Bokaro Steel City</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
