// src/background/index.ts
import browser from '../utils/browser';

// Interfaces pour les types
interface DetailedRequest {
  url: string;
  method: string;
  timestamp: number;
  statusCode?: number;
  responseSize?: number;
  contentType?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  ip?: string;
  tabId: number;
  tabUrl?: string;
  referer?: string;
  origin?: string;
}

interface WebRequestDetails {
  url: string;
  method: string;
  tabId: number;
  requestId: string;
  timeStamp: number;
  type: string;
  frameId: number;
  parentFrameId: number;
}

interface WebRequestHeadersDetails extends WebRequestDetails {
  requestHeaders?: {name: string; value: string}[];
  responseHeaders?: {name: string; value: string}[];
  statusCode?: number;
}

interface Tab {
  id?: number;
  url?: string;
  title?: string;
  active: boolean;
  index: number;
  windowId: number;
}

interface Message {
  type: string;
  payload?: any;
}

interface SendResponseCallback {
  (response?: any): void;
}

interface MessageSender {
  tab?: Tab;
  frameId?: number;
  id?: string;
  url?: string;
  origin?: string;
}

// Stocker les requêtes détaillées
const detailedRequests: { [tabId: number]: DetailedRequest[] } = {};

// Convertir les headers en objet
function headersToObject(headers: {name: string; value: string}[] | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (headers) {
    headers.forEach((header) => {
      if (header.name && header.value) {
        result[header.name.toLowerCase()] = header.value;
      }
    });
  }
  return result;
}

// Utiliser l'API webRequest de manière compatible avec Manifest V3
// Pour capturer les requêtes sans les bloquer
browser.webRequest.onBeforeRequest.addListener(
  function(details: WebRequestDetails): void {
    const tabId = details.tabId;
    if (tabId <= 0) return; // Ignorer les requêtes qui ne sont pas associées à un onglet
    
    // Créer un nouvel objet de requête
    const requestData: DetailedRequest = {
      url: details.url,
      method: details.method,
      timestamp: Date.now(),
      tabId: tabId
    };
    
    // Initialiser le tableau pour ce tab si nécessaire
    if (!detailedRequests[tabId]) {
      detailedRequests[tabId] = [];
    }
    
    // Ajouter la requête
    detailedRequests[tabId].push(requestData);
    
    // Récupérer l'URL de l'onglet
    browser.tabs.get(tabId).then((tab: Tab) => {
      if (tab.url) {
        requestData.tabUrl = tab.url;
      }
    }).catch((error: Error) => {
      console.error('Erreur lors de la récupération de l\'URL de l\'onglet:', error);
    });
    
    // Mettre à jour le badge avec le nombre de requêtes
    const count = detailedRequests[tabId].length;
    browser.action.setBadgeText({
      text: count.toString(),
      tabId
    });
    browser.action.setBadgeBackgroundColor({
      color: '#4688F1',
      tabId
    });
  },
  { urls: ["<all_urls>"] }
);

// Capturer les headers de requête
browser.webRequest.onSendHeaders.addListener(
  function(details: WebRequestHeadersDetails): void {
    const tabId = details.tabId;
    if (tabId <= 0) return;
    
    // Trouver la requête correspondante
    const requests = detailedRequests[tabId] || [];
    const request = requests.find(req => req.url === details.url && !req.requestHeaders);
    
    if (request) {
      request.requestHeaders = headersToObject(details.requestHeaders);
      
      // Extraire spécifiquement les headers importants comme Origin et Referer
      if (request.requestHeaders) {
        const headers = request.requestHeaders;
        request.referer = headers['referer'] || headers['referrer'];
        request.origin = headers['origin'];
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

// Capturer les réponses et leurs headers
browser.webRequest.onHeadersReceived.addListener(
  function(details: WebRequestHeadersDetails): void {
    const tabId = details.tabId;
    if (tabId <= 0) return;
    
    // Trouver la requête correspondante
    const requests = detailedRequests[tabId] || [];
    const request = requests.find(req => req.url === details.url && !req.responseHeaders);
    
    if (request) {
      request.statusCode = details.statusCode;
      request.responseHeaders = headersToObject(details.responseHeaders);
      
      // Extraire des informations spécifiques des headers
      const headers = request.responseHeaders;
      if (headers) {
        request.contentType = headers['content-type'];
        if (headers['content-length']) {
          request.responseSize = parseInt(headers['content-length']);
        }
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

// Traiter les messages depuis le popup ou les content scripts
browser.runtime.onMessage.addListener(
  function(message: Message, _sender: MessageSender, sendResponse: SendResponseCallback): boolean {
    if (message.type === 'GET_DETAILED_REQUESTS') {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs: Tab[]) => {
        const tabId = tabs[0]?.id;
        
        if (tabId && detailedRequests[tabId]) {
          sendResponse({
            requests: detailedRequests[tabId]
          });
        } else {
          sendResponse({
            requests: []
          });
        }
      }).catch((error: Error) => {
        console.error('Erreur lors de la récupération de l\'onglet actif:', error);
        sendResponse({ 
          requests: [],
          error: error.message
        });
      });
      
      return true; // Indique que nous allons répondre de manière asynchrone
    }
    
    // Gérer la demande d'effacement des requêtes pour un onglet
    if (message.type === 'CLEAR_TAB_REQUESTS' && message.payload && message.payload.tabId) {
      const tabId = message.payload.tabId;
      
      // Réinitialiser les requêtes pour cet onglet
      detailedRequests[tabId] = [];
      
      // Mettre à jour le badge
      browser.action.setBadgeText({
        text: '',
        tabId
      });
      
      // Confirmer l'action
      sendResponse({ success: true });
      return true;
    }

    return false;
  }
);

// Nettoyer les requêtes lorsqu'un onglet est fermé
browser.tabs.onRemoved.addListener((tabId: number): void => {
  if (detailedRequests[tabId]) {
    delete detailedRequests[tabId];
  }
});

console.log('ShowXhrUrl: Background script chargé avec capture détaillée (Manifest V3)');