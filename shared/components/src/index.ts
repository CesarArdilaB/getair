/**
 * @shared/components - Shared React components library
 *
 * This package contains:
 * - UI components (shadcn/ui based)
 * - Custom shared components
 * - Utility functions (cn)
 * - Custom hooks
 *
 * Usage:
 *   import { Button, Card } from '@shared/components/ui'
 *   import { Center, Spinner } from '@shared/components/custom'
 *   import { cn } from '@shared/components/lib'
 *   import { useIsMobile } from '@shared/components/hooks'
 */

export * from './custom'
export * from './hooks'
export * from './lib'
// Re-export everything for convenience
export * from './ui'
