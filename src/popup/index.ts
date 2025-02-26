// src/popup/index.ts
import browser from '../utils/browser';

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

interface ResponseWithRequests {
  requests: DetailedRequest[];
  error?: string;
}

interface MessageEvent {
  type: string;
  payload?: any;
}

interface MessageSender {
  tab?: {
    id?: number;
    url?: string;
  };
  frameId?: number;
  id?: string;
  url?: string;
  origin?: string;
}

// Référence aux éléments du DOM
const requestList = document.getElementById('requestList')!;
const clearBtn = document.getElementById('clearBtn')!;
const copyBtn = document.getElementById('copyBtn')!;
const refreshBtn = document.getElementById('refreshBtn')!;
const filterBtns = document.querySelectorAll<HTMLButtonElement>('.filter-btn')!;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement;

// État
let allRequests: DetailedRequest[] = [];
let currentFilter = 'all';
let selectedRequestId: number | null = null;
let searchQuery = '';

// Variables pour gérer la position de défilement et les détails affichés
let lastScrollPosition = 0;
let lastSelectedId: number | null = null;

// Formater la date
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// Demander les requêtes détaillées au background script
function fetchRequests(): void {
  browser.runtime.sendMessage({ type: 'GET_DETAILED_REQUESTS' })
    .then((response: ResponseWithRequests | undefined) => {
      if (response && Array.isArray(response.requests)) {
        allRequests = response.requests;
        renderRequests();
      } else {
        // Initialiser avec un tableau vide si response.requests n'est pas un tableau
        allRequests = [];
        renderRequests();
      }
    })
    .catch((error: Error) => {
      console.error('Erreur lors de la récupération des requêtes:', error);
    });
}

// Extraire et formater les paramètres d'URL
function extractUrlParams(url: string): string {
  try {
    // Vérifier si l'URL contient un point d'interrogation
    if (!url.includes('?')) {
      return 'Aucun paramètre dans cette URL';
    }
    
    // Créer un objet URL à partir de la chaîne
    const urlObj = new URL(url);
    
    // Récupérer les paramètres
    const params = urlObj.searchParams;
    
    // Si aucun paramètre, retourner un message
    if (!params || params.toString() === '') {
      return 'Aucun paramètre dans cette URL';
    }
    
    // Formater les paramètres
    let formattedParams = '';
    
    params.forEach((value, key) => {
      // Essayer de décoder la valeur pour les valeurs encodées
      try {
        const decodedValue = decodeURIComponent(value);
        formattedParams += `${key}:${decodedValue}\n`;
      } catch (e) {
        formattedParams += `${key}:${value}\n`;
      }
    });
    
    return formattedParams || 'Aucun paramètre dans cette URL';
  } catch (error) {
    console.error('Erreur lors de l\'extraction des paramètres:', error);
    
    // Si l'URL n'est pas valide pour l'API URL, essayer d'extraire manuellement
    try {
      const queryString = url.split('?')[1];
      if (!queryString) {
        return 'Aucun paramètre dans cette URL';
      }
      
      const paramPairs = queryString.split('&');
      let formattedParams = '';
      
      for (const pair of paramPairs) {
        const [key, value] = pair.split('=');
        if (key) {
          try {
            const decodedValue = decodeURIComponent(value || '');
            formattedParams += `${key}:${decodedValue}\n`;
          } catch (e) {
            formattedParams += `${key}:${value || ''}\n`;
          }
        }
      }
      
      return formattedParams || 'Aucun paramètre dans cette URL';
    } catch (e) {
      return 'Erreur lors de l\'extraction des paramètres';
    }
  }
}

// Fonction pour sauvegarder l'état de l'interface
function saveUIState() {
  lastScrollPosition = document.querySelector('.requests-list-container')?.scrollTop || 0;
  lastSelectedId = selectedRequestId;
}

