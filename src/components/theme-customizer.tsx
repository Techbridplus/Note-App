"use client"

import React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"





export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (

    <Button variant="ghost" size="icon" onClick={()=>(theme == "light"?setTheme("dark"):setTheme("light"))} className="h-9 w-9">
      {theme=="dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}



