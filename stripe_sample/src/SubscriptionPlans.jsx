import React, { useState, useEffect } from 'react';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plans');
      const plansData = await response.json();
      setPlans(plansData);
    } catch (error) {
      console.error('Erreur lors du chargement des plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleCheckout = async (planId) => {
    try {
      setCheckoutLoading(true);
      
      if (planId === 'gratuit') {
        // Activer le plan gratuit directement
        const response = await fetch('/api/activate-free-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'user@example.com',
            name: 'Utilisateur Gratuit'
          })
        });

        const data = await response.json();
        
        if (data.success) {
          // Rediriger vers la page de succès
          window.location.href = `${window.location.origin}/?success=true&plan=gratuit&customer_id=${data.customerId}`;
        } else {
          console.error('Erreur lors de l\'activation du plan gratuit');
        }
        return;
      }

      if (planId === 'entreprise') {
        // Ouvrir un modal ou rediriger vers un formulaire de contact
        const contactData = {
          name: prompt('Nom complet:'),
          email: prompt('Email:'),
          company: prompt('Entreprise:'),
          message: prompt('Message (optionnel):')
        };

        if (contactData.name && contactData.email) {
          const response = await fetch('/api/contact-enterprise', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
          });

          const data = await response.json();
          
          if (data.success) {
            alert('Votre demande a été envoyée. Nous vous contacterons dans les plus brefs délais.');
          } else {
            alert('Erreur lors de l\'envoi de la demande.');
          }
        }
        return;
      }
      
      const response = await fetch(`/api/checkout/${planId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}?canceled=true`
        })
      });

      const data = await response.json();
      
      if (data.url) {
        // Rediriger vers Stripe Checkout ou page de succès pour le plan gratuit
        window.location.href = data.url;
      } else {
        console.error('Erreur lors de la création de la session de checkout');
      }
    } catch (error) {
      console.error('Erreur lors du checkout:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) {
      return '0,00 €';
    }
    return (price / 100).toFixed(2).replace('.', ',') + ' €';
  };

  const getButtonText = (planId) => {
    if (planId === 'gratuit') {
      return checkoutLoading ? 'Chargement...' : 'Commencer gratuitement';
    } else if (planId === 'entreprise') {
      return checkoutLoading ? 'Chargement...' : 'Contactez-nous pour un devis personnalisé';
    } else {
      return checkoutLoading ? 'Chargement...' : 'Choisir ce plan';
    }
  };

  if (loading) {
    return (
      <div className="subscription-plans">
        <div className="loading">Chargement des plans...</div>
      </div>
    );
  }

  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <h1>Plans Tarifaires</h1>
        <p>Choisissez le plan qui correspond à vos besoins</p>
      </div>

      <div className="plans-grid">
        {Object.entries(plans).map(([planId, plan]) => (
          <div 
            key={planId} 
            className={`plan-card ${plan.isPopular ? 'popular' : ''} ${selectedPlan === planId ? 'selected' : ''}`}
            onClick={() => handlePlanSelect(planId)}
          >
            {plan.isPopular && (
              <div className="popular-badge">Le plus populaire</div>
            )}

            <div className="plan-header">
              <div className="plan-icon">{plan.icon}</div>
              <h3>{plan.name}</h3>
              <p className="plan-subtitle">{plan.subtitle}</p>
              <div className="plan-price">
                <span className="price-amount">{formatPrice(plan.price)}</span>
                <span className="price-period">/mois</span>
              </div>
            </div>

            <div className="plan-features">
              <h4>Fonctionnalités incluses :</h4>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-icon">✅</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {plan.limitations && plan.limitations.length > 0 && (
              <div className="plan-limitations">
                <h4>Limitations :</h4>
                <ul>
                  {plan.limitations.map((limitation, index) => (
                    <li key={index} className="limitation-item">
                      <span className="limitation-icon">❌</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="plan-actions">
              <button 
                className={`select-plan-btn ${selectedPlan === planId ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanSelect(planId);
                }}
              >
                {selectedPlan === planId ? '✓ Sélectionné' : 'Sélectionner'}
              </button>

              {selectedPlan === planId && (
                <button 
                  className={`checkout-btn ${planId === 'gratuit' ? 'free' : planId === 'entreprise' ? 'enterprise' : 'standard'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckout(planId);
                  }}
                  disabled={checkoutLoading}
                >
                  {getButtonText(planId)}
                </button>
              )}
            </div>

            {plan.stripePriceId && (
              <div className="plan-id">
                <small>ID: {plan.stripePriceId}</small>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="selected-plan-info">
          <h3>Plan sélectionné : {plans[selectedPlan]?.name}</h3>
          <p>Prix : {formatPrice(plans[selectedPlan]?.price)}/mois</p>
          <button 
            className={`checkout-btn-large ${selectedPlan === 'gratuit' ? 'free' : selectedPlan === 'entreprise' ? 'enterprise' : 'standard'}`}
            onClick={() => handleCheckout(selectedPlan)}
            disabled={checkoutLoading}
          >
            {getButtonText(selectedPlan)}
          </button>
        </div>
      )}

      {/* Section FAQ */}
      <div className="faq-section">
        <h2>Questions Fréquentes</h2>
        <p>Tout ce que vous devez savoir sur nos tarifs</p>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Puis-je changer de plan à tout moment ?</h4>
            <p>Oui, vous pouvez passer d'un plan à l'autre à tout moment. Les changements sont appliqués immédiatement.</p>
          </div>
          
          <div className="faq-item">
            <h4>Y a-t-il des frais cachés ?</h4>
            <p>Non, nos tarifs sont transparents. Le prix affiché est le prix que vous payez, sans frais cachés.</p>
          </div>
          
          <div className="faq-item">
            <h4>Que se passe-t-il après l'essai gratuit ?</h4>
            <p>Après les 14 jours d'essai, vous pouvez choisir de continuer avec le plan Pro ou revenir au plan gratuit.</p>
          </div>
          
          <div className="faq-item">
            <h4>Puis-je annuler mon abonnement ?</h4>
            <p>Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.</p>
          </div>
          
          <div className="faq-item">
            <h4>Quels moyens de paiement acceptez-vous ?</h4>
            <p>Nous acceptons toutes les cartes de crédit et de débit principales via notre partenaire de paiement sécurisé Stripe.</p>
          </div>
          
          <div className="faq-item">
            <h4>Comment fonctionne la garantie satisfait ou remboursé ?</h4>
            <p>Si vous n'êtes pas satisfait de notre service dans les 30 premiers jours, nous vous remboursons intégralement, sans questions.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <h2>Prêt à Commencer ?</h2>
        <p>Rejoignez des milliers de développeurs qui utilisent déjà gitShadow</p>
        <div className="cta-buttons">
          <button className="cta-btn-primary">Commencer gratuitement</button>
          <button className="cta-btn-secondary">Parler à un expert</button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans; 