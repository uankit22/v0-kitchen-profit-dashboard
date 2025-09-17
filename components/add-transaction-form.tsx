"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, IndianRupee, Loader2, Smartphone, Truck, ReceiptIndianRupee } from "lucide-react"
import { createTransaction } from "@/lib/api"

interface AddTransactionFormProps {
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

const revenueSources = [
  { value: "Zomato", label: "Zomato", icon: Smartphone },
  { value: "Swiggy", label: "Swiggy", icon: Truck },
  { value: "Direct Orders", label: "Direct Orders", icon: CreditCard },
  { value: "Other", label: "Other Platform", icon: CreditCard },
]

export default function AddTransactionForm({ onTransactionAdded }: AddTransactionFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    amount: "",
    category_source: "",
    orderCount: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.amount || !formData.category_source) {
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
      let description = formData.description
      if (formData.type === "Revenue") {
        description = `${formData.category_source} payout`
      } else if (!description) {
        description = `${formData.category_source} expense`
      }

      await createTransaction({
        type: formData.type as "Expense" | "Revenue",
        description,
        category_source: formData.category_source,
        amount: Number(formData.amount),
      })

      // Reset form
      setFormData({
        type: "",
        description: "",
        amount: "",
        category_source: "",
        orderCount: "",
        notes: "",
      })

      onTransactionAdded()
    } catch (error) {
      console.error("Failed to add transaction:", error)
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
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

  const isExpense = formData.type === "Expense"
  const isRevenue = formData.type === "Revenue"

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
            {isExpense ? (
              <div className="p-1.5 sm:p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                <ReceiptIndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
            ) : isRevenue ? (
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            )}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Transaction Entry
            </span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Record your kitchen's financial transactions with ease. Date and time are automatically captured.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <Label htmlFor="type" className="text-sm sm:text-base font-semibold text-foreground">
                Transaction Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  handleInputChange("type", value)
                  handleInputChange("category_source", "")
                }}
              >
                <SelectTrigger className="h-11 sm:h-12 border-2 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Choose transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Expense" className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/20">
                        <ReceiptIndianRupee className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="font-medium">Expense</div>
                        <div className="text-xs text-muted-foreground">Record business costs</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="Revenue" className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
                        <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium">Revenue</div>
                        <div className="text-xs text-muted-foreground">Record income sources</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type && (
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm sm:text-base font-semibold text-foreground">
                  {isExpense ? "Expense Category" : "Revenue Source"} *
                </Label>
                <Select
                  value={formData.category_source}
                  onValueChange={(value) => handleInputChange("category_source", value)}
                >
                  <SelectTrigger className="h-11 sm:h-12 border-2 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder={`Select ${isExpense ? "expense category" : "revenue source"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {isExpense
                      ? expenseCategories.map((category) => (
                          <SelectItem key={category} value={category} className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              {category}
                            </div>
                          </SelectItem>
                        ))
                      : revenueSources.map((source) => {
                          const Icon = source.icon
                          return (
                            <SelectItem key={source.value} value={source.value} className="py-2">
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4 text-green-600" />
                                {source.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="amount" className="text-sm sm:text-base font-semibold text-foreground">
                Amount (₹) *
              </Label>
              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                  <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-primary font-bold" />
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="h-11 sm:h-12 pl-10 sm:pl-12 text-base sm:text-lg font-medium border-2 hover:border-primary/50 focus:border-primary transition-colors"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                />
              </div>
            </div>

            {isExpense && (
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm sm:text-base font-semibold text-foreground">
                  Expense Description (Optional)
                </Label>
                <Input
                  id="description"
                  placeholder="e.g., Fresh vegetables, Monthly electricity bill"
                  className="h-11 sm:h-12 border-2 hover:border-primary/50 focus:border-primary transition-colors"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isSubmitting}
              variant={isExpense ? "destructive" : isRevenue ? "default" : "default"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-3 animate-spin" />
                  Processing {formData.type}...
                </>
              ) : (
                <>
                  {isExpense ? (
                    <ReceiptIndianRupee className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                  ) : isRevenue ? (
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                  ) : (
                    <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                  )}
                  Add {formData.type || "Transaction"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-muted/30">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              Choose the transaction type first to see relevant categories
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              For expenses, add specific descriptions for better tracking
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              Revenue descriptions are automatically generated from the source
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              Date and time are automatically recorded when you submit
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
