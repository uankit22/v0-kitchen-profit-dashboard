"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, Trash2, ReceiptIndianRupeeIcon, CreditCard, Calendar, IndianRupeeIcon, Loader2 } from "lucide-react"
import { deleteTransaction, type Transaction } from "@/lib/api"

interface TransactionsTableProps {
  transactions: Transaction[]
  onTransactionDeleted: () => void
}

type TransactionType = "all" | "Expense" | "Revenue"

export default function TransactionsTable({ transactions, onTransactionDeleted }: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<TransactionType>("all")
  const [sortBy, setSortBy] = useState<"date" | "amount">("date")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter and search transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      if (filterType !== "all" && transaction.type !== filterType) return false

      const searchLower = searchTerm.toLowerCase()
      return (
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category_source.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        return b.amount - a.amount
      }
    })

  const handleDelete = async (transaction: Transaction) => {
    setDeletingId(transaction.id)
    try {
      await deleteTransaction(transaction.id)
      onTransactionDeleted()
    } catch (error) {
      console.error("Failed to delete transaction:", error)
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const expenses = transactions.filter((t) => t.type === "Expense")
  const revenues = transactions.filter((t) => t.type === "Revenue")
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ReceiptIndianRupeeIcon className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-bold text-destructive">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupeeIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-lg font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                  ₹{netProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>View and manage all your expenses and revenue entries</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={(value: TransactionType) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="Expense">Expenses Only</SelectItem>
                <SelectItem value="Revenue">Revenue Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: "date" | "amount") => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="amount">Sort by Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Try adjusting your search terms" : "Start by adding some expenses or payouts"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category/Source</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge variant={transaction.type === "Expense" ? "destructive" : "default"} className="text-xs">
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transaction.category_source}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(transaction.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-medium ${
                            transaction.type === "Expense" ? "text-destructive" : "text-primary"
                          }`}
                        >
                          {transaction.type === "Expense" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              disabled={deletingId === transaction.id}
                            >
                              {deletingId === transaction.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{transaction.description}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
