const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

class PlaidService {
  // Create link token for Plaid Link
  static async createLinkToken(clientUserId) {
    try {
      const request = {
        user: {
          client_user_id: clientUserId,
        },
        client_name: 'Wisely',
        products: [process.env.PLAID_PRODUCTS],
        country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
        language: 'en',
        webhook: process.env.PLAID_WEBHOOK_URL,
      };

      const response = await plaidClient.linkTokenCreate(request);
      return response.data.link_token;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw new Error('Failed to create link token');
    }
  }

  // Exchange public token for access token
  static async exchangePublicToken(publicToken) {
    try {
      const request = {
        public_token: publicToken,
      };

      const response = await plaidClient.itemPublicTokenExchange(request);
      return {
        access_token: response.data.access_token,
        item_id: response.data.item_id,
      };
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw new Error('Failed to exchange public token');
    }
  }

  // Get institution info
  static async getInstitution(accessToken) {
    try {
      const request = {
        access_token: accessToken,
      };

      const response = await plaidClient.institutionsGetById({
        institution_id: 'ins_109508',
        country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
      });

      return response.data.institution.name;
    } catch (error) {
      console.error('Error getting institution:', error);
      return 'Plaid Sandbox';
    }
  }

  // Fetch transactions
  static async fetchTransactions(accessToken, startDate, endDate) {
    try {
      const request = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
      };

      const response = await plaidClient.transactionsGet(request);
      return response.data.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      // Handle different Plaid errors gracefully
      if (error.response?.data?.error_code === 'PRODUCT_NOT_READY') {
        console.log('Plaid product not ready yet, returning empty transactions array');
        return [];
      }
      
      if (error.response?.data?.error_code === 'INVALID_API_KEYS') {
        console.error('Invalid Plaid credentials');
        throw new Error('Invalid Plaid credentials. Please check your CLIENT_ID and SECRET in .env');
      }
      
      throw error;
    }
  }

  // Normalize category for our system
  static normalizeCategory(plaidCategory) {
    if (!plaidCategory || !Array.isArray(plaidCategory)) {
      return 'Other';
    }

    const categoryMap = {
      'Food and Drink': 'Restaurants',
      'Coffee Shops': 'Coffee',
      'Fast Food': 'Restaurants',
      'Gas Stations': 'Gas',
      'Groceries': 'Groceries',
      'Transportation': 'Transportation',
      'Entertainment': 'Entertainment',
      'Shopping': 'Shopping',
      'Healthcare': 'Healthcare',
      'Education': 'Education',
      'Travel': 'Travel',
      'Utilities': 'Utilities',
      'Insurance': 'Insurance',
      'Fees': 'Fees',
    };

    const primaryCategory = plaidCategory[0];
    return categoryMap[primaryCategory] || 'Other';
  }

  // Process and store transactions
  static async processTransactions(userId, transactions) {
    const processedTransactions = [];

    for (const transaction of transactions) {
      try {
        // Check if transaction already exists
        const existingTransaction = await prisma.transaction.findUnique({
          where: { plaidTransactionId: transaction.transaction_id }
        });

        if (existingTransaction) {
          continue;
        }

        // Determine transaction type and amount
        const amount = Math.abs(transaction.amount);
        const type = transaction.amount > 0 ? 'CREDIT' : 'DEBIT';
        const category = this.normalizeCategory(transaction.category);

        // Create transaction
        const newTransaction = await prisma.transaction.create({
          data: {
            userId,
            amount,
            type,
            date: new Date(transaction.date),
            description: transaction.name,
            merchantName: transaction.merchant_name || transaction.name,
            category,
            plaidTransactionId: transaction.transaction_id,
          }
        });

        processedTransactions.push(newTransaction);
      } catch (error) {
        console.error('Error processing transaction:', error);
        // Continue processing other transactions
      }
    }

    return processedTransactions;
  }
}

module.exports = PlaidService;

