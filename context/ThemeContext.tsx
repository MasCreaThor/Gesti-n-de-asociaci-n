import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorMode, useColorModeValue } from '@chakra-ui/react'

interface ThemeContextType {
  colorMode: string
  toggleColorMode: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorMode, toggleColorMode } = useColorMode()
  const [isDark, setIsDark] = useState(colorMode === 'dark')

  // Sincronizar el estado local con el colorMode de Chakra
  useEffect(() => {
    setIsDark(colorMode === 'dark')
  }, [colorMode])

  // Persistir la preferencia en localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('chakra-ui-color-mode')
    if (savedTheme && savedTheme !== colorMode) {
      toggleColorMode()
    }
  }, [])

  const value = {
    colorMode,
    toggleColorMode,
    isDark,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 