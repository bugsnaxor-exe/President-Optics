"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-md bg-transparent p-2 gap-3 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-1 py-2 text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
      // Default state - subtle background
      "bg-gradient-to-r from-muted/20 to-muted/10 text-muted-foreground border border-muted/30",
      // Hover state - eye-catching glow
      "hover:shadow-[0_0_6px_hsl(var(--primary)/0.8),0_0_12px_hsl(var(--primary)/0.4),inset_0_1px_0_hsl(var(--primary)/0.1)] hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 hover:text-primary hover:border-primary/50",
      // Active state - dramatic persistent glow
      "data-[state=active]:shadow-[0_0_8px_hsl(var(--primary)/1),0_0_16px_hsl(var(--primary)/0.6),0_0_24px_hsl(var(--primary)/0.3),inset_0_2px_0_hsl(var(--primary)/0.2)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/70 data-[state=active]:font-semibold",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
