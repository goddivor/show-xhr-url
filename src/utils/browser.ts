// src/utils/browser.ts

/**
 * Module qui expose l'API browser compatible entre navigateurs
 * Utilise chrome si browser n'est pas disponible
 */

// @ts-ignore - Ignorer les erreurs de type ici
const browser = typeof chrome !== 'undefined' ? chrome : (typeof browser !== 'undefined' ? browser : {});

export default browser;