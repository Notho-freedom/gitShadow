'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Download,
  Eye,
  RefreshCw,
  Settings,
  User,
  Shield,
  X
} from 'lucide-react';
import { formatPrice } from '../lib/pricing';

export default function BillingPanel({ user, onClose }) {
  const [activeTab, setActiveTab] = useState('subscription');
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Charger les données de facturation
      const [subscriptionData, invoicesData, paymentMethodsData] = await Promise.all([
        fetchSubscription(),
        fetchInvoices(),
        fetchPaymentMethods()
      ]);

      setSubscription(subscriptionData);
      setInvoices(invoicesData);
      setPaymentMethods(paymentMethodsData);
    } catch (err) {
      console.error('Erreur lors du chargement des données de facturation:', err);
      setError('Impossible de charger les données de facturation');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/payment/subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: user.email
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.activeSubscription ? {
          id: data.activeSubscription.id,
          status: data.activeSubscription.status,
          plan: data.activeSubscription.planId,
          planName: data.activeSubscription.planName || data.activeSubscription.planId,
          currentPeriodStart: new Date(data.activeSubscription.currentPeriodStart * 1000),
          currentPeriodEnd: new Date(data.activeSubscription.currentPeriodEnd * 1000),
          cancelAtPeriodEnd: data.activeSubscription.cancelAtPeriodEnd,
          amount: data.activeSubscription.amount,
          currency: data.activeSubscription.currency,
          trialEnd: data.activeSubscription.trialEnd ? new Date(data.activeSubscription.trialEnd * 1000) : null
        } : null;
      } else {
        console.log('Aucun abonnement actif trouvé');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      return null;
    }
  };

  const fetchInvoices = async () => {
    try {
      // D'abord récupérer le customerId
      const customerResponse = await fetch('/api/payment/subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: user.email
        }),
      });

      if (!customerResponse.ok) {
        return [];
      }

      const customerData = await customerResponse.json();
      const customerId = customerData.customer?.id;

      if (!customerId) {
        return [];
      }

      // Ensuite récupérer les factures
      const invoicesResponse = await fetch('/api/payment/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          limit: 10
        }),
      });

      if (invoicesResponse.ok) {
        const data = await invoicesResponse.json();
        return data.invoices.map(invoice => ({
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          created: new Date(invoice.created * 1000),
          hostedInvoiceUrl: invoice.hostedInvoiceUrl,
          invoicePdf: invoice.invoicePdf
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      return [];
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      // D'abord récupérer le customerId
      const customerResponse = await fetch('/api/payment/subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: user.email
        }),
      });

      if (!customerResponse.ok) {
        return [];
      }

      const customerData = await customerResponse.json();
      const customerId = customerData.customer?.id;

      if (!customerId) {
        return [];
      }

      // Ensuite récupérer les méthodes de paiement
      const paymentMethodsResponse = await fetch('/api/payment/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId
        }),
      });

      if (paymentMethodsResponse.ok) {
        const data = await paymentMethodsResponse.json();
        return data.paymentMethods.map(method => ({
          id: method.id,
          type: method.type,
          card: method.card,
          isDefault: method.isDefault || false
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des méthodes de paiement:', error);
      return [];
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payment/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(prev => ({
          ...prev,
          cancelAtPeriodEnd: true
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
      setError('Impossible d\'annuler l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(prev => ({
          ...prev,
          cancelAtPeriodEnd: false
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Erreur lors de la réactivation:', err);
      setError('Impossible de réactiver l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setLoading(true);
    try {
      // Si l'utilisateur n'a pas de customerId, on utilise son email
      const requestBody = user.stripeCustomerId 
        ? { customerId: user.stripeCustomerId, returnUrl: window.location.href }
        : { customerEmail: user.email, returnUrl: window.location.href };

      const response = await fetch('/api/payment/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ouverture du portail client:', err);
      setError('Impossible d\'ouvrir le portail client');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'past_due':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'canceled':
        return 'Annulé';
      case 'past_due':
        return 'En retard';
      default:
        return status;
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getCardBrandIcon = (brand) => {
    const brandColors = {
      visa: 'text-blue-600',
      mastercard: 'text-red-600',
      amex: 'text-green-600',
      discover: 'text-orange-600'
    };
    
    return (
      <div className={`w-8 h-5 rounded border ${brandColors[brand] || 'text-gray-600'}`}>
        <span className="text-xs font-bold flex items-center justify-center h-full">
          {brand.toUpperCase()}
        </span>
      </div>
    );
  };

  if (loading && !subscription) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-lg font-semibold">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

    return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Facturation et Abonnements
          </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez vos abonnements et méthodes de paiement
          </p>
        </div>
        <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
        </button>
      </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'subscription', label: 'Abonnement', icon: Shield },
              { id: 'invoices', label: 'Factures', icon: FileText },
              { id: 'payment', label: 'Paiement', icon: CreditCard }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {subscription ? (
                  /* Subscription Status */
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(subscription.status)}
          <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {subscription.planName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Statut: {getStatusText(subscription.status)}
            </p>
          </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(subscription.amount / 100, subscription.currency.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          /mois
                        </div>
                      </div>
                    </div>

                    {/* Period Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Début de période</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(subscription.currentPeriodStart)}
            </p>
          </div>
          <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fin de période</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(subscription.currentPeriodEnd)}
            </p>
          </div>
        </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      {subscription.cancelAtPeriodEnd ? (
                        <button
                          onClick={handleReactivateSubscription}
                          disabled={loading}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Réactiver l'abonnement
                        </button>
                      ) : (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={loading}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Annuler l'abonnement
                        </button>
                      )}
                      <button
                        onClick={openCustomerPortal}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Gérer l'abonnement
                      </button>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                          Votre abonnement sera annulé à la fin de la période actuelle.
            </p>
          </div>
        )}
                  </div>
                ) : (
                  /* No Subscription */
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Aucun abonnement actif
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Vous n'avez pas encore souscrit à un plan payant. Découvrez nos plans pour accéder à toutes les fonctionnalités premium.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Voir les plans
                      </button>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Vous utilisez actuellement le plan gratuit
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Historique des factures
        </h3>
                  <button
                    onClick={loadBillingData}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune facture trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(invoice.status)}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
                                {invoice.number}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(invoice.created)}
            </p>
          </div>
        </div>
                        </div>
              <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(invoice.amount / 100, invoice.currency.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getStatusText(invoice.status)}
                  </p>
                </div>
                          <div className="flex space-x-2">
                            <a
                              href={invoice.hostedInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <a
                              href={invoice.invoicePdf}
                              download
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Méthodes de paiement
                  </h3>
                  <button
                    onClick={openCustomerPortal}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter une carte
                  </button>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune méthode de paiement</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {getCardBrandIcon(method.card.brand)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              •••• •••• •••• {method.card.last4}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Expire {method.card.expMonth}/{method.card.expYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                              Par défaut
                            </span>
                          )}
                          <button
                            onClick={openCustomerPortal}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
              </div>
            </div>
          ))}
        </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        Paiement sécurisé
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Vos informations de paiement sont chiffrées et sécurisées par Stripe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 