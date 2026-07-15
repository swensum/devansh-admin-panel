import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../firebase';

/** Uploads a product image file and returns its public download URL. */
export async function uploadProductImage(file) {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `product_images/${uuidv4()}.${extension}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function deleteProductImage(downloadUrl) {
  try {
    const storageRef = ref(storage, downloadUrl);
    await deleteObject(storageRef);
  } catch {
    // Image may already be gone — safe to ignore.
  }
}
