// src/content/index.ts
import browser from '../utils/browser';

// Structure de données pour les requêtes
interface XhrRequest {
  url: string;
  method: string;
  timestamp: number;
}

// Injecter le script pour surveiller les requêtes
function injectXhrMonitor(): void {
  // Créer un élément script pour injection
  const script = document.createElement('script');
  
  // Code à injecter directement dans la page
  script.textContent = `
    // Stocker les URLs des requêtes
    const xhrUrls = [];
    
    // Intercepter XMLHttpRequest
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      const requestData = {
        url: url.toString(),
        method: method,
        timestamp: Date.now()
      };
      xhrUrls.push(requestData);
      
      // Envoyer au content script
      window.postMessage({
        type: 'SHOW_XHR_URL_REQUEST',
        payload: requestData
      }, '*');
      
      return originalXhrOpen.apply(this, arguments);
    };
    
    // Intercepter fetch
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      const method = init && init.method ? init.method : 'GET';
      
      const requestData = {
        url: url.toString(),
        method: method,
        timestamp: Date.now()
      };
      xhrUrls.push(requestData);
      
      // Envoyer au content script
      window.postMessage({
        type: 'SHOW_XHR_URL_REQUEST',
        payload: requestData
      }, '*');
      
      return originalFetch.apply(this, arguments);
    };
    
    // Fonction utilitaire pour récupérer toutes les requêtes
    window.getAllXhrUrls = function() {
      return xhrUrls;
    };
  `;
  
  // Injecter le script dans la page
  document.head.appendChild(script);
  script.remove();
}

// Écouter les messages du script injecté
window.addEventListener('message', (event) => {
  // S'assurer que le message provient bien de notre script
  if (event.data && event.data.type === 'SHOW_XHR_URL_REQUEST') {
    const request = event.data.payload as XhrRequest;
    
    // Stocker les données localement
    browser.storage.local.get(['xhrRequests']).then((result: {xhrRequests?: unknown}) => {
      // Assurez-vous que result.xhrRequests est un tableau ou initialiser un nouveau
      const requests: XhrRequest[] = Array.isArray(result.xhrRequests) ? result.xhrRequests : [];
      
      // Ajouter la nouvelle requête
      requests.push(request);
      
      // Sauvegarder dans le stockage local
      return browser.storage.local.set({ xhrRequests: requests });
    }).catch((error: Error) => {
      console.error('Erreur de stockage:', error);
    });
    
    // Notifier le background script
    browser.runtime.sendMessage({
      type: 'NEW_XHR_REQUEST',
      payload: request
    }).catch((error: Error) => {
      console.error('Erreur de communication avec le background:', error);
    });
  }
});

// Injecter notre moniteur dès que possible
injectXhrMonitor();

console.log('ShowXhrUrl: Content script chargé');