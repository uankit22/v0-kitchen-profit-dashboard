"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, RadialBarChart, RadialBar } from "recharts"
import { TrendingUp, PieChartIcon, BarChart3, Calendar, ReceiptIndianRupeeIcon } from "lucide-react"
import type { Transaction } from "@/lib/api"

interface AnalyticsDashboardProps {
  transactions: Transaction[]
}

export default function AnalyticsDashboard({ transactions }: AnalyticsDashboardProps) {
  const expenses = transactions.filter((t) => t.type === "Expense")
  const revenues = transactions.filter((t) => t.type === "Revenue")

  const radialData = useMemo(() => {
    const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const netProfit = totalRevenue - totalExpenses

    // Find the maximum value to normalize the data for radial display
    const maxValue = Math.max(totalRevenue, totalExpenses, netProfit)

    return [
      {
        name: "Revenue",
        value: totalRevenue,
        fill: "#10b981",
        percentage: maxValue > 0 ? (totalRevenue / maxValue) * 100 : 0,
      },
      {
        name: "Expenses",
        value: totalExpenses,
        fill: "#ef4444",
        percentage: maxValue > 0 ? (totalExpenses / maxValue) * 100 : 0,
      },
      {
        name: netProfit >= 0 ? "Profit" : "Loss",
        value: netProfit,
        fill: netProfit >= 0 ? "#3b82f6" : "#f59e0b",
        percentage: maxValue > 0 ? (Math.abs(netProfit) / maxValue) * 100 : 0,
        isLoss: netProfit < 0,
        actualValue: netProfit, // Store the actual value for tooltip
      },
    ]
  }, [transactions, revenues, expenses])

  // Process data for expense categories pie chart
  const expenseCategories = useMemo(() => {
    const categories: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      categories[expense.category_source] = (categories[expense.category_source] || 0) + expense.amount
    })

    return Object.entries(categories).map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
  }, [expenses])

  // Process data for revenue sources
  const revenueSources = useMemo(() => {
    const sources: { [key: string]: number } = {}

    revenues.forEach((revenue) => {
      sources[revenue.category_source] = (sources[revenue.category_source] || 0) + revenue.amount
    })

    return Object.entries(sources).map(([source, amount]) => ({
      name: source,
      value: amount,
    }))
  }, [revenues])

  // Calculate key metrics
  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0"

  // Estimate average order value (simplified calculation)
  const avgOrderValue = revenues.length > 0 ? (totalRevenue / revenues.length).toFixed(0) : "0"

  const CHART_COLORS = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#84cc16", // Lime
    "#ec4899", // Pink
    "#6b7280", // Gray
  ]

  const EXPENSE_COLORS = [
    "#ef4444", // Red
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#f97316", // Orange
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#ec4899", // Pink
    "#14b8a6", // Teal
  ]

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <ReceiptIndianRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Profit Margin</p>
                <p className="text-sm sm:text-lg font-bold text-green-600 dark:text-green-400">{profitMargin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Avg Transaction</p>
                <p className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">₹{avgOrderValue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Revenue Entries</p>
                <p className="text-sm sm:text-lg font-bold text-purple-600 dark:text-purple-400">{revenues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground truncate">Total Transactions</p>
                <p className="text-sm sm:text-lg font-bold text-orange-600 dark:text-orange-400">
                  {transactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Financial Overview
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Radial comparison of revenue, expenses, and profit
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {radialData.every((item) => item.value === 0) ? (
              <div className="h-[200px] sm:h-[320px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                  <p className="text-xs">Add transactions to see charts</p>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-hidden">
                <ChartContainer
                  config={{
                    revenue: { label: "Revenue", color: "#10b981" },
                    expenses: { label: "Expenses", color: "#ef4444" },
                    profit: { label: "Profit", color: "#3b82f6" },
                  }}
                  className="h-[200px] sm:h-[320px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="80%"
                      data={radialData}
                      startAngle={90}
                      endAngle={450}
                    >
                      <RadialBar
                        dataKey="percentage"
                        cornerRadius={8}
                        fill={(entry) => entry.fill}
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border bg-background p-3 shadow-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }} />
                                  <span className="font-medium">{data.name}</span>
                                </div>
                                <div className="mt-1">
                                  <span className="text-lg font-bold">
                                    ₹
                                    {data.actualValue !== undefined
                                      ? data.actualValue < 0
                                        ? `-${Math.abs(data.actualValue).toLocaleString()}`
                                        : data.actualValue.toLocaleString()
                                      : data.value.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({data.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: entry.color }}>
                            {value}: ₹
                            {entry.payload.actualValue !== undefined
                              ? entry.payload.actualValue < 0
                                ? `-${Math.abs(entry.payload.actualValue).toLocaleString()}`
                                : entry.payload.actualValue.toLocaleString()
                              : entry.payload.value.toLocaleString()}
                          </span>
                        )}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              Expense Categories
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Breakdown of expenses by category</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {expenseCategories.length === 0 ? (
              <div className="h-[200px] sm:h-[280px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChartIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No expense data</p>
                  <p className="text-xs">Add expenses to see breakdown</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full overflow-hidden">
                  <ChartContainer
                    config={{ expenses: { label: "Expenses" } }}
                    className="h-[180px] sm:h-[220px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          outerRadius="65%"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                          fontSize={12}
                        >
                          {expenseCategories.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              const percentage = ((data.value / totalExpenses) * 100).toFixed(1)
                              return (
                                <div className="rounded-lg border bg-background p-3 shadow-lg">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor:
                                          EXPENSE_COLORS[
                                            expenseCategories.findIndex((cat) => cat.name === data.name) %
                                              EXPENSE_COLORS.length
                                          ],
                                      }}
                                    />
                                    <span className="font-medium">{data.name}</span>
                                  </div>
                                  <div className="mt-1">
                                    <span className="text-lg font-bold">₹{data.value.toLocaleString()}</span>
                                    <span className="text-sm text-muted-foreground ml-2">({percentage}%)</span>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  {expenseCategories.map((category, index) => {
                    const percentage = ((category.value / totalExpenses) * 100).toFixed(1)
                    return (
                      <div key={category.name} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{category.value.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{percentage}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Sources */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            Revenue Sources
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Breakdown of revenue by platform</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {revenueSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No revenue data available</p>
              <p className="text-xs">Add payouts to see revenue breakdown</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {revenueSources.map((source, index) => {
                const percentage = ((source.value / totalRevenue) * 100).toFixed(1)
                return (
                  <div
                    key={source.name}
                    className="p-4 rounded-lg border bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-sm truncate">{source.name}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {percentage}%
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-primary mb-3">
                      ₹{source.value.toLocaleString()}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
