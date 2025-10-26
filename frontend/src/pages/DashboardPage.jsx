import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Target, TrendingUp, CreditCard, Bell, Plus } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isCreatingGoal, setIsCreatingGoal] = useState(false)
  
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard')
      return response.data
    },
  })

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      const response = await api.post('/goals', goalData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['goals'])
      queryClient.invalidateQueries(['dashboard'])
      setIsCreatingGoal(false)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    )
  }

  const { goals = [], recentTransactions = [], notifications = {} } = dashboard || {}

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-6xl font-bold italic text-gray-900 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Hello, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-lg text-gray-500 mt-2">Let's manage your finances together</p>
        </div>
        <div className="flex items-center space-x-4">
          {notifications.unread > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Bell className="h-4 w-4 mr-1" />
              {notifications.unread} notifications
            </div>
          )}
          <Link
            to="/goals"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Link>
        </div>
      </div>

      {/* Goals Overview - Grid Layout */}
      <div className="grid grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-orange-50 rounded-2xl p-6 shadow-sm hover:bg-orange-100 hover:shadow-md transition-all border border-orange-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  goal.type === 'LIMIT' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {goal.type}
                </span>
              </div>
              
              {goal.progress && (
                <div className="space-y-3">
                  {goal.type === 'LIMIT' ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent this {goal.progress.periodStart ? 'week' : 'month'}</span>
                        <span className="font-semibold">${goal.progress.spend}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            goal.progress.percent >= 100 ? 'bg-red-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(100, goal.progress.percent)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>${goal.progress.remaining.toFixed(2)} remaining</span>
                        <span>{goal.progress.percent.toFixed(1)}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-orange-600">${goal.progress.current}</span>
                      </div>
                      <div className="w-full bg-orange-100 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-orange-500 transition-all"
                          style={{ width: `${Math.min(100, goal.progress.percent)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>${goal.progress.target.toFixed(2)} target</span>
                        <span className="text-orange-600 font-semibold">{goal.progress.percent.toFixed(1)}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Add New Goal Button */}
          <button
            onClick={() => setIsCreatingGoal(true)}
            className="bg-orange-50 rounded-2xl p-6 shadow-sm hover:bg-orange-100 hover:shadow-md transition-all border-2 border-dashed border-orange-300 hover:border-orange-400 flex items-center justify-center group"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-orange-400 mx-auto mb-2 group-hover:text-orange-600 transition-colors" />
              <p className="text-sm text-orange-500 group-hover:text-orange-600 transition-colors">New Goal</p>
            </div>
          </button>
      </div>

      {/* Create Goal Modal */}
      {isCreatingGoal && (
        <GoalFormModal
          onSubmit={(goalData) => createGoalMutation.mutate(goalData)}
          onCancel={() => setIsCreatingGoal(false)}
          isLoading={createGoalMutation.isPending}
        />
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            <Link
              to="/transactions"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.merchantName || transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                    </p>
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
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Track Spending</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Connect your bank account to automatically track transactions and monitor your spending goals.
          </p>
          <Link to="/connect" className="btn btn-primary">
            Connect Bank Account
          </Link>
        </div>
        
        <div className="card">
          <div className="flex items-center mb-4">
            <Target className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Set Goals</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Create spending limits and savings goals to stay on track with your financial objectives.
          </p>
          <Link to="/goals" className="btn btn-primary">
            Manage Goals
          </Link>
        </div>
      </div>
    </div>
  )
}

// Goal Form Modal Component
const GoalFormModal = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'LIMIT',
    category: '',
    period: 'WEEK',
    maxSpend: '',
    targetAmount: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      title: formData.title,
      type: formData.type,
    }

    if (formData.type === 'LIMIT') {
      submitData.category = formData.category
      submitData.period = formData.period
      submitData.maxSpend = parseFloat(formData.maxSpend)
    } else {
      submitData.targetAmount = parseFloat(formData.targetAmount)
    }

    onSubmit(submitData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Create New Goal
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Coffee Budget"
              required
            />
          </div>

          <div>
            <label className="label">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
            >
              <option value="LIMIT">Spending Limit</option>
              <option value="SAVINGS">Savings Goal</option>
            </select>
          </div>

          {formData.type === 'LIMIT' && (
            <>
              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Food">Food</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Period</label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="WEEK">Week</option>
                  <option value="MONTH">Month</option>
                </select>
              </div>

              <div>
                <label className="label">Max Spend ($)</label>
                <input
                  type="number"
                  name="maxSpend"
                  value={formData.maxSpend}
                  onChange={handleChange}
                  className="input"
                  placeholder="100"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </>
          )}

          {formData.type === 'SAVINGS' && (
            <div>
              <label className="label">Target Amount ($)</label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                className="input"
                placeholder="1000"
                step="0.01"
                min="0"
                required
              />
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Goal'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DashboardPage
