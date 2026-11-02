'use client';

import { apiRequest } from '../api-client';

export type ImageKind = 'avatar' | 'player-photo' | 'team-logo' | 'verification-doc';
export interface UploadedImage {
  url: string;
  publicId: string;
}

/** Same as the app's image_prep: long edge ≤ 1600 px, JPEG quality 80. */
export async function prepareImage(file: File, maxEdge = 1600, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('compress failed'))), 'image/jpeg', quality));
}

export async function uploadImage(kind: ImageKind, file: File): Promise<UploadedImage> {
  const blob = await prepareImage(file);
  const form = new FormData();
  form.set('type', kind);
  form.set('file', blob, 'image.jpg');
  return apiRequest<UploadedImage>('/media/images', { method: 'POST', body: form });
}

async function multipart<T>(method: 'PUT' | 'POST', path: string, file: File): Promise<T> {
  const blob = await prepareImage(file);
  const form = new FormData();
  form.set('file', blob, 'image.jpg');
  return apiRequest<T>(path, { method, body: form });
}

export const uploadAvatar = (file: File) => multipart<{ avatarUrl: string }>('PUT', '/users/me/avatar', file);
export const uploadPlayerPhoto = (file: File) => multipart<unknown>('POST', '/players/me/media/photos', file);
