import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-gray-900">
      <header className="bg-primary text-white p-4 text-center text-lg font-semibold">
        Easy Games 🎮
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}

export default Layout
