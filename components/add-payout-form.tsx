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
import { CalendarDays, CreditCard, DollarSign, Smartphone, Truck, Loader2 } from "lucide-react"
import { createTransaction } from "@/lib/api"

interface AddPayoutFormProps {
  onTransactionAdded: () => void
}

const payoutSources = [
  { value: "Zomato", label: "Zomato", icon: Smartphone },
  { value: "Swiggy", label: "Swiggy", icon: Truck },
  { value: "Direct Orders", label: "Direct Orders", icon: CreditCard },
  { value: "Other", label: "Other Platform", icon: CreditCard },
]

export default function AddPayoutForm({ onTransactionAdded }: AddPayoutFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    category_source: "",
    amount: "",
    orderCount: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category_source || !formData.amount) {
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

    if (formData.orderCount && (isNaN(Number(formData.orderCount)) || Number(formData.orderCount) <= 0)) {
      toast({
        title: "Invalid Order Count",
        description: "Please enter a valid order count greater than 0.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const description =
        formData.description ||
        `${formData.category_source} payout${formData.orderCount ? ` (${formData.orderCount} orders)` : ""}`

      await createTransaction({
        type: "Revenue",
        description,
        category_source: formData.category_source,
        amount: Number(formData.amount),
      })

      // Reset form
      setFormData({
        description: "",
        category_source: "",
        amount: "",
        orderCount: "",
        notes: "",
      })

      onTransactionAdded()
    } catch (error) {
      console.error("Failed to add payout:", error)
      toast({
        title: "Error",
        description: "Failed to add payout. Please try again.",
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

  const selectedSource = payoutSources.find((source) => source.value === formData.category_source)
  const SourceIcon = selectedSource?.icon || CreditCard

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Add Revenue Payout
          </CardTitle>
          <CardDescription>
            Record revenue received from delivery platforms or direct orders. Date and time will be automatically
            generated.
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

            {/* Source Platform */}
            <div className="space-y-2">
              <Label htmlFor="source">Revenue Source *</Label>
              <Select
                value={formData.category_source}
                onValueChange={(value) => handleInputChange("category_source", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue source" />
                </SelectTrigger>
                <SelectContent>
                  {payoutSources.map((source) => {
                    const Icon = source.icon
                    return (
                      <SelectItem key={source.value} value={source.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {source.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Payout Amount (₹) *</Label>
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

            {/* Order Count (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="orderCount">Number of Orders (Optional)</Label>
              <Input
                id="orderCount"
                type="number"
                placeholder="e.g., 25"
                min="1"
                value={formData.orderCount}
                onChange={(e) => handleInputChange("orderCount", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Helps calculate average order value for analytics</p>
            </div>

            {/* Custom Description (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="description">Custom Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Weekly settlement, Special promotion payout"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank to auto-generate description</p>
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional details about this payout..."
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
                  Adding Payout...
                </>
              ) : (
                "Add Payout"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <span className="font-medium">Zomato</span>
              </div>
              <p className="text-sm text-muted-foreground">Record payouts from Zomato orders and commissions</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="font-medium">Swiggy</span>
              </div>
              <p className="text-sm text-muted-foreground">Record payouts from Swiggy orders and commissions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Record payouts as soon as you receive them</li>
            <li>• Include order count to track average order values</li>
            <li>• Use "Direct Orders" for customers who order directly</li>
            <li>• Date and time are automatically recorded when you submit</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
