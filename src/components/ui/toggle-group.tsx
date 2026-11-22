import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

/**
 * shadcn-style ToggleGroup (Radix Toggle Group), hand-written because the
 * `shadcn` CLI hung on its interactive init in this environment (no
 * components.json; no TTY). Same public API as @shadcn/toggle-group,
 * styled with this project's semantic theme tokens.
 */
const toggleGroupVariants = cva(
  'group/toggle-group flex w-fit items-center rounded-full bg-surface p-1 ring-1 ring-line data-[variant=outline]:shadow-xs',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'bg-surface',
      },
      size: {
        default: 'h-9 gap-1',
        sm: 'h-8 gap-1',
        lg: 'h-10 gap-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-accent aria-pressed:text-accent-ink aria-pressed:font-semibold data-[state=on]:bg-accent data-[state=on]:text-accent-ink data-[state=on]:font-semibold [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent text-muted hover:text-ink',
        outline: 'bg-transparent text-muted hover:text-ink',
      },
      size: {
        default: 'h-7 min-w-7 px-3 text-sm',
        sm: 'h-6 min-w-6 px-2.5 text-[13px]',
        lg: 'h-8 min-w-8 px-3.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ToggleGroupContextValue = VariantProps<typeof toggleGroupVariants>

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: 'default',
  variant: 'default',
})

function ToggleGroup({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(toggleGroupVariants({ variant, size }), className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleGroupItemVariants>) {
  const context = React.useContext(ToggleGroupContext)
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleGroupItemVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
