


import * as React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Paintbrush, Gem, Leaf, Palette, Zap, Waves, Sunset, TreePine, Droplets } from 'lucide-react';

const themes = [
    { name: 'Ocean Green', value: 'ocean-green', icon: Droplets },
    { name: 'Cyberpunk', value: 'cyberpunk', icon: Zap },
    { name: 'Ocean', value: 'ocean', icon: Waves },
    { name: 'Sunset', value: 'sunset', icon: Sunset },
    { name: 'Forest', value: 'forest', icon: TreePine },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={theme === themeOption.value ? "bg-accent" : ""}
            >
                <themeOption.icon className="mr-2 h-4 w-4" />
                <span>{themeOption.name}</span>
                {theme === themeOption.value && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
