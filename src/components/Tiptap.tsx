'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useState } from "react"
import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const Tiptap = () => {
  const [title, setTitle] = useState("Untitled Document")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: '<p>Start typing...</p>',
    editorProps: {
      attributes: {
        class: 'w-full h-full min-h-[calc(100vh-300px)] resize-none bg-transparent border-none focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto'
      }
    }
  })

  if (!editor) return null

  const toggleStyle = (style: string) => {
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
    }
  }

  const toggleAlignment = (align: 'left' | 'center' | 'right') => {
    editor.chain().focus().setTextAlign(align).run()
  }

  const toggleList = (type: 'bullet' | 'ordered') => {
    if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run()
    } else {
      editor.chain().focus().toggleOrderedList().run()
    }
  }

  // Calculate word count from editor content
  const wordCount = editor?.storage.characterCount.characters() ?? 0

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-5xl mx-auto">
        <div className="border-b p-2 flex flex-wrap gap-2 items-center">
          <TooltipProvider>
            <div className="flex items-center gap-1 mr-4">
              <Select
                defaultValue="normal"
                onValueChange={(value) => {
                  if (value === 'normal') {
                    editor.chain().focus().setParagraph().run()
                  } else {
                    const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6
                    editor.chain().focus().toggleHeading({
                      level
                    }).run()
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
                </SelectContent>
              </Select>
            </div>

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
                    data-active={editor.isActive('italic')}
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
                    data-active={editor.isActive('underline')}
                  >
                    <UnderlineIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Underline</TooltipContent>
              </Tooltip>
            </div>

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

            <div className="flex items-center gap-1">
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
          </TooltipProvider>
        </div>

        <CardContent className="p-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-8 py-4 text-2xl font-semibold bg-transparent border-none focus:outline-none"
            placeholder="Document Title"
          />

          <div className="px-8 pb-4">
            <EditorContent editor={editor} />
          </div>
        </CardContent>

        <div className="border-t p-2 text-sm text-muted-foreground">
          {wordCount} {wordCount === 1 ? "character" : "characters"}
        </div>
      </Card>
    </div>
  )
}

export default Tiptap