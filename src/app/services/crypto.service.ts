import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private baseUrl = '/api/crypto';

  constructor(private http: HttpClient) {}

  getPublicKey(): Observable<string> {
    return this.http.get(this.baseUrl + '/public-key', { responseType: 'text' });
  }

  sendSessionKey(encryptedKey: string): Observable<string> {
    return this.http.post(this.baseUrl + '/session-key', encryptedKey, { responseType: 'text' });
  }

  sendSecureData(encryptedData: string): Observable<string> {
    return this.http.post(this.baseUrl + '/secure-data', encryptedData, { responseType: 'text' });
  }
} 