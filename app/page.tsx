"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { IndianRupeeIcon, TrendingUp, TrendingDown, Plus, ReceiptIndianRupeeIcon, BarChart3, PieChart, Loader2, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAnimatedCounter } from "@/hooks/use-animated-counter"
import { useAuth } from "@/contexts/auth-context"
import AddTransactionForm from "@/components/add-transaction-form"
import TransactionsTable from "@/components/transactions-table"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import Footer from "@/components/footer"
import AuthWrapper from "@/components/auth-wrapper"
import RestaurantNameManager from "@/components/restaurant-name-manager"
import { getTransactionSummary, getTransactions, type Transaction, type TransactionSummary } from "@/lib/api"

function Dashboard() {
  const { toast } = useToast()
  const { logout } = useAuth()
  const currentDate = new Date()
  const currentMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const [activeTab, setActiveTab] = useState("overview")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary>({ revenue: 0, expense: 0, profit_loss: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const animatedRevenue = useAnimatedCounter(summary.revenue, 2000)
  const animatedExpenses = useAnimatedCounter(summary.expense, 2000)
  const animatedProfit = useAnimatedCounter(summary.profit_loss, 2000)

  const loadData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      console.log("[v0] Starting to load dashboard data...")
      const [summaryData, transactionsData] = await Promise.all([getTransactionSummary(), getTransactions()])

      console.log("[v0] Data loaded successfully:", { summaryData, transactionsCount: transactionsData.length })
      setSummary(summaryData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error("[v0] Failed to load data:", error)
      toast({
        title: "Error",
        description: `Failed to load dashboard data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTransactionAdded = async () => {
    await loadData(true)
    toast({
      title: "Success",
      description: "Transaction added successfully!",
    })
  }

  const handleTransactionDeleted = async () => {
    await loadData(true)
    toast({
      title: "Success",
      description: "Transaction deleted successfully!",
    })
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
  }

  const expenses = transactions.filter((t) => t.type === "Expense")
  const revenues = transactions.filter((t) => t.type === "Revenue")
  const profitMargin = summary.revenue > 0 ? ((summary.profit_loss / summary.revenue) * 100).toFixed(1) : "0"

  // Get recent transactions for overview
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map((transaction) => ({
      id: transaction.id,
      type: transaction.type.toLowerCase() as "expense" | "revenue",
      name: transaction.description,
      source: transaction.category_source,
      amount: transaction.amount,
      date: new Date(transaction.created_at).toLocaleDateString(),
    }))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
                <ReceiptIndianRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <RestaurantNameManager />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                {currentMonthYear}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing}>
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">₹{animatedRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From {revenues.length} payouts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-destructive">
                  ₹{animatedExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">From {expenses.length} expenses</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <IndianRupeeIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-xl sm:text-2xl font-bold ${summary.profit_loss >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  ₹{animatedProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{profitMargin}% profit margin</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-4 min-w-[320px]">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="add-transaction" className="text-xs sm:text-sm">
                  Add
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm">
                  History
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Manage your expenses and revenue entries</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <Button
                      onClick={() => setActiveTab("add-transaction")}
                      className="w-full justify-start h-10 sm:h-11"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Transaction
                    </Button>
                    <Button
                      onClick={() => setActiveTab("analytics")}
                      className="w-full justify-start h-10 sm:h-11"
                      variant="outline"
                    >
                      <PieChart className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                    <CardDescription>Latest transactions and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {recentTransactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent transactions. Start by adding expenses or payouts.
                        </p>
                      ) : (
                        recentTransactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                  transaction.type === "revenue" ? "bg-primary" : "bg-destructive"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{transaction.name}</p>
                                <p className="text-xs text-muted-foreground">{transaction.date}</p>
                              </div>
                            </div>
                            <span
                              className={`text-sm font-medium flex-shrink-0 ml-2 ${
                                transaction.type === "revenue" ? "text-primary" : "text-destructive"
                              }`}
                            >
                              {transaction.type === "revenue" ? "+" : "-"}₹{transaction.amount}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="add-transaction">
              <AddTransactionForm onTransactionAdded={handleTransactionAdded} />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionsTable transactions={transactions} onTransactionDeleted={handleTransactionDeleted} />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard transactions={transactions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function Page() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  )
}
