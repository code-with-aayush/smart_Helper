import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { haversineDistance } from '../utils/haversine';

/**
 * Auto-Assignment Engine
 * 
 * Finds the best available helper for a booking based on:
 * 1. Matching service skill
 * 2. Available status
 * 3. Not previously rejected
 * 4. Nearest distance (Haversine formula)
 * 5. Higher rating as tiebreaker
 */
export async function findBestHelper(booking) {
    const { serviceType, userLocation, rejectedHelpers = [] } = booking;

    // Fetch all available helpers with matching skill
    const helpersQuery = query(
        collection(db, 'helpers'),
        where('status', '==', 'available'),
        where('skills', 'array-contains', serviceType)
    );

    const snapshot = await getDocs(helpersQuery);
    const candidates = [];

    snapshot.forEach((doc) => {
        const helper = { id: doc.id, ...doc.data() };

        // Skip if previously rejected this booking
        if (rejectedHelpers.includes(helper.id)) return;

        // Skip if location not set
        if (!helper.location || !helper.location.latitude) return;

        // Calculate distance
        const distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            helper.location.latitude,
            helper.location.longitude
        );

        candidates.push({
            ...helper,
            distance,
            score: calculateScore(distance, helper.rating || 4.0)
        });
    });

    // Sort by score (lower is better) - distance weighted more, rating as tiebreaker
    candidates.sort((a, b) => a.score - b.score);

    return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Calculate a composite score for ranking helpers.
 * Lower score = better match.
 * Distance is primary factor, rating (inverted) is secondary.
 */
function calculateScore(distanceKm, rating) {
    // Weight distance heavily (1 km distance = 1 point)
    // Subtract rating bonus (5-star helper gets -1 point bonus)
    const distanceScore = distanceKm;
    const ratingBonus = (rating / 5) * 2; // Up to 2 point bonus for 5-star rating
    return distanceScore - ratingBonus;
}

/**
 * Run the auto-assignment process for a booking
 */
export async function runAutoAssignment(bookingId, booking) {
    const bestHelper = await findBestHelper(booking);

    if (!bestHelper) {
        // No helpers available
        await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'no_helpers',
            updatedAt: serverTimestamp()
        });
        return null;
    }

    // Assign helper and set status to pending_acceptance
    await updateDoc(doc(db, 'bookings', bookingId), {
        assignedHelper: bestHelper.id,
        helperName: bestHelper.name,
        helperLocation: bestHelper.location,
        helperDistance: bestHelper.distance,
        status: 'pending_acceptance',
        assignmentAttempts: (booking.assignmentAttempts || 0) + 1,
        updatedAt: serverTimestamp()
    });

    return bestHelper;
}

/**
 * Handle timeout - if helper doesn't respond within 10 seconds
 */
export async function handleAssignmentTimeout(bookingId, helperId) {
    const bookingRef = doc(db, 'bookings', bookingId);

    // Add helper to rejected list and reset for next assignment
    await updateDoc(bookingRef, {
        assignedHelper: null,
        helperName: null,
        helperLocation: null,
        status: 'searching',
        rejectedHelpers: [...(await getBookingRejectedList(bookingId)), helperId],
        updatedAt: serverTimestamp()
    });
}

async function getBookingRejectedList(bookingId) {
    const { getDoc } = await import('firebase/firestore');
    const snapshot = await getDoc(doc(db, 'bookings', bookingId));
    return snapshot.exists() ? (snapshot.data().rejectedHelpers || []) : [];
}

/**
 * Update helper location in Firestore
 */
export async function updateHelperLocation(helperId, latitude, longitude) {
    await updateDoc(doc(db, 'helpers', helperId), {
        location: { latitude, longitude }
    });
}

/**
 * Update helper status
 */
export async function updateHelperStatus(helperId, status) {
    await updateDoc(doc(db, 'helpers', helperId), { status });
}

/**
 * Update helper skills
 */
export async function updateHelperSkills(helperId, skills) {
    await updateDoc(doc(db, 'helpers', helperId), { skills });
}

/**
 * Listen to all helpers (for admin or map display)
 */
export function listenToHelpers(callback) {
    return onSnapshot(collection(db, 'helpers'), (snapshot) => {
        const helpers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(helpers);
    });
}

/**
 * Listen to a specific helper
 */
export function listenToHelper(helperId, callback) {
    return onSnapshot(doc(db, 'helpers', helperId), (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() });
        }
    });
}
