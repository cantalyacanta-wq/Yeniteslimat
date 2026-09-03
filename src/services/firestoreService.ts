import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DeliveryRequest, UserAccount, CourierInfo } from '../types';

const REQUESTS_COLLECTION = 'delivery_requests';
const USERS_COLLECTION = 'users';
const COURIERS_COLLECTION = 'couriers';

// Real-time listener for all delivery requests
export function subscribeToDeliveryRequests(callback: (requests: DeliveryRequest[]) => void) {
  try {
    const colRef = collection(db, REQUESTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: DeliveryRequest[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DeliveryRequest;
          // Filter out mock placeholder IDs
          if (data && data.id && !String(data.id).startsWith('req-sample-')) {
            list.push({ ...data, id: docSnap.id });
          }
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(list);
      },
      (error) => {
        console.warn('[Firestore] Error listening to delivery requests:', error);
      }
    );
  } catch (err) {
    console.warn('[Firestore] Could not attach request listener:', err);
    return () => {};
  }
}

// Real-time listener for users
export function subscribeToUsers(callback: (users: UserAccount[]) => void) {
  try {
    const colRef = collection(db, USERS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: UserAccount[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserAccount;
          if (data && data.id) {
            list.push({ ...data, id: docSnap.id });
          }
        });
        if (list.length > 0) {
          callback(list);
        }
      },
      (error) => {
        console.warn('[Firestore] Error listening to users:', error);
      }
    );
  } catch (err) {
    console.warn('[Firestore] Could not attach users listener:', err);
    return () => {};
  }
}

// Save or create delivery request in Firestore
export async function saveRequestToFirestore(request: DeliveryRequest): Promise<void> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, request.id);
    await setDoc(docRef, JSON.parse(JSON.stringify(request)), { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to save request:', err);
  }
}

// Update delivery request in Firestore safely with merge: true so it never fails with NOT_FOUND if document does not exist yet
export async function updateRequestInFirestore(requestId: string, updates: Partial<DeliveryRequest>): Promise<void> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, requestId);
    await setDoc(docRef, JSON.parse(JSON.stringify(updates)), { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to update request:', err);
  }
}

// Save or update user in Firestore
export async function saveUserToFirestore(user: UserAccount): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, JSON.parse(JSON.stringify(user)), { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to save user:', err);
  }
}

// Delete user in Firestore
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('[Firestore] Failed to delete user:', err);
  }
}

const EMAIL_QUEUE_COLLECTION = 'email_queue';

// Add email job to Firestore queue
export async function enqueueEmailToFirestore(job: {
  orderId: string;
  trackingCode: string;
  recipients: string[];
  subject: string;
  textContent: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  attempts?: number;
}): Promise<void> {
  try {
    const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const docRef = doc(db, EMAIL_QUEUE_COLLECTION, jobId);
    await setDoc(docRef, {
      id: jobId,
      ...job,
      attempts: job.attempts || 0,
      maxAttempts: 2,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Firestore] Failed to enqueue email job:', err);
  }
}

