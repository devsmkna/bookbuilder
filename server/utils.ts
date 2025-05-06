/**
 * Utility functions for server operations
 */

import crypto from 'crypto';

/**
 * Genera un ID univoco semplice (non UUID completo)
 * @param prefix - Prefisso opzionale per l'ID (es. 'char', 'race', ecc.)
 * @returns ID univoco
 */
export function generateId(prefix?: string): string {
  const uniquePart = crypto.randomBytes(4).toString('hex');
  return prefix ? `${prefix}_${uniquePart}` : uniquePart;
}

/**
 * Formatta la data corrente in formato ISO
 * @returns Data formattata
 */
export function formatDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Verifica se due date rappresentano lo stesso giorno
 * @param date1 - Prima data (ISO o Date)
 * @param date2 - Seconda data (ISO o Date), default = oggi
 * @returns true se rappresentano lo stesso giorno
 */
export function isSameDay(date1: string | Date, date2: string | Date = new Date()): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Verifica se una data è all'interno degli ultimi N giorni
 * @param date - Data da verificare (ISO o Date)
 * @param days - Numero di giorni da considerare
 * @returns true se la data è all'interno del periodo
 */
export function isWithinLastDays(date: string | Date, days: number): boolean {
  const compareDate = new Date(date);
  const now = new Date();
  
  // Imposta l'ora a mezzanotte per confrontare solo i giorni
  compareDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  // Calcola la differenza in millisecondi e converti in giorni
  const diffTime = Math.abs(now.getTime() - compareDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= days;
}