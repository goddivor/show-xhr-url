// src/popup/index.ts
import browser from '../utils/browser';
// @ts-ignore - Ignorer l'erreur de type pour axios
import axios from 'axios';
// Importer notre utilitaire de cookies
import { tryGetCookies } from '../utils';

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

// Fonction pour extraire le token CSRF des en-têtes de requête
function extractCsrfToken(requestHeaders?: Record<string, string>): string | null {
  if (!requestHeaders) return null;
  
  // Chercher le token CSRF dans différentes variations possibles de noms d'en-têtes
  const csrfHeaderNames = [
    'csrf-token',
    'x-csrf-token',
    'xsrf-token',
    'x-xsrf-token',
    '_csrf',
    '_csrftoken'
  ];
  
  for (const name of csrfHeaderNames) {
    if (requestHeaders[name]) {
      return requestHeaders[name];
    }
  }
  
  return null;
}

// Fonction pour tester une requête GET avec Axios
async function testGetRequest(request: DetailedRequest): Promise<any> {
  try {
    // Extraire le token CSRF des en-têtes de la requête
    const csrfToken = extractCsrfToken(request.requestHeaders);
    
    // Préparer les en-têtes pour la requête Axios
    const headers: Record<string, string> = {};
    
    // Ajouter le token CSRF si disponible
    if (csrfToken) {
      headers['Csrf-token'] = csrfToken;
    }
    
    // Tenter de récupérer les cookies pour cette URL
    const cookies = await tryGetCookies(request.url, request.requestHeaders);
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    // Exécuter la requête avec Axios
    const response = await axios.get(request.url, {
      headers: headers,
      withCredentials: true // Pour inclure les cookies dans la requête
    });
    
    return response.data;
  } catch (error: unknown) {
    console.error('Erreur lors du test de la requête:', error);
    
    // Vérifier si l'erreur est une erreur Axios avec réponse
    if (axios.isAxiosError(error) && error.response) {
      return {
        error: true,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
    }
    return { error: true, message: String(error) };
  }
}

// Fonction pour ouvrir une nouvelle fenêtre et afficher le résultat JSON
function displayJsonResult(data: any): void {
  // Tenter d'ouvrir une nouvelle fenêtre
  const resultWindow = window.open('', 'ResultWindow', 'width=800,height=600');
  
  if (!resultWindow) {
    // Si l'ouverture de la fenêtre échoue, utiliser une méthode alternative
    displayJsonResultAlternative(data);
    return;
  }
  
  // Préparer le contenu HTML
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Résultat de la requête</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }
      pre {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 15px;
        overflow: auto;
        max-height: 80vh;
        font-size: 14px;
        line-height: 1.5;
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      button {
        background: #4688F1;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background: #3B78E7;
      }
      .success { color: #388E3C; }
      .error { color: #D32F2F; }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <h2 class="${data.error ? 'error' : 'success'}">
        ${data.error ? 'Erreur' : 'Succès'} 
        ${data.status ? `(${data.status} ${data.statusText})` : ''}
      </h2>
      <button id="copyBtn">Copier le JSON</button>
    </div>
    <pre id="jsonOutput">${JSON.stringify(data, null, 2)}</pre>
    
    <script>
      document.getElementById('copyBtn').addEventListener('click', function() {
        const jsonText = document.getElementById('jsonOutput').textContent;
        navigator.clipboard.writeText(jsonText)
          .then(() => {
            this.textContent = 'Copié !';
            setTimeout(() => { this.textContent = 'Copier le JSON'; }, 2000);
          })
          .catch(err => {
            console.error('Erreur lors de la copie:', err);
            alert('Impossible de copier le texte');
          });
      });
    </script>
  </body>
  </html>
  `;
  
  // Écrire le contenu dans la nouvelle fenêtre
  resultWindow.document.write(htmlContent);
  resultWindow.document.close();
}

// Méthode alternative d'affichage si window.open échoue
function displayJsonResultAlternative(data: any): void {
  // Création d'un élément modal dans le DOM actuel
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background-color: white;
    border-radius: 8px;
    width: 80%;
    max-width: 800px;
    max-height: 80%;
    overflow: auto;
    padding: 20px;
    position: relative;
  `;
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #333;
  `;
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  const title = document.createElement('h2');
  title.textContent = data.error ? 'Erreur' : 'Succès';
  title.style.color = data.error ? '#D32F2F' : '#388E3C';
  if (data.status) {
    title.textContent += ` (${data.status} ${data.statusText})`;
  }
  
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copier le JSON';
  copyButton.style.cssText = `
    background: #4688F1;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 10px;
  `;
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      .then(() => {
        copyButton.textContent = 'Copié !';
        setTimeout(() => { copyButton.textContent = 'Copier le JSON'; }, 2000);
      })
      .catch(err => {
        console.error('Erreur lors de la copie:', err);
        alert('Impossible de copier le texte');
      });
  });
  
  const preElement = document.createElement('pre');
  preElement.style.cssText = `
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    overflow: auto;
    max-height: 60vh;
    font-size: 14px;
    line-height: 1.5;
  `;
  preElement.textContent = JSON.stringify(data, null, 2);
  
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(copyButton);
  modalContent.appendChild(preElement);
  modal.appendChild(modalContent);
  
  document.body.appendChild(modal);
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
  
  // Bouton de test de requête GET uniquement pour les requêtes GET
  if (request.method.toUpperCase() === 'GET') {
    const testRequestBtn = document.createElement('button');
    testRequestBtn.textContent = 'Tester la requête';
    testRequestBtn.className = 'test-request-btn';
    testRequestBtn.addEventListener('click', async () => {
      testRequestBtn.textContent = 'Chargement...';
      testRequestBtn.disabled = true;
      
      try {
        const result = await testGetRequest(request);
        displayJsonResult(result);
      } catch (error) {
        console.error('Erreur lors du test de la requête:', error);
        displayJsonResult({ error: true, message: String(error) });
      } finally {
        testRequestBtn.textContent = 'Tester la requête';
        testRequestBtn.disabled = false;
      }
    });
    
    actionsContainer.appendChild(testRequestBtn);
  }
  
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