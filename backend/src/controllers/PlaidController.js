const { PrismaClient } = require('@prisma/client');
const PlaidService = require('../services/plaidService');

const prisma = new PrismaClient();

class PlaidController {
  // POST /api/plaid/link-token
  static async createLinkToken(req, res, next) {
    try {
      const { client_user_id } = req.body;

      if (!client_user_id) {
        return res.status(400).json({
          error: {
            code: 'MISSING_USER_ID',
            message: 'client_user_id is required'
          }
        });
      }

      // Try to get real Plaid link token
      try {
        const linkToken = await PlaidService.createLinkToken(client_user_id);
        res.json({
          link_token: linkToken
        });
      } catch (error) {
        // If Plaid fails, return error
        console.error('Plaid link token error:', error);
        res.status(400).json({
          error: {
            code: 'PLAID_ERROR',
            message: 'Failed to create Plaid link. Please check your Plaid credentials in .env',
            details: error.message
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // POST /api/plaid/exchange
  static async exchangePublicToken(req, res, next) {
    try {
      const { public_token } = req.body;

      if (!public_token) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PUBLIC_TOKEN',
            message: 'public_token is required'
          }
        });
      }

      // Exchange public token for access token
      const { access_token, item_id } = await PlaidService.exchangePublicToken(public_token);

      // Get institution info
      const institution = await PlaidService.getInstitution(access_token);

      // Store Plaid item in database
      const plaidItem = await prisma.plaidItem.create({
        data: {
          userId: req.user.id,
          accessToken: access_token,
          itemId: item_id,
          institution: institution
        }
      });

      // Skip initial transaction fetch to avoid Plaid API errors
      // User can manually sync transactions later

      res.json({
        itemId: item_id,
        institution: institution,
        transactionsImported: 0,
        message: "Bank connected successfully! Use 'Sync Transactions' button to fetch transactions."
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/plaid/sync (dev only)
  static async syncTransactions(req, res, next) {
    try {
      // Find user's Plaid items
      const plaidItems = await prisma.plaidItem.findMany({
        where: { userId: req.user.id }
      });

      if (plaidItems.length === 0) {
        return res.status(404).json({
          error: {
            code: 'NO_PLAID_ITEMS',
            message: 'No Plaid items found for user'
          }
        });
      }

      let totalImported = 0;

      for (const item of plaidItems) {
        // Fetch transactions (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const transactions = await PlaidService.fetchTransactions(
          item.accessToken,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );

        // Process and store transactions
        const processedTransactions = await PlaidService.processTransactions(
          req.user.id,
          transactions
        );

        totalImported += processedTransactions.length;
      }

      res.json({
        imported: totalImported
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/plaid/webhook
  static async handleWebhook(req, res, next) {
    try {
      const { webhook_type, webhook_code, item_id } = req.body;

      console.log('Plaid webhook received:', { webhook_type, webhook_code, item_id });

      // Handle different webhook types
      if (webhook_type === 'TRANSACTIONS' && webhook_code === 'INITIAL_UPDATE') {
        // Handle initial transaction update
        console.log('Initial transaction update for item:', item_id);
      } else if (webhook_type === 'TRANSACTIONS' && webhook_code === 'HISTORICAL_UPDATE') {
        // Handle historical transaction update
        console.log('Historical transaction update for item:', item_id);
      }

      res.json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}

module.exports = PlaidController;
