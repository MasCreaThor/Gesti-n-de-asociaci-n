declare module 'react-icons/*' {
  import { ComponentType, SVGProps } from 'react'
  
  export interface IconBaseProps extends SVGProps<SVGSVGElement> {
    children?: never
    color?: string
    size?: string | number
    title?: string
  }
  
  export type IconType = ComponentType<IconBaseProps>
} 