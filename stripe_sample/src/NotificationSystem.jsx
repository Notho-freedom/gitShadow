import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './NotificationSystem.css';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connexion Socket.IO
    const newSocket = io('http://localhost:4242');
    setSocket(newSocket);

    // Gestion des événements de connexion
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('🔗 Connecté au serveur de notifications');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Déconnecté du serveur de notifications');
    });

    // Réception des notifications existantes
    newSocket.on('notifications', (existingNotifications) => {
      setNotifications(existingNotifications);
    });

    // Réception d'une nouvelle notification
    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Afficher une popup pour les nouvelles notifications
      showPopup(notification);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fonction pour afficher une popup
  const showPopup = (notification) => {
    // Créer une popup native du navigateur
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  // Demander la permission pour les notifications
  const requestNotificationPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  // Supprimer une notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Obtenir l'icône selon le type
  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  // Obtenir la classe CSS selon le type
  const getTypeClass = (type) => {
    switch (type) {
      case 'success': return 'notification-success';
      case 'error': return 'notification-error';
      case 'warning': return 'notification-warning';
      case 'info': return 'notification-info';
      default: return 'notification-default';
    }
  };

  // Formater la date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  return (
    <div className="notification-system">
      {/* Barre de statut */}
      <div className="notification-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢' : '🔴'} {isConnected ? 'Connecté' : 'Déconnecté'}
        </div>
        <button 
          className="notification-permission-btn"
          onClick={requestNotificationPermission}
        >
          🔔 Autoriser les notifications
        </button>
      </div>

      {/* Liste des notifications */}
      <div className="notifications-container">
        <h3>📋 Notifications Stripe ({notifications.length})</h3>
        
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>Aucune notification pour le moment</p>
            <p>Les notifications apparaîtront ici quand des événements Stripe se produiront</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${getTypeClass(notification.type)}`}
              >
                <div className="notification-header">
                  <span className="notification-icon">
                    {getIcon(notification.type)}
                  </span>
                  <span className="notification-title">
                    {notification.title}
                  </span>
                  <button 
                    className="notification-close"
                    onClick={() => removeNotification(notification.id)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="notification-message">
                  {notification.message}
                </div>
                
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatDate(notification.timestamp)}
                  </span>
                  {notification.data.customer && (
                    <span className="notification-customer">
                      Client: {notification.data.customer}
                    </span>
                  )}
                </div>
                
                {Object.keys(notification.data).length > 0 && (
                  <details className="notification-details">
                    <summary>Détails</summary>
                    <pre>{JSON.stringify(notification.data, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem; 