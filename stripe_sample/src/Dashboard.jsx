import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, customersRes, subscriptionsRes, paymentsRes, eventsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/customers'),
        fetch('/api/subscriptions'),
        fetch('/api/payments'),
        fetch('/api/events?limit=20')
      ]);

      const [statsData, customersData, subscriptionsData, paymentsData, eventsData] = await Promise.all([
        statsRes.json(),
        customersRes.json(),
        subscriptionsRes.json(),
        paymentsRes.json(),
        eventsRes.json()
      ]);

      setStats(statsData);
      setCustomers(customersData);
      setSubscriptions(subscriptionsData);
      setPayments(paymentsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const formatAmount = (amount) => {
    return (amount / 100).toFixed(2) + '€';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'past_due': return 'warning';
      case 'canceled': return 'error';
      case 'trialing': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Tableau de bord Stripe</h1>
        <button onClick={loadData} className="refresh-btn">
          🔄 Actualiser
        </button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📈 Statistiques
        </button>
        <button 
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          👥 Clients
        </button>
        <button 
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          📅 Abonnements
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          💰 Paiements
        </button>
        <button 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📝 Événements
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>👥 Clients</h3>
              <div className="stat-value">{stats?.totalCustomers || 0}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <h3>📅 Abonnements</h3>
              <div className="stat-value">{stats?.activeSubscriptions || 0}</div>
              <div className="stat-label">Actifs</div>
            </div>
            <div className="stat-card">
              <h3>💰 Revenus</h3>
              <div className="stat-value">{stats?.totalRevenue?.toFixed(2) || 0}€</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <h3>✅ Paiements</h3>
              <div className="stat-value">{stats?.successfulPayments || 0}</div>
              <div className="stat-label">Réussis</div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="data-table">
            <h3>Liste des clients ({customers.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Créé le</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>
                      <span className={`status ${customer.status}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>{formatDate(customer.created)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="data-table">
            <h3>Liste des abonnements ({subscriptions.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Statut</th>
                  <th>Période</th>
                  <th>Créé le</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(subscription => (
                  <tr key={subscription.id}>
                    <td>{subscription.id}</td>
                    <td>{subscription.customerId}</td>
                    <td>
                      <span className={`status ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td>
                      {subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                        `${formatDate(subscription.currentPeriodStart)} - ${formatDate(subscription.currentPeriodEnd)}`
                      ) : 'N/A'}
                    </td>
                    <td>{formatDate(subscription.created)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="data-table">
            <h3>Liste des paiements ({payments.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.customerId}</td>
                    <td>{formatAmount(payment.amount)}</td>
                    <td>
                      <span className={`status ${payment.paid ? 'success' : 'error'}`}>
                        {payment.paid ? 'Payé' : 'Échoué'}
                      </span>
                    </td>
                    <td>{formatDate(payment.created)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="data-table">
            <h3>Derniers événements ({events.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Données</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>{event.type}</td>
                    <td>
                      <details>
                        <summary>Voir les détails</summary>
                        <pre>{JSON.stringify(event.data, null, 2)}</pre>
                      </details>
                    </td>
                    <td>{formatDate(event.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 