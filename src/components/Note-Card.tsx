"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Note } from "../../generated/prisma"
import { Pin, PinOff, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"



export function NoteCard({
    note,
    onView,
    onEdit,
    onDelete,
    onTogglePin,
    getPreviewText,
}: {
    note: Note
    onView: (note: Note) => void
    onEdit: (note: Note) => void
    onDelete: (id: string) => void
    onTogglePin: (id: string) => void
    getPreviewText: (content: string, maxLength?: number) => string
}) {
    const [showActions, setShowActions] = useState(false)

    return (
        <Card
            className="group relative transition-shadow duration-200 hover:shadow-2xl cursor-pointer max-w-xs w-full dark:shadow-gray-600"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            onClick={() => onView(note)}
        >
            <CardHeader className="pb-3 ">
                <div className="flex items-start justify-between gap-2 overflow-hidden " >
                    <h3 className="font-medium line-clamp-2 truncate flex-1  max-w-[180px]"
                    title={note.title }
                    >{note.title.length > 40 ? note.title.slice(0, 40) + "..." : (note.title.length > 0 ?note.title:"Untitled")}</h3>

                    {showActions && (
                        <div className=" items-center gap-1 h-5 hidden  md:flex">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onTogglePin(note.id)
                                }}
                                className="h-8 w-8"
                                title={note.isPinned ? "Unpin note" : "Pin note"}
                            >
                                {note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(note)
                                }}
                                className="h-8 w-8"
                                title="Edit note"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(note.id)
                                }}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                title="Delete note"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {note.isPinned && (
                    <Badge variant="secondary" className="w-fit">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                {/* Rich content preview */}
                <div
                    className="text-sm text-muted-foreground line-clamp-4 prose prose-sm max-w-full overflow-hidden
              [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mb-1 [&_h1]:mt-0
              [&_h2]:text-sm [&_h2]:font-medium [&_h2]:mb-1 [&_h2]:mt-0
              [&_p]:mb-1 [&_p]:mt-0
              [&_strong]:font-semibold
              [&_em]:italic
              [&_u]:underline
              [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-2 [&_blockquote]:italic
              [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-1
              [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-1
              [&_li]:mb-0"
                    dangerouslySetInnerHTML={{ __html: note.content || "No content" }}
                />
                <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">{new Date(note.updatedAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground line-clamp-4 prose prose-sm max-w-full overflow-hidden">
                        {note.content && (
                            <span className="opacity-60">
                                {getPreviewText(note.content).length > 0
                                    ? `${getPreviewText(note.content, 50).split(" ").length} words`
                                    : ""}
                            </span>
                        )}
                        <span className="text-xs opacity-60">Click to read</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}