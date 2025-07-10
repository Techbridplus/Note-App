"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, LogOut, Trash2 } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Note {
  _id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newNote, setNewNote] = useState({ title: "", content: "" })
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes()
    } else if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes)
      } else {
        toast.error("Failed to fetch notes")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      })

      if (response.ok) {
        const data = await response.json()
        setNotes([data.note, ...notes])
        setNewNote({ title: "", content: "" })
        setIsCreateModalOpen(false)
        toast.success("Note created successfully!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create note")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotes(notes.filter((note) => note._id !== noteId))
        toast.success("Note deleted successfully!")
      } else {
        toast.error("Failed to delete note")
      }
    } catch (error) {
      toast.error("Network error")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" })
      toast.success("Logged out successfully!")
    } catch (error) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
            <div className="flex items-center space-x-4">
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
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2" variant={"secondary"}>
                    <Plus className="w-4 h-4" />
                    <span>New Note</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateNote} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        placeholder="Enter note title..."
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        placeholder="Write your note here..."
                        required
                        rows={6}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creating}>
                        {creating ? "Creating..." : "Create Note"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first note!</p>
            <Button onClick={() => setIsCreateModalOpen(true)} variant={"secondary"}>Create Your First Note</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold truncate">{note.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-4 mb-4">{note.content}</p>
                  <p className="text-xs text-gray-400">Created {new Date(note.createdAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
