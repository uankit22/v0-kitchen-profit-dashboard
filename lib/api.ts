import { getAuthToken } from "./auth"

const BASE_URL = "https://cloud-kitchen-backend-5dnj.onrender.com"

export interface Transaction {
  id: string
  type: "Expense" | "Revenue"
  description: string
  category_source: string
  amount: number
  created_at: string
}

export interface TransactionSummary {
  revenue: number
  expense: number
  profit_loss: number
}

export interface CreateTransactionRequest {
  type: "Expense" | "Revenue"
  description: string
  category_source: string
  amount: number
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Get transaction summary (revenue, expenses, profit/loss)
export async function getTransactionSummary(): Promise<TransactionSummary> {
  try {
    const response = await fetch(`${BASE_URL}/api/transactions/summary`, {
      method: "GET",
      headers: getAuthHeaders(), // Using authenticated headers
      mode: "cors",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error Response:", errorText)
      throw new Error(`Failed to fetch transaction summary: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Summary fetched successfully:", data)
    return data
  } catch (error) {
    console.error("[v0] Network error fetching summary:", error)
    throw new Error(`Failed to fetch transaction summary: ${error instanceof Error ? error.message : "Network error"}`)
  }
}

// Get all transactions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/transactions`, {
      method: "GET",
      headers: getAuthHeaders(), // Using authenticated headers
      mode: "cors",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error Response:", errorText)
      throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Transactions fetched successfully:", data)
    return data
  } catch (error) {
    console.error("[v0] Network error fetching transactions:", error)
    throw new Error(`Failed to fetch transactions: ${error instanceof Error ? error.message : "Network error"}`)
  }
}

// Create new transaction (expense or revenue)
export async function createTransaction(transaction: CreateTransactionRequest): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/transactions`, {
      method: "POST",
      headers: getAuthHeaders(), // Using authenticated headers
      mode: "cors",
      body: JSON.stringify(transaction),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error Response:", errorText)
      throw new Error(`Failed to create transaction: ${response.status} ${response.statusText}`)
    }

    console.log("[v0] Transaction created successfully")
  } catch (error) {
    console.error("[v0] Network error creating transaction:", error)
    throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : "Network error"}`)
  }
}

// Delete transaction
export async function deleteTransaction(id: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/transactions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(), // Using authenticated headers
      mode: "cors",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error Response:", errorText)
      throw new Error(`Failed to delete transaction: ${response.status} ${response.statusText}`)
    }

    console.log("[v0] Transaction deleted successfully")
  } catch (error) {
    console.error("[v0] Network error deleting transaction:", error)
    throw new Error(`Failed to delete transaction: ${error instanceof Error ? error.message : "Network error"}`)
  }
}
