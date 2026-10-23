import { validUsers } from './users.js';

/**
 * Modern Browser SHA-256 Engine
 */
export async function generateSHA256(text) {
  const enc = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Authenticates candidate against SHA-256 credentials
 */
export async function loginCandidate(rollNumber, pin) {
  const cleanRoll = rollNumber.trim().toUpperCase();
  const hashedPin = await generateSHA256(pin.trim());

  const matchedUser = validUsers.find(u => u.rollNo === cleanRoll && u.pinHash === hashedPin);

  if (matchedUser) {
    // Set 30-day cookie for Cloudflare Worker check
    document.cookie = "ias_session_token=true; path=/; max-age=2592000; Secure; SameSite=Strict";
    localStorage.setItem("csemocks_active_user", JSON.stringify(matchedUser));
    return { success: true, user: matchedUser };
  }

  return { success: false, message: "Invalid Roll Number or Access PIN. Contact Ankit via WhatsApp if not registered." };
}

export function isUserLoggedIn() {
  return document.cookie.includes("ias_session_token=true") && localStorage.getItem("csemocks_active_user") !== null;
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("csemocks_active_user"));
  } catch {
    return null;
  }
}

export function logoutCandidate() {
  document.cookie = "ias_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict";
  localStorage.removeItem("csemocks_active_user");
  window.location.href = "/";
}