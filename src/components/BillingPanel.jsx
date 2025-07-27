'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  Shield
} from 'lucide-react';
import { formatPrice } from '../lib/pricing';

export default function BillingPanel({ user }) {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPortal, setShowPortal] = useState(false);

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Simuler des données de facturation (remplacer par un vrai appel API)
      const mockData = {
        subscription: {
          id: 'sub_123456789',
          status: 'active',
          plan: 'pro',
          planName: 'Pro',
          currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          amount: 1900, // 19€ en centimes
          currency: 'eur'
        },
        invoices: [
          {
            id: 'in_123456789',
            amount: 1900,
            currency: 'eur',
            status: 'paid',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            pdf: 'https://example.com/invoice.pdf'
          },
          {
            id: 'in_123456788',
            amount: 1900,
            currency: 'eur',
            status: 'paid',
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            pdf: 'https://example.com/invoice.pdf'
          }
        ],
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025
        }
      };

      setBillingData(mockData);
    } catch (err) {
      setError('Erreur lors du chargement des données de facturation');
      console.error('Erreur billing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePortalAccess = async () => {
    try {
      const response = await fetch('/api/payment/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: billingData?.subscription?.customerId,
          returnUrl: window.location.href
        })
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Erreur portail client:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'past_due':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'past_due':
        return 'En retard';
      case 'canceled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'canceled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de la facturation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadBillingData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucun abonnement actif
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Vous n'avez pas encore souscrit à un plan payant.
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Voir les plans
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Facturation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez votre abonnement et vos factures
          </p>
        </div>
        <button
          onClick={handlePortalAccess}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Portail client</span>
        </button>
      </div>

      {/* Abonnement actuel */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Abonnement actuel
          </h3>
          <div className="flex items-center space-x-2">
            {getStatusIcon(billingData.subscription.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(billingData.subscription.status)}`}>
              {getStatusText(billingData.subscription.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {billingData.subscription.planName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Montant</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(billingData.subscription.amount / 100, billingData.subscription.currency.toUpperCase())}
              <span className="text-sm text-gray-500">/mois</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Prochain prélèvement</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {billingData.subscription.currentPeriodEnd.toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {billingData.subscription.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Votre abonnement sera annulé le {billingData.subscription.currentPeriodEnd.toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}
      </motion.div>

      {/* Méthode de paiement */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Méthode de paiement
        </h3>
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {billingData.paymentMethod.brand.toUpperCase()} •••• {billingData.paymentMethod.last4}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expire {billingData.paymentMethod.expMonth}/{billingData.paymentMethod.expYear}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Historique des factures */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historique des factures
        </h3>
        
        <div className="space-y-3">
          {billingData.invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(invoice.amount / 100, invoice.currency.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {invoice.date.toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'paid' 
                    ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                    : 'text-red-600 bg-red-100 dark:bg-red-900/20'
                }`}>
                  {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                </span>
                <a
                  href={invoice.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 