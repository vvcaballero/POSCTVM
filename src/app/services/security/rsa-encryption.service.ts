
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RsaEncryptionService {

  async encryptPassword(
    password: string,
    publicKeyBase64: string
  ): Promise<string> {

    // Convertir clave pública Base64 a bytes
    const publicKeyBytes = this.base64ToArrayBuffer(
      publicKeyBase64
    );

    // Importar clave pública RSA
    const publicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyBytes,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['encrypt']
    );

    // Convertir password a bytes
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    // Cifrar password
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      passwordBytes
    );

    // Convertir resultado a Base64
    return this.arrayBufferToBase64(encryptedBuffer);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {

    const bytes = new Uint8Array(buffer);
    let binary = '';

    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  }
}
