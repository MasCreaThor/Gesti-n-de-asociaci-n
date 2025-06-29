import React from 'react'
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react'

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <IconButton
      aria-label="Cambiar tema"
      icon={<span>{isDark ? '☀️' : '🌙'}</span>}
      onClick={toggleColorMode}
      variant="ghost"
      size="md"
      colorScheme={useColorModeValue('gray', 'white')}
      _hover={{
        bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
      }}
      transition="all 0.2s"
      borderRadius="full"
    />
  )
} 