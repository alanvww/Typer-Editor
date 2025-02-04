'use client'

import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count'
import { useState } from "react"
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Code, Quote,
  Minus, Undo, Redo, X, Eye, Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import Preview from '@/components/Preview'

const Tiptap = () => {
  // State for document title, preview visibility, and saved content
  const [title, setTitle] = useState("Untitled Document")
  const [showPreview, setShowPreview] = useState(false)
  const [savedContent, setSavedContent] = useState<{ json: JSONContent; html: string } | null>(null)

  // Initialize TipTap editor with extensions and configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: '<p>Start typing...</p>',
    editorProps: {
      attributes: {
        class: 'tiptap w-full h-full min-h-[calc(100vh-300px)] resize-none bg-transparent border-none focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto'
      }
    },
  })

  // Handle saving content to backend
  const saveContent = async () => {
    if (!editor) return

    const json = editor.getJSON()
    const html = editor.getHTML()

    setSavedContent({ json, html })

    try {
      const response = await fetch('/api/save-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: json,
          html,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save document')
      }

      console.log('Document saved successfully')
    } catch (error) {
      console.error('Error saving document:', error)
    }
  }

  // Style toggle handlers for text formatting
  const toggleStyle = (style: string) => {
    if (!editor) return

    switch (style) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'underline':
        editor.chain().focus().toggleUnderline().run()
        break
      case 'code':
        editor.chain().focus().toggleCode().run()
        break
      case 'strike':
        editor.chain().focus().toggleStrike().run()
        break
    }
  }

  // Handle text alignment changes
  const toggleAlignment = (align: 'left' | 'center' | 'right') => {
    if (!editor) return
    editor.chain().focus().setTextAlign(align).run()
  }

  // Handle list formatting
  const toggleList = (type: 'bullet' | 'ordered') => {
    if (!editor) return

    if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run()
    } else {
      editor.chain().focus().toggleOrderedList().run()
    }
  }

  // Handle block-level formatting
  const toggleBlock = (type: string) => {
    if (!editor) return

    switch (type) {
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run()
        break
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run()
        break
      case 'horizontalRule':
        editor.chain().focus().setHorizontalRule().run()
        break
    }
  }

  if (!editor) return null

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-5xl mx-auto">
        {/* Main Toolbar Section */}
        <div className="border-b p-2 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <TooltipProvider>
              {/* Heading Style Selector */}
              <div className="flex items-center gap-1 mr-4">
                <Select
                  defaultValue="normal"
                  onValueChange={(value) => {
                    if (value === 'normal') {
                      editor.chain().focus().setParagraph().run()
                    } else {
                      const level = parseInt(value.replace('h', ''))
                      editor.chain().focus().toggleHeading({ level }).run()
                    }
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Text</SelectItem>
                    <SelectItem value="h1">Heading 1</SelectItem>
                    <SelectItem value="h2">Heading 2</SelectItem>
                    <SelectItem value="h3">Heading 3</SelectItem>
                    <SelectItem value="h4">Heading 4</SelectItem>
                    <SelectItem value="h5">Heading 5</SelectItem>
                    <SelectItem value="h6">Heading 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text Formatting Section */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('bold') ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => toggleStyle('bold')}
                      className="w-8 h-8"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('italic') ? 'default' : 'ghost'}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => toggleStyle('italic')}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('underline') ? 'default' : 'ghost'}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => toggleStyle('underline')}
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Underline</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive('code') ? 'default' : 'ghost'}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => toggleStyle('code')}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Code</TooltipContent>
                </Tooltip>
              </div>

              {/* Text Alignment Section */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button
                  variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => toggleAlignment('left')}
                  className="w-8 h-8"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => toggleAlignment('center')}
                  className="w-8 h-8"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => toggleAlignment('right')}
                  className="w-8 h-8"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>

              {/* List Controls Section */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button
                  variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => toggleList('bullet')}
                  className="w-8 h-8"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => toggleList('ordered')}
                  className="w-8 h-8"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>

              {/* Block Controls Section */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button
                  variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => toggleBlock('blockquote')}
                  className="w-8 h-8"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => toggleBlock('codeBlock')}
                  className="w-8 h-8"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleBlock('horizontalRule')}
                  className="w-8 h-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>

              {/* History Controls Section */}
              <div className="flex items-center gap-1 border-r pr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="w-8 h-8"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="w-8 h-8"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              {/* Clear Formatting Section */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    editor.chain().focus().clearNodes().unsetAllMarks().run()
                  }}
                  className="w-8 h-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </TooltipProvider>
          </div>

          {/* Document Actions Section */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={saveContent}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>

            {/* Preview Dialog */}
            <Dialog
              open={showPreview}
              onOpenChange={(open) => {
                if (open && editor) {
                  // Set a small delay to ensure DOM is ready
                  setTimeout(() => {
                    setShowPreview(true);
                  }, 100);
                } else {
                  setShowPreview(false);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-4xl h-[90vh] overflow-hidden flex flex-col"
                aria-describedby="preview-description"
              >
                <DialogHeader>
                  <DialogTitle>{title} - Preview</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto mt-4">
                  {editor && showPreview && (
                    <Preview
                      html={editor.getHTML()}
                      title={title}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Editor Content Section */}
        <CardContent className="p-0">
          {/* Document Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-8 py-4 text-2xl font-semibold bg-transparent border-none focus:outline-none"
            placeholder="Document Title"
          />

          {/* TipTap Editor Content */}
          <div className="px-8 pb-4">
            <EditorContent editor={editor} />
          </div>
        </CardContent>

        {/* Footer Section */}
        <div className="border-t p-2 flex justify-between items-center text-sm text-muted-foreground">
          {/* Character Count */}
          <span>
            {editor?.storage.characterCount.characters() ?? 0}{" "}
            {editor?.storage.characterCount.characters() === 1 ? "character" : "characters"}
          </span>

          {/* Save Status */}
          {savedContent && (
            <span className="text-green-600">
              Last saved at {new Date().toLocaleTimeString()}
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Tiptap