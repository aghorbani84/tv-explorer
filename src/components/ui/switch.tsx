import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '../../lib/utils'

/**
 * shadcn-style Switch (Radix Switch), hand-written because the `shadcn` CLI
 * hung on its interactive init in this environment (no components.json; no
 * TTY). Same public API as @shadcn/switch, styled with this project's
 * semantic theme tokens.
 */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full bg-raised ring-1 ring-line transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:ring-accent',
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-ink ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-accent-ink"
      />
    </SwitchPrimitives.Root>
  )
}

export { Switch }
