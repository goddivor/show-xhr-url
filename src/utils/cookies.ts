// src/utils/cookies.ts
import browser from './browser';

// Interface pour représenter un cookie
interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expirationDate?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// Fonction pour vérifier si l'API cookies est disponible
export function isCookieApiAvailable(): boolean {
  return !!(browser && browser.cookies && typeof browser.cookies.getAll === 'function');
}

// Obtenir les cookies d'une URL en utilisant les en-têtes de requête
export function getCookiesFromRequestHeaders(headers?: Record<string, string>): string | null {
  if (!headers) return null;
  
  // Rechercher le header cookie (insensible à la casse)
  for (const headerName of Object.keys(headers)) {
    if (headerName.toLowerCase() === 'cookie') {
      return headers[headerName];
    }
  }
  
  return null;
}

// Fonction qui tente de récupérer les cookies d'une URL, de plusieurs façons
export async function tryGetCookies(url: string, requestHeaders?: Record<string, string>): Promise<string | null> {
  // Méthode 1: Utiliser les en-têtes de requête si disponibles
  const cookiesFromHeaders = getCookiesFromRequestHeaders(requestHeaders);
  if (cookiesFromHeaders) {
    return cookiesFromHeaders;
  }
  
  // Méthode 2: Utiliser l'API cookies si disponible
  if (isCookieApiAvailable()) {
    try {
      const urlObj = new URL(url);
      // @ts-ignore - Ignorer l'erreur de type pour le browser.cookies
      const cookies: Cookie[] = await browser.cookies.getAll({ domain: urlObj.hostname });
      if (cookies && cookies.length > 0) {
        return cookies.map((c: Cookie) => `${c.name}=${c.value}`).join('; ');
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération des cookies via l\'API:', error);
    }
  }
  
  // Aucune méthode n'a fonctionné
  return null;
}