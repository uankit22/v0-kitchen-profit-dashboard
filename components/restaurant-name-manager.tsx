"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Store, Edit3, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRestaurantName, setRestaurantName } from "@/lib/auth"

interface RestaurantNameManagerProps {
  onNameSet?: (name: string) => void
}

export default function RestaurantNameManager({ onNameSet }: RestaurantNameManagerProps) {
  const [restaurantName, setRestaurantNameState] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadRestaurantName()
  }, [])

  const loadRestaurantName = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading restaurant name...")
      const response = await getRestaurantName()
      console.log("[v0] Restaurant name response:", response)
      setRestaurantNameState(response.restaurant_name)
    } catch (error) {
      console.error("[v0] Failed to load restaurant name:", error)
      if (error instanceof Error && error.message.includes("Authentication failed")) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        })
      } else if (error instanceof Error && !error.message.includes("404")) {
        toast({
          title: "Error",
          description: error.message || "Failed to load restaurant name",
          variant: "destructive",
        })
      }
      setRestaurantNameState(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a restaurant name",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      console.log("[v0] Saving restaurant name:", newName.trim())
      await setRestaurantName(newName.trim())
      setRestaurantNameState(newName.trim())
      setIsEditing(false)
      setNewName("")
      onNameSet?.(newName.trim())
      toast({
        title: "Success",
        description: "Restaurant name updated successfully!",
      })
    } catch (error) {
      console.error("[v0] Failed to save restaurant name:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update restaurant name",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = () => {
    setNewName(restaurantName || "")
    setIsEditing(true)
  }

  const handleCancel = () => {
    setNewName("")
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!restaurantName) {
    return (
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter restaurant name"
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName()
                } else if (e.key === "Escape") {
                  handleCancel()
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleSaveName} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Store className="h-4 w-4 mr-2" />
            Add Restaurant Name
          </Button>
        )}
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter restaurant name"
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSaveName()
            } else if (e.key === "Escape") {
              handleCancel()
            }
          }}
          autoFocus
        />
        <Button size="sm" onClick={handleSaveName} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-lg sm:text-xl font-bold text-foreground">{restaurantName}</h1>
      <Button variant="ghost" size="sm" onClick={handleEdit}>
        <Edit3 className="h-4 w-4" />
      </Button>
    </div>
  )
}
