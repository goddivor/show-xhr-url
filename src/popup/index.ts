// src/popup/index.ts
import browser from '../utils/browser';
// @ts-ignore - Ignorer l'erreur de type pour axios
import axios from 'axios';

// Formater la date
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// Fonction pour récupérer les cookies à partir des en-têtes de requête
function getCookiesFromRequestHeaders(headers?: Record<string, string>): string | null {
  if (!headers) return null;
  
  // Rechercher l'en-tête cookie (insensible à la casse)
  for (const headerName of Object.keys(headers)) {
    if (headerName.toLowerCase() === 'cookie') {
      return headers[headerName];
    }
  }
  
  return null;
}

// Fonction pour copier du texte dans le presse-papiers (avec secours)
function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Méthode 1: API Clipboard moderne
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(resolve)
        .catch(error => {
          console.warn('API Clipboard échouée, essai de méthode alternative', error);
          
          // Méthode 2: execCommand (méthode obsolète mais largement supportée)
          try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            
            // Rendre le textarea invisible mais présent dans le DOM
            textarea.style.position = 'fixed';
            textarea.style.left = '-999999px';
            textarea.style.top = '-999999px';
            document.body.appendChild(textarea);
            
            textarea.focus();
            textarea.select();
            
            const success = document.execCommand('copy');
            
            document.body.removeChild(textarea);
            
            if (success) {
              resolve();
            } else {
              reject(new Error('execCommand copy a échoué'));
            }
          } catch (execError) {
            reject(execError);
          }
        });
    } else {
      // Méthode 2 directement si l'API Clipboard n'est pas disponible
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        
        // Rendre le textarea invisible mais présent dans le DOM
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        
        textarea.focus();
        textarea.select();
        
        const success = document.execCommand('copy');
        
        document.body.removeChild(textarea);
        
        if (success) {
          resolve();
        } else {
          reject(new Error('execCommand copy a échoué'));
        }
      } catch (execError) {
        reject(execError);
      }
    }
  });
}

// Fonction pour simplifier le JSON avec l'API de ChatGPT
async function simplifyJsonWithChatGPT(jsonData: any): Promise<any> {
  try {
    const apiKey = "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";
    
    // Préparer le prompt et l'entrée
    const prompt = "You are capable of analyzing large JSON datasets and extracting the necessary information. Your task is to review the provided JSON data, identify the key pieces of information, and return a JSON object that contains only those relevant details. The final output should be a stringified version of this refined JSON.";
    
    // Convertir le JSON en chaîne
    const jsonString = JSON.stringify(jsonData);
    
    // Préparer la requête à l'API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: jsonString }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });
    
    // Vérifier si la requête a réussi
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }
    
    // Récupérer la réponse
    const data = await response.json();
    
    // Extraire la réponse du modèle
    const simplifiedJson = data.choices[0].message.content;
    
    // Tenter de parser la réponse comme JSON
    try {
      // Extraire uniquement la partie JSON si la réponse contient du texte supplémentaire
      const jsonMatch = simplifiedJson.match(/```json\s*([\s\S]*?)\s*```|^\s*(\{[\s\S]*\}|\[[\s\S]*\])\s*$/);
      
      if (jsonMatch) {
        const extractedJson = (jsonMatch[1] || jsonMatch[2]).trim();
        return JSON.parse(extractedJson);
      } else {
        // Essayer de parser directement
        return JSON.parse(simplifiedJson);
      }
    } catch (parseError) {
      console.error('Erreur lors du parsing de la réponse:', parseError);
      // Retourner la réponse brute si le parsing échoue
      return { simplified_text: simplifiedJson };
    }
  } catch (error) {
    console.error('Erreur lors de la simplification du JSON:', error);
    return { 
      error: true,
      message: `Erreur lors de la simplification: ${String(error)}` 
    };
  }
}

