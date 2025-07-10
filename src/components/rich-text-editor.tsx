"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Quote,
  Highlighter,
  Type,
} from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
  disabled = false,
}: RichTextEditorProps) {
  const [highlightActive, setHighlightActive] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isToolbarVisible, setIsToolbarVisible] = useState(false)


  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (highlightActive) {
        document.execCommand("hiliteColor", false, "#ffeb3b");
      } else {
        document.execCommand("hiliteColor", false, "inherit");
      }
    }
  }, [highlightActive]);


  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content
    }
  }, [content])

  const executeCommand = (command: string, value?: string) => {
    if (disabled) return
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleContentChange()
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
    }
  }

  const handleFocus = () => {
    setIsToolbarVisible(true)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Only hide toolbar if focus is not moving to a toolbar button
    if (!e.relatedTarget || !e.relatedTarget.closest(".toolbar")) {
      setTimeout(() => setIsToolbarVisible(false), 150)
    }
  }

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command)
  }

  const toolbarButtons = [
    { command: "bold", icon: Bold, label: "Bold" },
    { command: "italic", icon: Italic, label: "Italic" },
    { command: "underline", icon: Underline, label: "Underline" },
  ]

  const formatButtons = [
    { command: "formatBlock", value: "h1", icon: Heading1, label: "Heading 1" },
    { command: "formatBlock", value: "h2", icon: Heading2, label: "Heading 2" },
    { command: "formatBlock", value: "blockquote", icon: Quote, label: "Quote" },
    { command: "formatBlock", value: "p", icon: Type, label: "Paragraph" },
  ]

  const listButtons = [
    { command: "insertUnorderedList", icon: List, label: "Bullet List" },
    { command: "insertOrderedList", icon: ListOrdered, label: "Numbered List" },
  ]

  const alignButtons = [
    { command: "justifyLeft", icon: AlignLeft, label: "Align Left" },
    { command: "justifyCenter", icon: AlignCenter, label: "Align Center" },
    { command: "justifyRight", icon: AlignRight, label: "Align Right" },
  ]

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      {isToolbarVisible && !disabled && (
        <div className="toolbar sticky top-0 z-10 bg-background border border-border rounded-t-lg p-2 flex flex-wrap items-center gap-1 shadow-sm">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            {toolbarButtons.map(({ command, icon: Icon, label }) => (
              <Button
                key={command}
                variant={isCommandActive(command) ? "default" : "ghost"}
                size="sm"
                onClick={() => executeCommand(command)}
                title={label}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Block Formatting */}
          <div className="flex items-center gap-1">
            {formatButtons.map(({ command, value, icon: Icon, label }) => (
              <Button
                key={`${command}-${value}`}
                variant="ghost"
                size="sm"
                onClick={() => executeCommand(command, value)}
                title={label}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            {listButtons.map(({ command, icon: Icon, label }) => (
              <Button
                key={command}
                variant={isCommandActive(command) ? "default" : "ghost"}
                size="sm"
                onClick={() => executeCommand(command)}
                title={label}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            {alignButtons.map(({ command, icon: Icon, label }) => (
              <Button
                key={command}
                variant={isCommandActive(command) ? "default" : "ghost"}
                size="sm"
                onClick={() => executeCommand(command)}
                title={label}
                className="h-8 w-8 p-0"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Special Formatting */}
          <Button
            variant={highlightActive ? "default" : "ghost"}
            size="sm"
            onClick={() => setHighlightActive((prev) => !prev)}
            title="Highlight"
            className="h-8 w-8 p-0"
          >
            <Highlighter className="h-4 w-4" />
          </Button>

        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleContentChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          min-h-[120px] p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring
          ${isToolbarVisible && !disabled ? "rounded-t-none border-t-0" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          prose prose-sm max-w-none break-all
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
          [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5
          [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2
          [&_li]:my-1
          [&_p]:my-2
          [&_strong]:font-bold
          [&_em]:italic
          [&_u]:underline
        `}
        data-placeholder={placeholder}
        style={{
          minHeight: "120px",
        }}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
