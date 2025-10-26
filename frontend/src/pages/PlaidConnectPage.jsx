import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'

const PlaidConnectPage = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const queryClient = useQueryClient()

  const connectMutation = useMutation({
    mutationFn: async () => {
      // Get link token
      const linkTokenResponse = await api.post('/plaid/link-token', {
        client_user_id: 'user_' + Date.now()
      })
      
      const { link_token, message } = linkTokenResponse.data
      
      // Open Plaid Link
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token) => {
          try {
            // Exchange public token for access token
            const response = await api.post('/plaid/exchange', {
              public_token
            })
            
            setConnectionStatus({
              success: true,
              message: `Successfully connected to ${response.data.institution}`,
              transactionsImported: response.data.transactionsImported
            })
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries(['dashboard'])
            queryClient.invalidateQueries(['transactions'])
            
          } catch (error) {
            setConnectionStatus({
              success: false,
              message: error.response?.data?.error?.message || 'Connection failed'
            })
          } finally {
            setIsConnecting(false)
          }
        },
        onExit: (err, metadata) => {
          setIsConnecting(false)
          if (err) {
            setConnectionStatus({
              success: false,
              message: err?.error_message || 'Connection was cancelled'
            })
          }
        },
        onEvent: (eventName, metadata) => {
          console.log('Plaid event:', eventName, metadata)
        }
      })
      
      handler.open()
      setIsConnecting(true)
    },
    onError: (error) => {
      setConnectionStatus({
        success: false,
        message: error.response?.data?.error?.message || error.message || 'Failed to connect to Plaid'
      })
      setIsConnecting(false)
    }
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/plaid/sync')
      return response.data
    },
    onSuccess: (data) => {
      setConnectionStatus({
        success: true,
        message: `Synced ${data.imported} new transactions`
      })
      queryClient.invalidateQueries(['dashboard'])
      queryClient.invalidateQueries(['transactions'])
    },
    onError: (error) => {
      setConnectionStatus({
        success: false,
        message: error.response?.data?.error?.message || 'Sync failed'
      })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Connect Bank Account</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Connection Status */}
        {connectionStatus && (
          <div className={`card mb-6 ${
            connectionStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center">
              {connectionStatus.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  connectionStatus.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {connectionStatus.message}
                </p>
                {connectionStatus.transactionsImported && (
                  <p className="text-xs text-green-600 mt-1">
                    {connectionStatus.transactionsImported} transactions imported
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="card text-center">
          <LinkIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Bank Account
          </h2>
          <p className="text-gray-600 mb-6">
            Securely connect your bank account using Plaid to automatically track your transactions and monitor your spending goals.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => connectMutation.mutate()}
              disabled={isConnecting || connectMutation.isPending}
              className="btn btn-primary w-full"
            >
              {isConnecting || connectMutation.isPending ? 'Connecting...' : 'Connect Bank Account'}
            </button>

            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="btn btn-secondary w-full"
            >
              {syncMutation.isPending ? 'Syncing...' : 'Sync Transactions'}
            </button>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm">
              Your banking credentials are never stored. We use bank-level security through Plaid to keep your data safe.
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Automatic Tracking</h3>
            <p className="text-gray-600 text-sm">
              Once connected, your transactions are automatically imported and categorized to help you track your spending goals.
            </p>
          </div>
        </div>

        {/* Sandbox Notice */}
        <div className="card border-yellow-200 bg-yellow-50 mt-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Sandbox Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This app is currently running in sandbox mode. You'll connect to Plaid's test environment with sample data.
                In production, this would connect to real bank accounts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaidConnectPage

