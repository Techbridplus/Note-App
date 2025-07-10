"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Plus, Search, Pin, PinOff, Edit, Trash2, LogOut, FileText } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Note } from "../../generated/prisma"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NoteCard } from "@/components/Note-Card"
import axios from "axios"
import { ThemeToggle } from "@/components/theme-customizer"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "" })
  const [toggleNote, setToggleNote] = useState<Note | null>(null)
  const [editNote, setEditNote] = useState({ title: "", content: "" })
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes()
    } else if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  const fetchNotes = async () => {
    try {
      const response = await axios.get("/api/notes")
      setNotes(response.data.notes)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }


  // Add new note
  const handleCreateNote = async () => {
    setCreating(true)

    try {
      const response = await axios.post("/api/notes", newNote)
      setNotes([response.data.note, ...notes])
      setNewNote({ title: "", content: "" })
      setIsAddDialogOpen(false)
      toast.success("Note created successfully!")
    } catch (error) {
      console.error(error)
      toast.error( "Failed to create note")
    } finally {
      setCreating(false)
    }
  }

  // Update existing note
  const updateNote = async () => {
    if (!editingNote) return
    setCreating(true)

    try {
      const response = await axios.patch(`/api/notes/${editingNote.id}`, {
        title: editNote.title || "Untitled",
        content: editNote.content,
      })

      setNotes(notes.map((note) =>
        note.id === editingNote.id ? response.data.note : note
      ))
      setEditingNote(null)
      setEditNote({ title: "", content: "" })
      toast.success("Note updated successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update note")
    } finally {
      setCreating(false)
    }
  }

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    try {
      await axios.delete(`/api/notes/${noteId}`)
      setNotes(notes.filter((note) => note.id !== noteId))
      toast.success("Note deleted successfully!")
      setNoteToDelete(null) // Close dialog
    } catch (error) {
      console.error(error)
      toast.error( "Failed to delete note")
    }
  }

  // Toggle pin status
  const togglePin = async (id: string) => {
    try {
      const note = notes.find(n => n.id === id)
      if (!note) return
      setToggleNote(note)
      setNotes(notes.map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } : note
      ))
      const response = await axios.patch(`/api/notes/${id}`, {
        isPinned: !note.isPinned
      })

      if (response.status !== 200) {
        toast.success("something went wrong")
        setNotes(notes.map((note) =>
          note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } : note
        ))
      }
    } catch (error) {
      setNotes(notes.map((note) =>
        toggleNote?.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() } : note
      ))
      console.error(error)
      toast.error("Failed to update pin status")
    } finally {
      setToggleNote(null)
    }
  }

  // Start editing a note
  const startEdit = (note: Note) => {
    setEditingNote(note)
    setEditNote({ title: note.title, content: note.content })
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingNote(null)
    setEditNote({ title: "", content: "" })
  }

  // Start viewing a note
  const startView = (note: Note) => {
    setViewingNote(note)
  }

  // Close view dialog
  const closeView = () => {
    setViewingNote(null)
  }

  // Edit from view mode
  const editFromView = (note: Note) => {
    setViewingNote(null)
    startEdit(note)
  }

  // Filter notes based on search query (now searches HTML content too)
  const filteredNotes = notes.filter((note) => {
    const searchLower = searchQuery.toLowerCase()
    const titleMatch = note.title.toLowerCase().includes(searchLower)
    // Strip HTML tags for searching content
    const contentText = note.content.replace(/<[^>]*>/g, "").toLowerCase()
    const contentMatch = contentText.includes(searchLower)
    return titleMatch || contentMatch
  })

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((note) => note.isPinned)
  const otherNotes = filteredNotes.filter((note) => !note.isPinned)


  // Get preview text from HTML content
  const getPreviewText = (htmlContent: string, maxLength = 150) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, "")
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + "..." : textContent
  }

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" })
      toast.success("Logged out successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Logout failed")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    )
  }


  if (status === "unauthenticated") {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {session?.user && (
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                    <AvatarFallback>
                      {session.user.name
                        ? session.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Welcome, {session.user.name || session.user.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">


              <ThemeToggle />

              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search and Add Note */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
          if (!open) setNewNote({title: "", content: "" });
  }}>
          <DialogTrigger asChild>
            <Button className="gap-2" variant={"secondary"}>
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create New Note
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="text-lg font-medium"
                disabled={creating}
              />
              <RichTextEditor
                content={newNote.content}
                onChange={(content) => setNewNote({ ...newNote, content })}
                placeholder="Start writing your note... Use the toolbar for formatting!"
                className="min-h-[200px]"
                disabled={creating}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNote} disabled={creating} className="gap-2" variant={"secondary"}>
                  <Plus className="h-4 w-4" />
                  Create Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>

        {/* Notes Display */ }
  <div className="space-y-8">
    {/* Pinned Notes */}
    {pinnedNotes.length > 0 && (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Pin className="h-4 w-4" />
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pinned</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pinnedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onView={startView}
              onEdit={startEdit}
              onDelete={() => setNoteToDelete(note)}
              onTogglePin={togglePin}
              getPreviewText={getPreviewText}
            />
          ))}
        </div>
      </section>
    )}

    {/* Other Notes */}
    {otherNotes.length > 0 && (
      <section>
        {pinnedNotes.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Others</h2>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {otherNotes.map((note, key) => (
            <NoteCard
              key={key}
              note={note}
              onView={startView}
              onEdit={startEdit}
              onDelete={() => setNoteToDelete(note)}
              onTogglePin={togglePin}
              getPreviewText={getPreviewText}
            />
          ))}
        </div>
      </section>
    )}

    {/* Empty State */}
    {filteredNotes.length === 0 && (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">{searchQuery ? "No notes found" : "No notes yet"}</h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery ? "Try adjusting your search terms" : "Create your first note with rich formatting!"}
        </p>
        {!searchQuery && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2" variant={"secondary"}>
            <Plus className="h-4 w-4" />
            Create Your First Note
          </Button>
        )}
      </div>
    )}
  </div>

  {/* Edit Note Dialog */ }
  <Dialog open={!!editingNote} onOpenChange={cancelEdit}>
    <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Edit Note
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Input
          placeholder="Note title..."
          value={editNote.title}
          onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
          className="text-lg font-medium "
          disabled={creating}
        />
        <RichTextEditor
          content={editNote.content}
          onChange={(content) => setEditNote({ ...editNote, content })}
          placeholder="Edit your note..."
          className="min-h-[200px]"
          disabled={creating}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={cancelEdit}>
            Cancel
          </Button>
          <Button onClick={updateNote} disabled={creating} className="gap-2" variant={"secondary"}>
            <Edit className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  {/* View Note Dialog */ }
  <Dialog open={!!viewingNote} onOpenChange={closeView}>
    <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-start justify-between gap-4">
          {viewingNote?.isPinned ? (
            <Badge variant="secondary" className="gap-1">
              <Pin className="h-3 w-3" />
              Pinned
            </Badge>
          ) : <div></div>}
          <div className="flex items-center gap-1 md:pr-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => viewingNote && togglePin(viewingNote.id)}
              className="h-8 w-8"
              title={viewingNote?.isPinned ? "Unpin note" : "Pin note"}
            >
              {viewingNote?.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => viewingNote && editFromView(viewingNote)}
              className="h-8 w-8"
              title="Edit note"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (viewingNote) {
                  setNoteToDelete(viewingNote)
                  closeView()
                }
              }}
              className="h-8 w-8 text-destructive hover:text-destructive"
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

        </div>
        <div className="flex-1">
          <DialogTitle className="text-xl text-start font-semibold leading-tight break-all whitespace-pre-line">
            {viewingNote?.title?.trim() ? viewingNote.title : <span className="text-gray-500">Untitled</span>}
          </DialogTitle>
        </div>
      </DialogHeader>

      <div className="mt-6">
        <div
          className="prose prose-sm max-w-full leading-relaxed break-all whitespace-pre-line
                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-foreground
                  [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-foreground
                  [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground
                  [&_p]:mb-3 [&_p]:text-foreground [&_p]:leading-relaxed
                  [&_strong]:font-semibold [&_strong]:text-foreground
                  [&_em]:italic
                  [&_u]:underline
                  [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 
                  [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground
                  [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-3 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-3 [&_ol]:space-y-1
                  [&_li]:text-foreground [&_li]:leading-relaxed
                  [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                  [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
                  [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
          dangerouslySetInnerHTML={{
            __html: viewingNote?.content || '<p class="text-muted-foreground italic">No content</p>',
          }}
        />
      </div>

      <div className="flex justify-end items-center gap-4 mt-2 text-xs text-muted-foreground w-full">
        <span>Created: {viewingNote?.createdAt ? new Date(viewingNote.createdAt).toLocaleDateString() : 'N/A'}</span>
        <span>Updated: {viewingNote?.updatedAt ? new Date(viewingNote.updatedAt).toLocaleDateString() : 'N/A'}</span>
      </div>
    </DialogContent>
  </Dialog>

  {/* Delete Confirmation Dialog */ }
  <AlertDialog open={!!noteToDelete} onOpenChange={() => setNoteToDelete(null)}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Delete Note
        </AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete &quot;
          {noteToDelete?.title
            ? noteToDelete.title.length > 30
              ? noteToDelete.title.slice(0, 30) + "..."
              : noteToDelete.title
            : ""}
          &quot;? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => noteToDelete && handleDeleteNote(noteToDelete.id)}
          className="bg-destructive/80 text-white hover:bg-destructive"
        >
          Delete Note
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
      </main >
    </div >
  )
}


