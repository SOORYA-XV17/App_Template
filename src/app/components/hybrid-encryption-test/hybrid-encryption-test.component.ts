import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HybridEncryptionService } from '../../services/hybrid-encryption.service';

@Component({
  selector: 'app-hybrid-encryption-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Hybrid Encryption Test</h2>
        
        <div class="space-y-6">
          <!-- Input Section -->
          <div>
            <label for="inputText" class="block text-sm font-medium text-gray-700 mb-2">
              Text to Encrypt:
            </label>
            <textarea
              id="inputText"
              [(ngModel)]="inputText"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter text to encrypt and send to server..."
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4">
            <button
              (click)="testHybridEncryption()"
              [disabled]="isLoading"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Processing...' : 'Encrypt & Send to Server' }}
            </button>
            
            <button
              (click)="clearSession()"
              class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Session
            </button>
          </div>

          <!-- Status -->
          <div *ngIf="status" class="p-4 rounded-md" [ngClass]="statusClass">
            <p class="text-sm font-medium">{{ status }}</p>
          </div>

          <!-- Results -->
          <div *ngIf="result" class="space-y-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Encryption Results:</h3>
              <div class="bg-gray-50 p-4 rounded-md">
                <p class="text-sm text-gray-600 mb-2">Decrypted Response:</p>
                <p class="text-gray-800 font-mono text-sm">{{ result }}</p>
              </div>
            </div>
          </div>

          <!-- Session Info -->
          <div *ngIf="sessionInfo" class="bg-blue-50 p-4 rounded-md">
            <h3 class="text-lg font-semibold text-blue-800 mb-2">Session Information:</h3>
            <div class="space-y-2 text-sm">
              <p><strong>Session Established:</strong> {{ sessionInfo.isEstablished ? 'Yes' : 'No' }}</p>
              <p *ngIf="sessionInfo.sessionKey"><strong>Session Key:</strong> <span class="font-mono">{{ sessionInfo.sessionKey.substring(0, 16) }}...</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HybridEncryptionTestComponent {
  inputText: string = 'Hello World!';
  isLoading: boolean = false;
  status: string = '';
  result: string = '';
  sessionInfo: any = null;

  constructor(private hybridEncryptionService: HybridEncryptionService) {
    this.updateSessionInfo();
  }

  get statusClass(): string {
    if (this.status.includes('Error')) {
      return 'bg-red-50 text-red-800';
    } else if (this.status.includes('Success')) {
      return 'bg-green-50 text-green-800';
    } else {
      return 'bg-blue-50 text-blue-800';
    }
  }

  async testHybridEncryption() {
    if (!this.inputText.trim()) {
      this.status = 'Error: Please enter some text to encrypt';
      return;
    }

    this.isLoading = true;
    this.status = 'Starting hybrid encryption process...';
    this.result = '';

    try {
      const decryptedOutput = await this.hybridEncryptionService.performHybridEncryption(this.inputText);
      this.result = decryptedOutput;
      this.status = 'Success: Data encrypted, sent to server, and response decrypted successfully!';
      this.updateSessionInfo();
    } catch (error) {
      console.error('Hybrid encryption test failed:', error);
      this.status = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    } finally {
      this.isLoading = false;
    }
  }

  clearSession() {
    this.hybridEncryptionService.clearSession();
    this.updateSessionInfo();
    this.status = 'Session cleared successfully';
    this.result = '';
  }

  private updateSessionInfo() {
    this.sessionInfo = {
      isEstablished: this.hybridEncryptionService.isSessionEstablished(),
      sessionKey: this.hybridEncryptionService.getCurrentSessionKey()
    };
  }
} 