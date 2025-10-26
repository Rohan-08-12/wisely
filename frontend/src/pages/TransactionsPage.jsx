import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, Calendar, Filter } from 'lucide-react'
import api from '../services/api'

const TransactionsPage = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    category: '',
    limit: 50
  })

  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)
      if (filters.category) params.append('category', filters.category)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await api.get(`/transactions?${params.toString()}`)
      return response.data
    },
  })

  const categories = [
    'Coffee', 'Restaurants', 'Gas', 'Groceries', 
    'Entertainment', 'Shopping', 'Healthcare', 
    'Transportation', 'Other'
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load transactions</p>
        <p className="text-sm text-gray-600 mt-2">
          {error.response?.data?.error?.message || 'Please try again later'}
        </p>
      </div>
    )
  }

  const { items: transactions = [], nextCursor } = transactionsData || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">From Date</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="input"
            />
          </div>
          
          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="input"
            />
          </div>
          
          <div>
            <label className="label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="input"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Transactions ({transactions.length})
          </h2>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {filters.from || filters.to || filters.category 
                ? 'Try adjusting your filters to see more transactions.'
                : 'Connect your bank account to start tracking transactions.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.merchantName || transaction.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(transaction.date).toLocaleDateString()}
                      {transaction.category && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {transaction.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'DEBIT' ? '-' : '+'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionsPage

