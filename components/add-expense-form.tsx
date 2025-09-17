"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Receipt, DollarSign, Loader2 } from "lucide-react"
import { createTransaction } from "@/lib/api"

interface AddExpenseFormProps {
  onTransactionAdded: () => void
}

const expenseCategories = [
  "Food",
  "Ingredients",
  "Packaging",
  "Utilities",
  "Rent",
  "Staff Wages",
  "Marketing",
  "Equipment",
  "Transportation",
  "Other",
]

export default function AddExpenseForm({ onTransactionAdded }: AddExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category_source: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.amount || !formData.category_source) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createTransaction({
        type: "Expense",
        description: formData.description,
        category_source: formData.category_source,
        amount: Number(formData.amount),
      })

      // Reset form
      setFormData({
        description: "",
        amount: "",
        category_source: "",
        notes: "",
      })

      onTransactionAdded()
    } catch (error) {
      console.error("Failed to add expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const currentDateTime = new Date()
  const currentDate = currentDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const currentTime = currentDateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Add New Expense
          </CardTitle>
          <CardDescription>
            Record a new expense for your cloud kitchen. Date and time will be automatically generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auto-generated Date/Time Display */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Entry Date & Time</p>
                <p className="text-xs text-muted-foreground">
                  {currentDate} at {currentTime}
                </p>
              </div>
            </div>

            {/* Expense Name */}
            <div className="space-y-2">
              <Label htmlFor="expense-name">Expense Name *</Label>
              <Input
                id="expense-name"
                placeholder="e.g., Vegetables purchase, Electricity bill"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-10"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_source}
                onValueChange={(value) => handleInputChange("category_source", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expense category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional details about this expense..."
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Expense...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Be specific with expense names for better tracking</li>
            <li>• Choose the most appropriate category for accurate reporting</li>
            <li>• Add notes for unusual or large expenses</li>
            <li>• Date and time are automatically recorded when you submit</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
