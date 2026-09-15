import { useState, useEffect } from 'react'

export function getInitialTheme(): boolean {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.remove('dark')
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.removeItem('theme')
  }
  return false
}

export function setThemeMode(isDark: boolean) {
  if (typeof window === 'undefined') return
  document.documentElement.classList.remove('dark')
  document.documentElement.setAttribute('data-theme', 'light')
  localStorage.setItem('theme', 'light')
}

export function useTheme() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.removeItem('theme')
    }
  }, [])

  return { isDark: false, toggleTheme: () => {} }
}
