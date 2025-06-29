import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Code {
  id?: number;
  keycode: string;
  valuekey: string;
  category?: string;
  displayOrder?: number;
  description?: string;
  isActive?: boolean;
  parentCode?: Code;
}

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Basic CRUD Operations
  createOrUpdate(code: Code): Observable<Code> {
    return this.http.post<Code>(`${this.baseUrl}/location-codes`, code);
  }

  getByKeycode(keycode: string): Observable<Code> {
    return this.http.get<Code>(`${this.baseUrl}/location-codes/${keycode}`);
  }

  getById(id: number): Observable<Code> {
    return this.http.get<Code>(`${this.baseUrl}/location-codes/id/${id}`);
  }

  getAll(): Observable<Code[]> {
    return this.http.get<Code[]>(`${this.baseUrl}/location-codes`);
  }

  getActiveCodes(): Observable<Code[]> {
    return this.http.get<Code[]>(`${this.baseUrl}/location-codes/active`);
  }

  getRootCodes(): Observable<Code[]> {
    return this.http.get<Code[]>(`${this.baseUrl}/location-codes/root`);
  }

  getByParent(parentKeycode: string): Observable<Code[]> {
    return this.http.get<Code[]>(`${this.baseUrl}/location-codes/parent/${parentKeycode}`);
  }

  getByCategory(category: string): Observable<Code[]> {
    return this.http.get<Code[]>(`${this.baseUrl}/location-codes/category/${category}`);
  }

  updateCode(id: number, code: Code): Observable<Code> {
    return this.http.put<Code>(`${this.baseUrl}/location-codes/id/${id}`, code);
  }

  deleteByKeycode(keycode: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/location-codes/${keycode}`);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/location-codes/id/${id}`);
  }

  // Ordering Operations
  moveCodeUp(id: number): Observable<Code> {
    return this.http.put<Code>(`${this.baseUrl}/location-codes/id/${id}/move-up`, {});
  }

  moveCodeDown(id: number): Observable<Code> {
    return this.http.put<Code>(`${this.baseUrl}/location-codes/id/${id}/move-down`, {});
  }

  moveCodeToPosition(id: number, position: number): Observable<Code> {
    return this.http.put<Code>(`${this.baseUrl}/location-codes/id/${id}/move-to/${position}`, {});
  }

  reorderCodes(codeIds: number[]): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/location-codes/reorder`, codeIds);
  }

  // Activation Operations
  activateCode(id: number): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/location-codes/id/${id}/activate`, {});
  }

  deactivateCode(id: number): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/location-codes/id/${id}/deactivate`, {});
  }

  getByParentCode(parentCode: string) {
    return this.http.get<Code[]>(`${this.baseUrl}/location-codes/parent/${parentCode}`);
  }
} 