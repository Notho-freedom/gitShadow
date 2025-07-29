const fs = require('fs').promises;
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'data');
    this.customersFile = path.join(this.dbPath, 'customers.json');
    this.subscriptionsFile = path.join(this.dbPath, 'subscriptions.json');
    this.paymentsFile = path.join(this.dbPath, 'payments.json');
    this.eventsFile = path.join(this.dbPath, 'events.json');
    
    this.init();
  }

  async init() {
    try {
      // Créer le dossier data s'il n'existe pas
      await fs.mkdir(this.dbPath, { recursive: true });
      
      // Initialiser les fichiers JSON s'ils n'existent pas
      await this.ensureFile(this.customersFile, []);
      await this.ensureFile(this.subscriptionsFile, []);
      await this.ensureFile(this.paymentsFile, []);
      await this.ensureFile(this.eventsFile, []);
      
      console.log('📊 Base de données JSON initialisée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    }
  }

  async ensureFile(filePath, defaultData) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  async readFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Erreur lecture fichier ${filePath}:`, error);
      return [];
    }
  }

  async writeFile(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`❌ Erreur écriture fichier ${filePath}:`, error);
      return false;
    }
  }

  // Gestion des clients
  async createCustomer(stripeCustomer) {
    const customers = await this.readFile(this.customersFile);
    
    const customer = {
      id: stripeCustomer.id,
      email: stripeCustomer.email,
      name: stripeCustomer.name,
      created: stripeCustomer.created,
      status: 'active',
      metadata: stripeCustomer.metadata || {},
      lastUpdated: new Date().toISOString()
    };

    // Vérifier si le client existe déjà
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    if (existingIndex >= 0) {
      customers[existingIndex] = { ...customers[existingIndex], ...customer };
    } else {
      customers.push(customer);
    }

    await this.writeFile(this.customersFile, customers);
    console.log(`👤 Client créé/mis à jour: ${customer.id}`);
    return customer;
  }

  async getCustomer(customerId) {
    const customers = await this.readFile(this.customersFile);
    return customers.find(c => c.id === customerId);
  }

  async updateCustomer(customerId, updates) {
    const customers = await this.readFile(this.customersFile);
    const index = customers.findIndex(c => c.id === customerId);
    
    if (index >= 0) {
      customers[index] = { 
        ...customers[index], 
        ...updates, 
        lastUpdated: new Date().toISOString() 
      };
      await this.writeFile(this.customersFile, customers);
      console.log(`👤 Client mis à jour: ${customerId}`);
      return customers[index];
    }
    return null;
  }

  async deleteCustomer(customerId) {
    const customers = await this.readFile(this.customersFile);
    const filtered = customers.filter(c => c.id !== customerId);
    await this.writeFile(this.customersFile, filtered);
    console.log(`🗑️ Client supprimé: ${customerId}`);
  }

  // Gestion des abonnements
  async createSubscription(stripeSubscription) {
    const subscriptions = await this.readFile(this.subscriptionsFile);
    
    const subscription = {
      id: stripeSubscription.id,
      customerId: stripeSubscription.customer,
      status: stripeSubscription.status,
      currentPeriodStart: stripeSubscription.current_period_start,
      currentPeriodEnd: stripeSubscription.current_period_end,
      trialStart: stripeSubscription.trial_start,
      trialEnd: stripeSubscription.trial_end,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      items: stripeSubscription.items.data.map(item => ({
        priceId: item.price.id,
        quantity: item.quantity
      })),
      metadata: stripeSubscription.metadata || {},
      created: stripeSubscription.created,
      lastUpdated: new Date().toISOString()
    };

    // Vérifier si l'abonnement existe déjà
    const existingIndex = subscriptions.findIndex(s => s.id === subscription.id);
    if (existingIndex >= 0) {
      subscriptions[existingIndex] = { ...subscriptions[existingIndex], ...subscription };
    } else {
      subscriptions.push(subscription);
    }

    await this.writeFile(this.subscriptionsFile, subscriptions);
    console.log(`📅 Abonnement créé/mis à jour: ${subscription.id}`);
    return subscription;
  }

  async getSubscription(subscriptionId) {
    const subscriptions = await this.readFile(this.subscriptionsFile);
    return subscriptions.find(s => s.id === subscriptionId);
  }

  async getCustomerSubscriptions(customerId) {
    const subscriptions = await this.readFile(this.subscriptionsFile);
    return subscriptions.filter(s => s.customerId === customerId);
  }

  async updateSubscription(subscriptionId, updates) {
    const subscriptions = await this.readFile(this.subscriptionsFile);
    const index = subscriptions.findIndex(s => s.id === subscriptionId);
    
    if (index >= 0) {
      subscriptions[index] = { 
        ...subscriptions[index], 
        ...updates, 
        lastUpdated: new Date().toISOString() 
      };
      await this.writeFile(this.subscriptionsFile, subscriptions);
      console.log(`📅 Abonnement mis à jour: ${subscriptionId}`);
      return subscriptions[index];
    }
    return null;
  }

  async deleteSubscription(subscriptionId) {
    const subscriptions = await this.readFile(this.subscriptionsFile);
    const filtered = subscriptions.filter(s => s.id !== subscriptionId);
    await this.writeFile(this.subscriptionsFile, filtered);
    console.log(`🗑️ Abonnement supprimé: ${subscriptionId}`);
  }

  // Gestion des paiements
  async createPayment(stripeInvoice) {
    const payments = await this.readFile(this.paymentsFile);
    
    const payment = {
      id: stripeInvoice.id,
      customerId: stripeInvoice.customer,
      subscriptionId: stripeInvoice.subscription,
      amount: stripeInvoice.amount_paid,
      currency: stripeInvoice.currency,
      status: stripeInvoice.status,
      paid: stripeInvoice.paid,
      dueDate: stripeInvoice.due_date,
      periodStart: stripeInvoice.period_start,
      periodEnd: stripeInvoice.period_end,
      created: stripeInvoice.created,
      lastUpdated: new Date().toISOString()
    };

    // Vérifier si le paiement existe déjà
    const existingIndex = payments.findIndex(p => p.id === payment.id);
    if (existingIndex >= 0) {
      payments[existingIndex] = { ...payments[existingIndex], ...payment };
    } else {
      payments.push(payment);
    }

    await this.writeFile(this.paymentsFile, payments);
    console.log(`💰 Paiement enregistré: ${payment.id}`);
    return payment;
  }

  async getCustomerPayments(customerId) {
    const payments = await this.readFile(this.paymentsFile);
    return payments.filter(p => p.customerId === customerId);
  }

  // Gestion des événements
  async logEvent(eventType, eventData) {
    const events = await this.readFile(this.eventsFile);
    
    const event = {
      id: Date.now().toString(),
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString()
    };

    events.unshift(event);
    
    // Garder seulement les 1000 derniers événements
    if (events.length > 1000) {
      events.splice(1000);
    }

    await this.writeFile(this.eventsFile, events);
    console.log(`📝 Événement enregistré: ${eventType}`);
    return event;
  }

  async getEvents(limit = 50) {
    const events = await this.readFile(this.eventsFile);
    return events.slice(0, limit);
  }

  // Statistiques
  async getStats() {
    const customers = await this.readFile(this.customersFile);
    const subscriptions = await this.readFile(this.subscriptionsFile);
    const payments = await this.readFile(this.paymentsFile);
    const events = await this.readFile(this.eventsFile);

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const totalRevenue = payments
      .filter(p => p.paid)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === 'active').length,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      totalPayments: payments.length,
      successfulPayments: payments.filter(p => p.paid).length,
      totalRevenue: totalRevenue / 100, // Convertir en euros
      totalEvents: events.length,
      lastEvent: events[0] || null
    };
  }

  // Export des données
  async exportData() {
    const customers = await this.readFile(this.customersFile);
    const subscriptions = await this.readFile(this.subscriptionsFile);
    const payments = await this.readFile(this.paymentsFile);
    const events = await this.readFile(this.eventsFile);

    return {
      customers,
      subscriptions,
      payments,
      events,
      exportDate: new Date().toISOString()
    };
  }
}

module.exports = Database; 