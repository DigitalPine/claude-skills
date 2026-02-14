# shadcn/ui Setup Guide for Next.js

Complete guide for integrating shadcn/ui component library with Next.js projects. Information current as of October 2025.

## What is shadcn/ui?

shadcn/ui is a collection of re-usable components built with Radix UI and Tailwind CSS. Unlike traditional component libraries:
- Components are copied into your project (not installed as dependencies)
- Full ownership and customization
- Built for Next.js App Router
- TypeScript-first

## Prerequisites

shadcn/ui requires:
- Next.js 13+ (App Router supported)
- React 18+
- Tailwind CSS 3+
- TypeScript (recommended, but JavaScript works)

## Installation

### Non-Interactive Init

```bash
npx shadcn@latest init -y
```

The `-y` flag uses defaults:
- Style: Default
- Base color: Neutral
- CSS variables: Enabled

### Interactive Init (for customization)

```bash
npx shadcn@latest init
```

Prompts for:
1. Framework detection (auto-detects Next.js)
2. TypeScript or JavaScript
3. Style (Default, New York)
4. Base color (Neutral, Gray, Zinc, Stone, Slate)
5. Global CSS file location
6. CSS variables for theming
7. React Server Components (auto-detected for App Router)
8. Import alias for components

### Custom Non-Interactive Setup

```bash
npx shadcn@latest init -y -b zinc --css-variables
```

Available flags:
- `-y` or `--yes` — Use defaults, skip prompts (default: true)
- `-f` or `--force` — Overwrite existing configuration
- `-b` or `--base-color <color>` — Base color (neutral, gray, zinc, stone, slate)
- `--css-variables` — Enable CSS variables (default: true)
- `--no-css-variables` — Disable CSS variables
- `--src-dir` — Use src directory structure
- `--no-src-dir` — Disable src directory
- `-c` or `--cwd <path>` — Working directory path
- `-s` or `--silent` — Suppress output messages

## What init Does

The initialization process:

1. **Creates `components.json`**: Configuration file in project root
2. **Installs dependencies**:
   - `tailwindcss-animate` — Animation utilities
   - `class-variance-authority` — Component variant system
   - `clsx` — Conditional className utility
   - `tailwind-merge` — Merge Tailwind classes
3. **Adds `cn()` utility**: Located at `lib/utils.ts` (or custom path)
4. **Configures Tailwind**: Updates `tailwind.config.ts` with theme tokens
5. **Sets up CSS variables**: Adds color tokens to global CSS

## Configuration File (components.json)

Example configuration:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Key Settings

- `style`: Component style variant ("default" or "new-york")
- `rsc`: React Server Components support (true for App Router)
- `tsx`: TypeScript usage
- `tailwind.baseColor`: Base color palette
- `tailwind.cssVariables`: Use CSS variables for theming
- `aliases`: Import path aliases

## Adding Components

### Single Component

```bash
npx shadcn@latest add button
```

### Multiple Components

```bash
npx shadcn@latest add button card dialog
```

### All Components

```bash
npx shadcn@latest add --all
```

**Note**: Components are copied to `components/ui/` directory. You own the code.

## Project Structure

After initialization:

```
app/
  globals.css              # Updated with CSS variables
components/
  ui/                      # shadcn components installed here
    button.tsx
    card.tsx
    ...
lib/
  utils.ts                 # cn() utility function
components.json            # shadcn configuration
tailwind.config.ts         # Updated with theme tokens
```

## The cn() Utility

Located at `lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Used for conditional and merged Tailwind classes:

```typescript
<Button className={cn("bg-blue-500", isActive && "bg-green-500")} />
```

## Common Components

Popular components to start with:

```bash
npx shadcn@latest add button card input label dialog
```

### Button Example

```typescript
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div>
      <Button>Click me</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  )
}
```

### Form Example

```bash
npx shadcn@latest add form input label
```

```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Page() {
  return (
    <form>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Email" />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## Customization

### Modify Components

Components are in your codebase — edit directly:

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700", // Custom color
        outline: "border border-input bg-background hover:bg-accent",
        // Add custom variants
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
    },
  }
)
```

### Theme Colors

Update CSS variables in `app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%; /* Custom primary color */
    --primary-foreground: 210 40% 98%;
    /* ... other variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode colors */
  }
}
```

## Dark Mode

shadcn/ui uses `next-themes` for dark mode.

### Install next-themes

```bash
pnpm add next-themes
```

### Add Theme Provider

```typescript
// app/providers.tsx
"use client"

import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

### Wrap App

```typescript
// app/layout.tsx
import { Providers } from "./providers"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Theme Toggle Component

```bash
npx shadcn@latest add dropdown-menu
```

```typescript
// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## TypeScript Configuration

Ensure `tsconfig.json` includes path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Auto-configured by `create-next-app --ts`.

## App Router vs Pages Router

shadcn/ui works with both, but App Router is recommended:

### App Router (Recommended)
- Server Components by default
- Better performance
- Co-located component files

### Pages Router
- Set `"rsc": false` in `components.json`
- All components client-side

## Integration with Forms

### React Hook Form + Zod

```bash
pnpm add react-hook-form zod @hookform/resolvers
npx shadcn@latest add form
```

Example:

```typescript
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(2).max(50),
})

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Common Package Manager Issues

### npm ERESOLVE Errors

If using npm and encountering peer dependency conflicts:

```bash
npm install --legacy-peer-deps
```

### Recommended: Use pnpm or bun

These handle peer dependencies better:

```bash
pnpm add <package>
# or
bun add <package>
```

## Troubleshooting

### Import errors after init
- Verify `tsconfig.json` has correct path aliases
- Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")

### Components not styled correctly
- Check `globals.css` imported in `app/layout.tsx`
- Verify Tailwind configured properly
- Ensure `cn()` utility exists at `lib/utils.ts`

### CSS variable colors not working
- Confirm `tailwind.config.ts` has `cssVariables: true`
- Check `globals.css` has `:root` color definitions
- Verify Tailwind's `@layer base` is present

## Updating Components

shadcn/ui components are copied into your project, so updates are manual:

1. Check component changelog: https://ui.shadcn.com/docs/changelog
2. Re-run `npx shadcn@latest add <component>` with `--force`:
   ```bash
   npx shadcn@latest add button --force
   ```
3. Review changes and merge custom modifications

## Resources

- Official docs: https://ui.shadcn.com
- Component examples: https://ui.shadcn.com/docs/components
- GitHub: https://github.com/shadcn-ui/ui
- Discord: https://discord.gg/shadcn-ui