// Fonction pour restaurer l'état de l'interface
function restoreUIState() {
  // Restaurer la position de défilement
  const container = document.querySelector('.requests-list-container');
  if (container) {
    setTimeout(() => {
      (container as HTMLElement).scrollTop = lastScrollPosition;
    }, 10); // Petit délai pour s'assurer que le DOM est prêt
  }

  // Restaurer la sélection
  if (lastSelectedId !== null && selectedRequestId === lastSelectedId) {
    const detailsElement = document.getElementById(`request-details-${lastSelectedId}`);
    if (detailsElement) {
      (detailsElement as HTMLElement).style.display = 'block';
    }
    
    const selectedItem = document.querySelector(`.request-item[data-index="${lastSelectedId}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
  }
}

// Créer l'élément pour afficher les détails d'une requête
function createRequestDetailsElement(request: DetailedRequest, index: number): HTMLElement {
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'request-details';
  detailsContainer.id = `request-details-${index}`;
  detailsContainer.style.display = 'none'; // Masquer par défaut
  
  // Informations générales
  const generalInfo = document.createElement('div');
  generalInfo.className = 'details-section';
  generalInfo.innerHTML = `
    <h3>Informations générales</h3>
    <div class="detail-item"><span>URL:</span> <span>${request.url}</span></div>
    <div class="detail-item"><span>Méthode:</span> <span>${request.method}</span></div>
    <div class="detail-item"><span>Heure:</span> <span>${formatTime(request.timestamp)}</span></div>
    ${request.statusCode ? `<div class="detail-item"><span>Code d'état:</span> <span>${request.statusCode}</span></div>` : ''}
    ${request.responseSize ? `<div class="detail-item"><span>Taille de la réponse:</span> <span>${request.responseSize} octets</span></div>` : ''}
    ${request.contentType ? `<div class="detail-item"><span>Type de contenu:</span> <span>${request.contentType}</span></div>` : ''}
    ${request.ip ? `<div class="detail-item"><span>Adresse IP distante:</span> <span>${request.ip}</span></div>` : ''}
    ${request.origin ? `<div class="detail-item highlight"><span>Origin:</span> <span>${request.origin}</span></div>` : ''}
    ${request.referer ? `<div class="detail-item highlight"><span>Referer:</span> <span>${request.referer}</span></div>` : ''}
  `;
  
  // Paramètres d'URL
  const urlParamsSection = document.createElement('div');
  urlParamsSection.className = 'details-section';
  let urlParamsHTML = '<h3>Paramètres d\'URL</h3>';
  
  const params = extractUrlParams(request.url);
  if (params !== 'Aucun paramètre dans cette URL' && params !== 'Erreur lors de l\'extraction des paramètres') {
    urlParamsHTML += '<div class="params-container">';
    const paramLines = params.split('\n');
    for (const line of paramLines) {
      if (line.trim() !== '') {
        const parts = line.split(':');
        const key = parts[0];
        const value = parts.slice(1).join(':'); // Rejoindre au cas où la valeur contient des ":"
        urlParamsHTML += `<div class="detail-item"><span>${key}:</span> <span>${value}</span></div>`;
      }
    }
    urlParamsHTML += '</div>';
  } else {
    urlParamsHTML += `<div class="no-data">${params}</div>`;
  }
  
  urlParamsSection.innerHTML = urlParamsHTML;
  
  // Headers de requête
  const requestHeadersSection = document.createElement('div');
  requestHeadersSection.className = 'details-section';
  let requestHeadersHTML = '<h3>En-têtes de demande</h3>';
  
  if (request.requestHeaders && Object.keys(request.requestHeaders).length > 0) {
    requestHeadersHTML += '<div class="headers-container">';
    for (const [name, value] of Object.entries(request.requestHeaders)) {
      requestHeadersHTML += `<div class="detail-item"><span>${name}:</span> <span>${value}</span></div>`;
    }
    requestHeadersHTML += '</div>';
  } else {
    requestHeadersHTML += '<div class="no-data">Aucun en-tête disponible</div>';
  }
  
  requestHeadersSection.innerHTML = requestHeadersHTML;
  
  // Headers de réponse
  const responseHeadersSection = document.createElement('div');
  responseHeadersSection.className = 'details-section';
  let responseHeadersHTML = '<h3>En-têtes de réponse</h3>';
  
  if (request.responseHeaders && Object.keys(request.responseHeaders).length > 0) {
    responseHeadersHTML += '<div class="headers-container">';
    for (const [name, value] of Object.entries(request.responseHeaders)) {
      responseHeadersHTML += `<div class="detail-item"><span>${name}:</span> <span>${value}</span></div>`;
    }
    responseHeadersHTML += '</div>';
  } else {
    responseHeadersHTML += '<div class="no-data">Aucun en-tête disponible</div>';
  }
  
  responseHeadersSection.innerHTML = responseHeadersHTML;
  
  // Ajouter toutes les sections
  detailsContainer.appendChild(generalInfo);
  detailsContainer.appendChild(urlParamsSection);
  detailsContainer.appendChild(requestHeadersSection);
  detailsContainer.appendChild(responseHeadersSection);
  
  // Ajouter des boutons d'action
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'details-actions';
  
  const copyUrlBtn = document.createElement('button');
  copyUrlBtn.textContent = 'Copier l\'URL';
  copyUrlBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(request.url);
    copyUrlBtn.textContent = 'Copié !';
    setTimeout(() => {
      copyUrlBtn.textContent = 'Copier l\'URL';
    }, 2000);
  });
  
  const copyParamsBtn = document.createElement('button');
  copyParamsBtn.textContent = 'Copier les paramètres';
  copyParamsBtn.addEventListener('click', () => {
    const params = extractUrlParams(request.url);
    navigator.clipboard.writeText(params);
    copyParamsBtn.textContent = 'Copié !';
    setTimeout(() => {
      copyParamsBtn.textContent = 'Copier les paramètres';
    }, 2000);
  });
  
  const copyAllBtn = document.createElement('button');
  copyAllBtn.textContent = 'Copier tout';
  copyAllBtn.addEventListener('click', () => {
    const allInfo = `
URL: ${request.url}
Méthode: ${request.method}
Heure: ${formatTime(request.timestamp)}
${request.statusCode ? `Code d'état: ${request.statusCode}` : ''}
${request.contentType ? `Type de contenu: ${request.contentType}` : ''}
${request.responseSize ? `Taille: ${request.responseSize} octets` : ''}
${request.origin ? `Origin: ${request.origin}` : ''}
${request.referer ? `Referer: ${request.referer}` : ''}

PARAMÈTRES URL:
${extractUrlParams(request.url)}

EN-TÊTES DE DEMANDE:
${request.requestHeaders ? Object.entries(request.requestHeaders).map(([k, v]) => `${k}: ${v}`).join('\n') : 'Aucun'}

EN-TÊTES DE RÉPONSE:
${request.responseHeaders ? Object.entries(request.responseHeaders).map(([k, v]) => `${k}: ${v}`).join('\n') : 'Aucun'}
    `;
    
    navigator.clipboard.writeText(allInfo);
    copyAllBtn.textContent = 'Copié !';
    setTimeout(() => {
      copyAllBtn.textContent = 'Copier tout';
    }, 2000);
  });
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Fermer';
  closeBtn.addEventListener('click', () => {
    detailsContainer.style.display = 'none';
    selectedRequestId = null;
  });
  
  actionsContainer.appendChild(copyUrlBtn);
  actionsContainer.appendChild(copyParamsBtn);
  actionsContainer.appendChild(copyAllBtn);
  actionsContainer.appendChild(closeBtn);
  
  detailsContainer.appendChild(actionsContainer);
  
  return detailsContainer;
}

// Afficher les requêtes
function renderRequests(): void {
  // Filtrer les requêtes par méthode et recherche
  let filteredRequests = allRequests;
  
  // Filtrer par méthode
  if (currentFilter !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.method.toUpperCase() === currentFilter);
  }
  
  // Filtrer par recherche
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filteredRequests = filteredRequests.filter(req => {
      // Rechercher dans l'URL
      if (req.url.toLowerCase().includes(query)) {
        return true;
      }
      // Rechercher dans le Referer
      if (req.referer && req.referer.toLowerCase().includes(query)) {
        return true;
      } 
      // Rechercher dans l'Origin
      if (req.origin && req.origin.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });
  }
  
  // Vider la liste
  requestList.innerHTML = '';
  
  if (filteredRequests.length === 0) {
    requestList.innerHTML = '<div class="no-data">Aucune requête détectée</div>';
    return;
  }
  
  // Créer un conteneur pour la liste
  const listContainer = document.createElement('div');
  listContainer.className = 'requests-list-container';
  
  // Trier par timestamp (plus récent d'abord)
  filteredRequests
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((request, index) => {
      // Créer l'élément de la liste
      const item = document.createElement('div');
      item.className = 'request-item';
      item.dataset.index = index.toString();
      
      // Ajouter une classe si c'est l'élément sélectionné
      if (selectedRequestId === index) {
        item.classList.add('selected');
      }
      
      // Créer les éléments pour la méthode, l'URL et l'heure
      const method = document.createElement('span');
      method.className = `request-method ${request.method.toLowerCase()}`;
      method.textContent = request.method.toUpperCase();
      
      const url = document.createElement('span');
      url.className = 'request-url';
      url.textContent = request.url;
      
      const status = document.createElement('span');
      status.className = 'request-status';
      if (request.statusCode) {
        status.textContent = request.statusCode.toString();
        if (request.statusCode >= 200 && request.statusCode < 300) {
          status.classList.add('status-success');
        } else if (request.statusCode >= 400) {
          status.classList.add('status-error');
        } else {
          status.classList.add('status-warning');
        }
      } else {
        status.textContent = 'Pending';
        status.classList.add('status-pending');
      }
      
      const time = document.createElement('div');
      time.className = 'request-time';
      time.textContent = formatTime(request.timestamp);
      
      // Ajouter les éléments à l'élément de la liste
      item.appendChild(method);
      item.appendChild(status);
      item.appendChild(document.createTextNode(' '));
      item.appendChild(url);
      item.appendChild(time);
      
      // Ajouter un gestionnaire d'événements pour afficher les détails
      item.addEventListener('click', () => {
        // Masquer tous les détails
        document.querySelectorAll('.request-details').forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
        
        // Supprimer la classe selected de tous les éléments
        document.querySelectorAll('.request-item').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Ajouter la classe selected à l'élément cliqué
        item.classList.add('selected');
        
        // Afficher les détails de la requête
        const detailsId = `request-details-${index}`;
        let detailsElement = document.getElementById(detailsId);
        
        if (!detailsElement) {
          detailsElement = createRequestDetailsElement(request, index);
          requestList.appendChild(detailsElement);
        }
        
        (detailsElement as HTMLElement).style.display = 'block';
        selectedRequestId = index;
        
        // Enregistrer l'état actuel pour le restaurer si nécessaire
        saveUIState();
      });
      
      // Ajouter l'élément à la liste
      listContainer.appendChild(item);
    });
  
  // Ajouter le conteneur à la liste
  requestList.appendChild(listContainer);
  
  // Si un élément était sélectionné, afficher ses détails
  if (selectedRequestId !== null) {
    const detailsElement = document.getElementById(`request-details-${selectedRequestId}`);
    if (detailsElement) {
      (detailsElement as HTMLElement).style.display = 'block';
    }
  }
  
  // Restaurer l'état de l'interface après le rendu
  restoreUIState();
}

// Écouter les changements de filtre
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Mettre à jour la classe active
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Mettre à jour le filtre
    currentFilter = btn.getAttribute('data-filter') || 'all';
    saveUIState();
    renderRequests();
  });
});

// Effacer les requêtes
clearBtn.addEventListener('click', () => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs: {id?: number}[]) => {
    const tabId = tabs[0]?.id;
    
    if (tabId) {
      // Envoyer un message au background pour effacer
      browser.runtime.sendMessage({
        type: 'CLEAR_TAB_REQUESTS',
        payload: { tabId }
      }).then(() => {
        // Vider localement
        allRequests = [];
        renderRequests();
      }).catch((error: Error) => {
        console.error('Erreur lors de l\'effacement des requêtes:', error);
      });
    }
  }).catch((error: Error) => {
    console.error('Erreur lors de la récupération de l\'onglet actif:', error);
  });
});

// Copier les URLs
copyBtn.addEventListener('click', () => {
  let filteredRequests = allRequests;
  
  // Filtrer par méthode
  if (currentFilter !== 'all') {
    filteredRequests = filteredRequests.filter(req => req.method.toUpperCase() === currentFilter);
  }
  
  // Filtrer par recherche
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filteredRequests = filteredRequests.filter(req => {
      return req.url.toLowerCase().includes(query) || 
             (req.referer && req.referer.toLowerCase().includes(query)) || 
             (req.origin && req.origin.toLowerCase().includes(query));
    });
  }
  
  const text = filteredRequests
    .map(req => `${req.method} ${req.url} ${req.statusCode || 'Pending'}`)
    .join('\n');
  
  navigator.clipboard.writeText(text).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copié !';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  }).catch((error: Error) => {
    console.error('Erreur lors de la copie dans le presse-papier:', error);
  });
});

// Écouteurs d'événements pour la recherche
const clearSearchBtn = document.getElementById('clearSearchBtn') as HTMLButtonElement;

searchBtn.addEventListener('click', () => {
  searchQuery = searchInput.value;
  saveUIState();
  renderRequests();
});

// Effacer la recherche
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  saveUIState();
  renderRequests();
});

// Recherche dynamique pendant la saisie
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  // Effectuer la recherche uniquement si plus de 2 caractères ou si champ vide
  if (searchQuery.length > 2 || searchQuery.length === 0) {
    saveUIState();
    renderRequests();
  }
});

// Bouton de rafraîchissement
refreshBtn.addEventListener('click', () => {
  saveUIState();
  fetchRequests();
  // La restauration se fera dans le callback de renderRequests
});

// Écouter les mises à jour du background
browser.runtime.onMessage.addListener(
  function(message: MessageEvent, _sender: MessageSender, _sendResponse: (response?: any) => void): boolean {
    if (message.type === 'UPDATE_REQUESTS') {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs: {id?: number}[]) => {
        const tabId = tabs[0]?.id;
        
        if (tabId && message.payload && message.payload.tabId === tabId) {
          allRequests = message.payload.requests;
          renderRequests();
        }
      }).catch((error: Error) => {
        console.error('Erreur lors de la récupération de l\'onglet actif:', error);
      });
    }
    
    // Important : retourner true pour indiquer que nous répondrons de manière asynchrone
    return true;
  }
);

// Initialiser au chargement
fetchRequests();