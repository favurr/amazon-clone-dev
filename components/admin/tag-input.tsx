"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function TagInput({ value = [], onChange, placeholder }: TagInputProps) {
  const [pendingValue, setPendingValue] = React.useState("")

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().replace(/;/g, "")
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag])
    }
    setPendingValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ";" || e.key === "Enter") {
      e.preventDefault()
      addTag(pendingValue)
    } else if (e.key === "Backspace" && !pendingValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 min-h-12 w-full rounded-md border border-input bg-white shadow-sm focus-within:ring-1 focus-within:ring-ring">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="ml-1 hover:text-destructive"
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
      <input
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm min-w-[120px]"
        placeholder={value.length === 0 ? placeholder : ""}
        value={pendingValue}
        onChange={(e) => setPendingValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(pendingValue)}
      />
    </div>
  )
}