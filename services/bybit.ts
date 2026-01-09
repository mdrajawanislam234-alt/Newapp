
import { BybitConfig } from "../types";

/**
 * Bybit API V5 Signature Helper
 * Note: Browser-side signature is for educational/demo purposes. 
 * In a production app, this should ideally be handled via a proxy server to hide the secret.
 */
async function generateSignature(secret: string, timestamp: string, apiKey: string, recvWindow: string, queryString: string): Promise<string> {
  const message = timestamp + apiKey + recvWindow + queryString;
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await window.crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export const fetchBybitBalance = async (config: BybitConfig): Promise<number> => {
  if (!config.apiKey || !config.apiSecret) return 0;

  const timestamp = Date.now().toString();
  const recvWindow = "5000";
  const queryString = "accountType=UNIFIED"; // Standard for V5
  const signature = await generateSignature(config.apiSecret, timestamp, config.apiKey, recvWindow, queryString);

  try {
    const response = await fetch(`https://api.bybit.com/v5/account/wallet-balance?${queryString}`, {
      method: 'GET',
      headers: {
        'X-BAPI-API-KEY': config.apiKey,
        'X-BAPI-TIMESTAMP': timestamp,
        'X-BAPI-SIGN': signature,
        'X-BAPI-RECV-WINDOW': recvWindow,
      }
    });

    const data = await response.json();
    if (data.retCode === 0 && data.result?.list?.[0]) {
      return parseFloat(data.result.list[0].totalEquity) || 0;
    }
    throw new Error(data.retMsg || "Bybit API Error");
  } catch (error) {
    console.error("Bybit Fetch Error:", error);
    throw error;
  }
};
