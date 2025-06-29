import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

declare var JSEncrypt: any;
declare var CryptoJS: any;

export interface PublicKeyResponse {
  publicKey: string;
}

export interface SessionResponse {
  sessionId: string;
  status: string;
}

export interface EncryptedDataResponse {
  output: string;
  status: string;
}

export interface HybridEncryptionRequest {
  encryptedKey?: string;
  encryptedData?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HybridEncryptionService {
  private baseUrl = 'http://localhost:8080/api/crypto';
  private sessionKey: string | null = null;
  private serverPublicKey: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Step 1: Get the public key from the server
   */
  getPublicKey(): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/public-key`, { responseType: 'text' as 'json', withCredentials: true })
      .pipe(
        map((response: string) => {
          this.serverPublicKey = response;
          console.log('STEP 1 - PUBLIC KEY FETCHED FROM SERVER');
          console.log(this.serverPublicKey);
          return response;
        })
      );
  }

  /**
   * Step 2: Generate a secure session key
   */
  generateSessionKey(length: number = 16): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const sessionKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    console.log('STEP 2 - SECURE SESSION KEY GENERATED', sessionKey);
    return sessionKey;
  }

  /**
   * Step 3: Encrypt session key with server public key
   */
  encryptSessionKey(sessionKey: string): string {
    if (!this.serverPublicKey) {
      throw new Error('Server public key not available. Call getPublicKey() first.');
    }

    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(this.serverPublicKey);
    const encryptedSessionKey = encrypt.encrypt(sessionKey);
    console.log('STEP 3 - SESSION KEY ENCRYPTED WITH SERVER PUBLIC KEY', encryptedSessionKey);
    return encryptedSessionKey;
  }

  /**
   * Step 4: Establish session by sending encrypted session key
   */
  establishSession(encryptedSessionKey: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/session-key`, encryptedSessionKey, { responseType: 'text', withCredentials: true })
      .pipe(
        map((response: string) => {
          console.log('STEP 4 - SESSION ESTABLISHED', response);
          return response;
        })
      );
  }

  /**
   * Step 5: Encrypt data with AES using session key
   */
  encryptAES(plainText: string, secretKey: string): string {
    const keyBytes = CryptoJS.enc.Hex.parse(secretKey);
    const ivBytes = CryptoJS.enc.Hex.parse(secretKey); // Using same key as IV
    
    console.log('Encrypting with key (hex):', secretKey);
    console.log('Key bytes length:', keyBytes.words.length * 4);
    console.log('IV bytes length:', ivBytes.words.length * 4);
    
    const encrypted = CryptoJS.AES.encrypt(plainText, keyBytes, {
      iv: ivBytes,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    
    const result = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    console.log('STEP 5 - PAYLOAD ENCRYPTED WITH SESSION KEY', result);
    return result;
  }

  /**
   * Step 6: Send encrypted data to server
   */
  sendEncryptedData(encryptedData: string): Observable<EncryptedDataResponse> {
    return this.http.post(`${this.baseUrl}/secure-data`, encryptedData, { responseType: 'text' as 'json', withCredentials: true })
      .pipe(
        map((encryptedResponse: any) => {
          const encryptedResponseStr = encryptedResponse as string;
          console.log('STEP 6 - ENCRYPTED DATA SENT TO SERVER');
          console.log('STEP 7 - RECEIVED ENCRYPTED RESPONSE:', encryptedResponseStr);
          
          // Decrypt the response using the session key
          const decryptedResponse = this.decryptAES(encryptedResponseStr, this.sessionKey!);
          console.log('STEP 8 - DECRYPTED RESPONSE:', decryptedResponse);
          
          return { output: decryptedResponse, status: 'success' };
        })
      );
  }

  /**
   * Step 7: Decrypt server response with session key
   */
  decryptAES(encryptString: string, hexKey: string): string {
    const keyBytes = CryptoJS.enc.Hex.parse(hexKey);
    const ivBytes = CryptoJS.enc.Hex.parse(hexKey); // Using same key as IV
    const decodeBase64 = CryptoJS.enc.Base64.parse(encryptString);

    const decryptedData = CryptoJS.AES.decrypt({
      ciphertext: decodeBase64
    }, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const result = decryptedData.toString(CryptoJS.enc.Utf8);
    console.log('STEP 7 - SERVER RESPONSE DECRYPTED', result);
    return result;
  }

  /**
   * Complete hybrid encryption flow
   */
  async performHybridEncryption(data: string): Promise<string> {
    try {
      // Step 1: Get public key
      await this.getPublicKey().toPromise();
      
      // Step 2: Generate session key
      this.sessionKey = this.generateSessionKey(16);
      
      // Step 3: Encrypt session key
      const encryptedSessionKey = this.encryptSessionKey(this.sessionKey);
      
      // Step 4: Establish session
      await this.establishSession(encryptedSessionKey).toPromise();
      
      // Step 5: Encrypt data
      const encryptedData = this.encryptAES(data, this.sessionKey);
      
      // Step 6: Send encrypted data
      const response = await this.sendEncryptedData(encryptedData).toPromise();
      
      // Step 7: Decrypt response
      const decryptedOutput = this.decryptAES(response!.output, this.sessionKey);
      
      return decryptedOutput;
    } catch (error) {
      console.error('Hybrid encryption failed:', error);
      throw error;
    }
  }

  /**
   * Get current session key (for debugging/testing)
   */
  getCurrentSessionKey(): string | null {
    return this.sessionKey;
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    this.sessionKey = null;
    this.serverPublicKey = null;
  }

  /**
   * Check if session is established
   */
  isSessionEstablished(): boolean {
    return this.sessionKey !== null && this.serverPublicKey !== null;
  }
} 