import {
    collection,
    doc,
    addDoc,
    updateDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create a new booking in Firestore
 */
export async function createBooking(userId, userName, serviceType, userLocation) {
    const bookingRef = await addDoc(collection(db, 'bookings'), {
        userId,
        userName,
        serviceType,
        userLocation: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
        },
        assignedHelper: null,
        helperName: null,
        helperLocation: null,
        status: 'searching',
        rejectedHelpers: [],
        assignmentAttempts: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return bookingRef.id;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(bookingId, status, additionalData = {}) {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
        status,
        ...additionalData,
        updatedAt: serverTimestamp()
    });
}

/**
 * Listen to a specific booking in real-time
 */
export function listenToBooking(bookingId, callback) {
    return onSnapshot(doc(db, 'bookings', bookingId), (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() });
        }
    });
}

/**
 * Listen to bookings for a specific user
 */
export function listenToUserBookings(userId, callback) {
    const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(bookings);
    });
}

/**
 * Listen to bookings assigned to a specific helper
 */
export function listenToHelperBookings(helperId, callback) {
    const q = query(
        collection(db, 'bookings'),
        where('assignedHelper', '==', helperId)
    );
    return onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(bookings);
    });
}

/**
 * Listen to all active bookings (admin)
 */
export function listenToAllBookings(callback) {
    const q = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(bookings);
    });
}

/**
 * Helper accepts a booking
 */
export async function acceptBooking(bookingId, helperId, helperName, helperLocation) {
    const bookingRef = doc(db, 'bookings', bookingId);
    const helperRef = doc(db, 'helpers', helperId);

    await updateDoc(bookingRef, {
        status: 'assigned',
        assignedHelper: helperId,
        helperName,
        helperLocation,
        updatedAt: serverTimestamp()
    });

    await updateDoc(helperRef, {
        status: 'busy'
    });
}

/**
 * Helper rejects a booking - adds helper to rejected list and triggers reassignment
 */
export async function rejectBooking(bookingId, helperId) {
    const bookingRef = doc(db, 'bookings', bookingId);
    const snapshot = await getDoc(bookingRef);

    if (snapshot.exists()) {
        const data = snapshot.data();
        const rejected = data.rejectedHelpers || [];

        await updateDoc(bookingRef, {
            assignedHelper: null,
            helperName: null,
            helperLocation: null,
            status: 'searching',
            rejectedHelpers: [...rejected, helperId],
            updatedAt: serverTimestamp()
        });
    }
}

/**
 * Complete a booking
 */
export async function completeBooking(bookingId, helperId) {
    const bookingRef = doc(db, 'bookings', bookingId);
    const helperRef = doc(db, 'helpers', helperId);

    await updateDoc(bookingRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
    });

    await updateDoc(helperRef, {
        status: 'available'
    });
}

/**
 * Listen to pending bookings for a specific helper (where they are the assigned helper and status is pending_acceptance)
 */
export function listenToPendingRequests(helperId, callback) {
    const q = query(
        collection(db, 'bookings'),
        where('assignedHelper', '==', helperId),
        where('status', '==', 'pending_acceptance')
    );
    return onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(bookings);
    });
}
