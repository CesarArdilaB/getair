# Add a Component

Add a new React component to `@shared/components`. Supports both shadcn/ui components and custom components.

## Component: $ARGUMENTS

## Component Types

| Type | Location | Description |
|------|----------|-------------|
| shadcn/ui | `shared/components/src/ui/` | Components from shadcn/ui registry |
| custom | `shared/components/src/custom/` | Custom shared components |

## Instructions

### Option A: Add shadcn/ui Component

1. **Navigate to the shared components directory:**
   ```bash
   cd shared/components
   ```

2. **Run the shadcn CLI:**
   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```

   Examples:
   ```bash
   pnpm dlx shadcn@latest add accordion
   pnpm dlx shadcn@latest add tabs
   pnpm dlx shadcn@latest add table
   ```

3. **Fix import paths:**
   The shadcn CLI uses `@/lib/utils` - update to relative path:
   ```typescript
   // Change from:
   import { cn } from '@/lib/utils'

   // Change to:
   import { cn } from '../lib/utils'
   ```

4. **Export from index:**
   Add exports to `shared/components/src/ui/index.ts`:
   ```typescript
   export {
       Accordion,
       AccordionContent,
       AccordionItem,
       AccordionTrigger,
   } from './accordion'
   ```

5. **Install dependencies (if needed):**
   If the component requires new dependencies, add them to `shared/components/package.json`:
   ```bash
   pnpm add <dependency> --filter @shared/components
   ```

### Option B: Add Custom Component

1. **Create component file:**
   Create `shared/components/src/custom/<component-name>.tsx`:

   ```typescript
   import type { ComponentProps } from 'react'
   import { cn } from '../lib/utils'

   export type MyComponentProps = ComponentProps<'div'> & {
       // Custom props
   }

   export function MyComponent({ className, ...props }: MyComponentProps) {
       return (
           <div
               className={cn('your-styles', className)}
               {...props}
           />
       )
   }
   ```

2. **Export from custom index:**
   Add to `shared/components/src/custom/index.ts`:
   ```typescript
   export { MyComponent, type MyComponentProps } from './my-component'
   ```

### Verification

After adding a component:

```bash
# Type check
pnpm lint

# Format code
pnpm format
```

## Usage in Apps

After adding components, import them in your apps:

```typescript
// Import UI components
import { Accordion, Button, Card } from '@shared/components/ui'

// Import custom components
import { Center, Spinner, MyComponent } from '@shared/components/custom'

// Import utilities
import { cn } from '@shared/components/lib'

// Import hooks
import { useIsMobile } from '@shared/components/hooks'
```

## Package Structure

```
shared/components/
├── src/
│   ├── index.ts           # Re-exports all
│   ├── ui/
│   │   ├── index.ts       # UI component exports
│   │   ├── button.tsx     # shadcn/ui button
│   │   ├── card.tsx       # shadcn/ui card
│   │   └── ...
│   ├── custom/
│   │   ├── index.ts       # Custom component exports
│   │   ├── center.tsx     # Custom Center component
│   │   ├── spinner.tsx    # Custom Spinner component
│   │   └── ...
│   ├── lib/
│   │   ├── index.ts       # Utility exports
│   │   └── utils.ts       # cn() and other utilities
│   └── hooks/
│       ├── index.ts       # Hook exports
│       ├── use-mobile.ts  # useIsMobile hook
│       └── ...
├── components.json        # shadcn configuration
├── package.json
└── tsconfig.json
```

## Adding New Hooks

1. **Create hook file:**
   Create `shared/components/src/hooks/use-<name>.ts`

2. **Export from hooks index:**
   Add to `shared/components/src/hooks/index.ts`:
   ```typescript
   export { useMyHook } from './use-my-hook'
   ```

## shadcn Configuration

The `shared/components/components.json` configures shadcn:

```json
{
    "style": "new-york",
    "tailwind": {
        "css": "../../apps/web/src/index.css",
        "cssVariables": true
    },
    "aliases": {
        "components": "@shared/components",
        "utils": "@shared/components/lib",
        "ui": "@shared/components/ui"
    }
}
```

## Common shadcn Components

Popular components to add:
- `accordion` - Collapsible sections
- `alert` - Alert messages
- `alert-dialog` - Confirmation dialogs
- `calendar` - Date picker
- `checkbox` - Checkbox input
- `command` - Command palette
- `data-table` - Data tables
- `form` - Form components with validation
- `menubar` - Menu bar navigation
- `popover` - Popovers/tooltips
- `progress` - Progress bars
- `radio-group` - Radio buttons
- `scroll-area` - Custom scrollbars
- `select` - Select dropdowns
- `slider` - Slider input
- `switch` - Toggle switch
- `table` - Data tables
- `tabs` - Tab navigation
- `toast` - Toast notifications

## Checklist

- [ ] Component added to correct directory (ui/ or custom/)
- [ ] Import paths use relative paths (`../lib/utils`)
- [ ] Component exported from appropriate index.ts
- [ ] New dependencies added to package.json (if needed)
- [ ] Type check passes: `pnpm lint`
- [ ] Code formatted: `pnpm format`
