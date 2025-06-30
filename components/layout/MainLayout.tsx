import React, { useState } from 'react'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  BoxProps,
  FlexProps,
  CloseButton,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiMenu,
  FiLogOut,
  FiBarChart,
  FiFileText,
  FiSettings,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ThemeToggle from '../ThemeToggle'

interface LinkItemProps {
  name: string
  icon: any
  href: string
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: FiHome, href: '/dashboard' },
  { name: 'Socios', icon: FiUsers, href: '/socios' },
  { name: 'Reuniones', icon: FiCalendar, href: '/reuniones' },
  { name: 'Actas', icon: FiFileText, href: '/actas' },
  { name: 'Reportes', icon: FiBarChart, href: '/reportes' },
  { name: 'Configuración', icon: FiSettings, href: '/configuracion' },
]

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      transition="0.3s ease"
      bg={bg}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      zIndex={20}
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Asociación
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} href={link.href}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: any
  children: React.ReactNode
  href: string
}

const NavItem = ({ icon, children, href, ...rest }: NavItemProps) => {
  const router = useRouter()
  const isActive = router.pathname === href
  const hoverBg = useColorModeValue('brand.50', 'whiteAlpha.200')

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'brand.500' : 'transparent'}
        color={isActive ? 'white' : 'inherit'}
        _hover={{
          bg: isActive ? 'brand.600' : hoverBg,
          color: isActive ? 'white' : 'brand.600',
        }}
        {...rest}
      >
        <Box 
          as={icon as any} 
          mr="4" 
          fontSize="16" 
          color={isActive ? 'white' : 'inherit'} 
        />
        {children}
      </Flex>
    </Link>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { user, logout } = useAuth()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={bg}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <Button
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        size="sm"
        p={2}
      >
        <Box as={FiMenu as any} />
      </Button>

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Asociación
      </Text>

      <HStack spacing={2}>
        <ThemeToggle />
        <Flex alignItems={'center'}>
          <VStack
            display={{ base: 'none', md: 'flex' }}
            alignItems="flex-start"
            ml="2"
          >
            <Text fontSize="sm">{user?.name}</Text>
            <Text fontSize="xs" color={textColor}>
              Administrador
            </Text>
          </VStack>
        </Flex>
        <Button
          variant="ghost"
          onClick={logout}
          size="sm"
        >
          <Box as={FiLogOut as any} mr={2} />
          Cerrar Sesión
        </Button>
      </HStack>
    </Flex>
  )
}

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const bg = useColorModeValue('gray.100', 'gray.900')

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  return (
    <Box minH="100vh" bg={bg}>
      {/* Sidebar para desktop */}
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      
      {/* Overlay para móvil */}
      {isOpen && (
        <Box
          display={{ base: 'block', md: 'none' }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={10}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar móvil */}
      <Box
        display={{ base: isOpen ? 'block' : 'none', md: 'none' }}
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        w="full"
        zIndex={20}
      >
        <SidebarContent onClose={onClose} />
      </Box>
      
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

export default MainLayout 