// Fonction pour afficher le résultat simplifié
function displaySimplifiedJson(data: any): void {
  // Créer une nouvelle fenêtre
  const resultWindow = window.open('', 'SimplifiedResult', 'width=800,height=600');
  
  if (!resultWindow) {
    alert('Veuillez autoriser les fenêtres popup pour voir le résultat.');
    return;
  }
  
  // Préparer le contenu HTML
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Simplifié</title>
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
      .title {
        color: #388E3C;
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <h2 class="title">JSON Simplifié par ChatGPT</h2>
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

// Écouter les messages des fenêtres popup
window.addEventListener('message', async (event) => {
  // Vérifier si le message est de type SIMPLIFY_JSON
  if (event.data && event.data.type === 'SIMPLIFY_JSON') {
    const jsonData = event.data.payload;
    
    try {
      // Simplifier le JSON avec l'API ChatGPT
      const simplifiedData = await simplifyJsonWithChatGPT(jsonData);
      
      // Afficher le résultat simplifié
      displaySimplifiedJson(simplifiedData);
      
      // Notifier la fenêtre d'origine que la simplification est terminée
      if (event.source) {
        (event.source as Window).postMessage({
          type: 'SIMPLIFICATION_COMPLETE'
        }, '*');
      }
    } catch (error) {
      console.error('Erreur lors de la simplification du JSON:', error);
      displaySimplifiedJson({
        error: true,
        message: `Erreur lors de la simplification: ${String(error)}`
      });
      
      // Notifier la fenêtre d'origine que la simplification a échoué
      if (event.source) {
        (event.source as Window).postMessage({
          type: 'SIMPLIFICATION_ERROR',
          message: String(error)
        }, '*');
      }
    }
  }
});

// Fonction qui tente de récupérer les cookies pour une URL
async function tryGetCookies(_url: string, requestHeaders?: Record<string, string>): Promise<string | null> {
  // Méthode 1: Utiliser les en-têtes de requête si disponibles
  const cookiesFromHeaders = getCookiesFromRequestHeaders(requestHeaders);
  if (cookiesFromHeaders) {
    return cookiesFromHeaders;
  }
  
  // Méthode 2: Tenter d'extraire directement le header cookie
  if (requestHeaders && Object.keys(requestHeaders).some(h => h.toLowerCase() === 'cookie')) {
    for (const key of Object.keys(requestHeaders)) {
      if (key.toLowerCase() === 'cookie') {
        return requestHeaders[key];
      }
    }
  }
  
  // Aucune méthode n'a fonctionné
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

// Extraire et formater les paramètres d'URL
// function extractUrlParams(url: string): string {
//   try {
//     // Vérifier si l'URL contient un point d'interrogation
//     if (!url.includes('?')) {
//       return 'Aucun paramètre dans cette URL';
//     }
    
//     // Créer un objet URL à partir de la chaîne
//     const urlObj = new URL(url);
    
//     // Récupérer les paramètres
//     const params = urlObj.searchParams;
    
//     // Si aucun paramètre, retourner un message
//     if (!params || params.toString() === '') {
//       return 'Aucun paramètre dans cette URL';
//     }
    
//     // Formater les paramètres
//     let formattedParams = '';
    
//     params.forEach((value, key) => {
//       // Essayer de décoder la valeur pour les valeurs encodées
//       try {
//         const decodedValue = decodeURIComponent(value);
//         formattedParams += `${key}:${decodedValue}\n`;
//       } catch (e) {
//         formattedParams += `${key}:${value}\n`;
//       }
//     });
    
//     return formattedParams || 'Aucun paramètre dans cette URL';
//   } catch (error) {
//     console.error('Erreur lors de l\'extraction des paramètres:', error);
    
//     // Si l'URL n'est pas valide pour l'API URL, essayer d'extraire manuellement
//     try {
//       const queryString = url.split('?')[1];
//       if (!queryString) {
//         return 'Aucun paramètre dans cette URL';
//       }
      
//       const paramPairs = queryString.split('&');
//       let formattedParams = '';
      
//       for (const pair of paramPairs) {
//         const [key, value] = pair.split('=');
//         if (key) {
//           try {
//             const decodedValue = decodeURIComponent(value || '');
//             formattedParams += `${key}:${decodedValue}\n`;
//           } catch (e) {
//             formattedParams += `${key}:${value || ''}\n`;
//           }
//         }
//       }
      
//       return formattedParams || 'Aucun paramètre dans cette URL';
//     } catch (e) {
//       return 'Erreur lors de l\'extraction des paramètres';
//     }
//   }
// }

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

// Fonction pour ouvrir une nouvelle fenêtre et afficher le résultat JSON
function displayJsonResult(data: any): void {
  // Créer une nouvelle fenêtre
  const resultWindow = window.open('', 'ResultWindow', 'width=800,height=600');
  
  if (!resultWindow) {
    alert('Veuillez autoriser les fenêtres popup pour voir le résultat.');
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
      .buttons {
        display: flex;
        gap: 10px;
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
      button:disabled {
        background: #cccccc;
        cursor: not-allowed;
      }
      button.simplify {
        background: #4CAF50;
      }
      button.simplify:hover {
        background: #388E3C;
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
      <div class="buttons">
        <button id="copyBtn">Copier le JSON</button>
        <button id="simplifyBtn" class="simplify">Simplifier</button>
      </div>
    </div>
    <pre id="jsonOutput">${JSON.stringify(data, null, 2)}</pre>
  </body>
  </html>
  `;
  
  // Écrire le contenu dans la nouvelle fenêtre
  resultWindow.document.write(htmlContent);
  resultWindow.document.close();
  
  // Attendre que le DOM soit chargé
  setTimeout(() => {
    try {
      // Ajouter les gestionnaires d'événements après le chargement du DOM
      const copyBtn = resultWindow.document.getElementById('copyBtn') as HTMLButtonElement;
      const simplifyBtn = resultWindow.document.getElementById('simplifyBtn') as HTMLButtonElement;
      const jsonOutput = resultWindow.document.getElementById('jsonOutput');
      
      if (copyBtn && jsonOutput) {
        copyBtn.addEventListener('click', function() {
          try {
            const jsonText = jsonOutput.textContent || '';
            
            // Utiliser notre fonction copyToClipboard
            copyToClipboard(jsonText)
              .then(() => {
                copyBtn.textContent = 'Copié !';
                setTimeout(() => {
                  copyBtn.textContent = 'Copier le JSON';
                }, 2000);
              })
              .catch((err: Error) => {
                console.error('Erreur lors de la copie:', err);
                alert('Impossible de copier le texte. Veuillez copier manuellement.');
              });
          } catch (error: unknown) {
            console.error('Erreur dans le gestionnaire de copie:', error);
          }
        });
      }
      
      if (simplifyBtn && jsonOutput) {
        simplifyBtn.addEventListener('click', function() {
          try {
            const jsonText = jsonOutput.textContent || '';
            
            // Désactiver le bouton pendant le traitement
            simplifyBtn.disabled = true;
            simplifyBtn.textContent = 'Traitement...';
            
            // Obtenir les données JSON
            const jsonData = JSON.parse(jsonText);
            
            // Envoyer les données JSON pour simplification
            try {
              simplifyJsonWithChatGPT(jsonData)
                .then(simplifiedData => {
                  // Afficher le résultat simplifié
                  displaySimplifiedJson(simplifiedData);
                  
                  // Réactiver le bouton
                  simplifyBtn.disabled = false;
                  simplifyBtn.textContent = 'Terminé !';
                  setTimeout(() => {
                    simplifyBtn.textContent = 'Simplifier';
                  }, 2000);
                })
                .catch((error: Error) => {
                  console.error('Erreur lors de la simplification:', error);
                  simplifyBtn.disabled = false;
                  simplifyBtn.textContent = 'Erreur !';
                  setTimeout(() => {
                    simplifyBtn.textContent = 'Simplifier';
                  }, 2000);
                  alert('Erreur lors de la simplification: ' + error.message);
                });
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.error('Erreur lors de l\'appel à simplifyJsonWithChatGPT:', error);
              simplifyBtn.disabled = false;
              simplifyBtn.textContent = 'Erreur !';
              setTimeout(() => {
                simplifyBtn.textContent = 'Simplifier';
              }, 2000);
              alert('Erreur lors de la simplification: ' + errorMessage);
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Erreur dans le gestionnaire de simplification:', error);
            if (simplifyBtn) {
              simplifyBtn.disabled = false;
              simplifyBtn.textContent = 'Erreur !';
              setTimeout(() => {
                simplifyBtn.textContent = 'Simplifier';
              }, 2000);
            }
            alert('Erreur lors du parsing JSON: ' + errorMessage);
          }
        });
      }
    } catch (error: unknown) {
      console.error('Erreur lors de l\'ajout des gestionnaires d\'événements:', error);
    }
  }, 500); // Attendre 500ms pour s'assurer que le DOM est complètement chargé
}

// Créer l'élément pour afficher les détails d'une requête
function createRequestDetailsElement(request: DetailedRequest, index: number): HTMLElement {
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'request-details';
  detailsContainer.id = `request-details-${index}`;
  detailsContainer.style.display = 'none'; // Masquer par défaut
  
  // Créer les boutons d'action
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'details-actions';
  
  // Bouton de test de requête GET uniquement pour les requêtes GET
  if (request.method.toUpperCase() === 'GET') {
    const testRequestBtn = document.createElement('button');
    testRequestBtn.textContent = 'Fetch';
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
        testRequestBtn.textContent = 'Fetch';
        testRequestBtn.disabled = false;
      }
    });
    
    actionsContainer.appendChild(testRequestBtn);
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Fermer';
  closeBtn.addEventListener('click', () => {
    detailsContainer.style.display = 'none';
    selectedRequestId = null;
  });
  
  actionsContainer.appendChild(closeBtn);
  detailsContainer.appendChild(actionsContainer);
  
  return detailsContainer;
}

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
      if (request.method.toUpperCase() === 'GET') {
        item.classList.add('get-request');
      }
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

// Recherche dynamique pendant la saisie
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  // Effectuer la recherche uniquement si plus de 2 caractères ou si champ vide
  if (searchQuery.length > 2 || searchQuery.length === 0) {
    saveUIState();
    renderRequests();
  }
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