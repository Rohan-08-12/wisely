import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Target, Trash2, Edit } from 'lucide-react'
import api from '../services/api'

const GoalsPage = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const queryClient = useQueryClient()

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await api.get('/goals')
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
      setIsCreating(false)
    },
  })

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...goalData }) => {
      const response = await api.patch(`/goals/${id}`, goalData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['goals'])
      queryClient.invalidateQueries(['dashboard'])
      setEditingGoal(null)
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/goals/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['goals'])
      queryClient.invalidateQueries(['dashboard'])
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </button>
      </div>

      {/* Create Goal Modal */}
      {isCreating && (
        <GoalForm
          onSubmit={(goalData) => createGoalMutation.mutate(goalData)}
          onCancel={() => setIsCreating(false)}
          isLoading={createGoalMutation.isPending}
        />
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <GoalForm
          goal={editingGoal}
          onSubmit={(goalData) => updateGoalMutation.mutate({ id: editingGoal.id, ...goalData })}
          onCancel={() => setEditingGoal(null)}
          isLoading={updateGoalMutation.isPending}
        />
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals?.length === 0 ? (
          <div className="col-span-full">
            <div className="card text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first goal to start tracking your financial progress
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="btn btn-primary"
              >
                Create Your First Goal
              </button>
            </div>
          </div>
        ) : (
          goals?.map((goal) => (
            <div key={goal.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingGoal(goal)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteGoalMutation.mutate(goal.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Limit Set:</span>
                          <span className="text-base font-semibold text-gray-900">${goal.maxSpend}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Spent:</span>
                          <span className={`text-base font-semibold ${
                            goal.progress.percent >= 100 ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            ${goal.progress.spend}
                          </span>
                        </div>
                        {goal.progress.percent >= 100 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-red-600">Exceeded by:</span>
                            <span className="text-base font-semibold text-red-600">
                              ${(goal.progress.spend - goal.maxSpend).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            goal.progress.percent >= 100 ? 'bg-red-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(100, goal.progress.percent)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {goal.progress.percent < 100 
                            ? `$${goal.progress.remaining.toFixed(2)} remaining`
                            : 'Limit exceeded!'
                          }
                        </span>
                        <span className="font-medium">{goal.progress.percent.toFixed(1)}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Target:</span>
                          <span className="text-base font-semibold text-gray-900">${goal.targetAmount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Saved:</span>
                          <span className="text-base font-semibold text-orange-600">
                            ${goal.progress.current}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-orange-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-orange-500 transition-all"
                          style={{ width: `${Math.min(100, goal.progress.percent)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          ${(goal.targetAmount - goal.progress.current).toFixed(2)} to go
                        </span>
                        <span className="text-orange-600 font-medium">{goal.progress.percent.toFixed(1)}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const GoalForm = ({ goal, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    type: goal?.type || 'LIMIT',
    category: goal?.category || '',
    period: goal?.period || 'WEEK',
    maxSpend: goal?.maxSpend || '',
    targetAmount: goal?.targetAmount || '',
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
          {goal ? 'Edit Goal' : 'Create New Goal'}
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
                  <option value="Coffee">Coffee</option>
                  <option value="Restaurants">Restaurants</option>
                  <option value="Gas">Gas</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
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
                  <option value="WEEK">Weekly</option>
                  <option value="MONTH">Monthly</option>
                </select>
              </div>

              <div>
                <label className="label">Maximum Spend ($)</label>
                <input
                  type="number"
                  name="maxSpend"
                  value={formData.maxSpend}
                  onChange={handleChange}
                  className="input"
                  placeholder="75.00"
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
                placeholder="1000.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Saving...' : (goal ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GoalsPage

