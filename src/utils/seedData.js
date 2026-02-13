import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Sample helper data for testing
 * Locations are around a central point (Mumbai area) for realistic distances
 */
const sampleHelpers = [
    {
        name: 'Rajesh Kumar',
        email: 'rajesh@test.com',
        skills: ['Cleaning', 'Gardening'],
        rating: 4.8,
        totalRatings: 127,
        status: 'available',
        location: { latitude: 19.0760, longitude: 72.8777 } // Mumbai Central
    },
    {
        name: 'Priya Sharma',
        email: 'priya@test.com',
        skills: ['Cleaning', 'Cooking'],
        rating: 4.9,
        totalRatings: 203,
        status: 'available',
        location: { latitude: 19.0825, longitude: 72.8910 } // Byculla
    },
    {
        name: 'Suresh Patel',
        email: 'suresh@test.com',
        skills: ['Plumbing', 'Electrician'],
        rating: 4.5,
        totalRatings: 89,
        status: 'available',
        location: { latitude: 19.0620, longitude: 72.8680 } // Lower Parel
    },
    {
        name: 'Neha Singh',
        email: 'neha@test.com',
        skills: ['Cleaning', 'Cooking', 'Gardening'],
        rating: 4.7,
        totalRatings: 156,
        status: 'available',
        location: { latitude: 19.0896, longitude: 72.8656 } // Mahalaxmi
    },
    {
        name: 'Amit Joshi',
        email: 'amit@test.com',
        skills: ['Electrician', 'Plumbing', 'Painting'],
        rating: 4.3,
        totalRatings: 67,
        status: 'available',
        location: { latitude: 19.0544, longitude: 72.8406 } // Worli
    },
    {
        name: 'Sunita Devi',
        email: 'sunita@test.com',
        skills: ['Cleaning', 'Cooking'],
        rating: 4.6,
        totalRatings: 134,
        status: 'busy',
        location: { latitude: 19.0990, longitude: 72.9080 } // Sion
    },
    {
        name: 'Vikram Yadav',
        email: 'vikram@test.com',
        skills: ['Plumbing', 'Painting', 'Electrician'],
        rating: 4.4,
        totalRatings: 91,
        status: 'available',
        location: { latitude: 19.1073, longitude: 72.8370 } // Bandra
    },
    {
        name: 'Meera Gupta',
        email: 'meera@test.com',
        skills: ['Cleaning', 'Gardening', 'Cooking'],
        rating: 4.9,
        totalRatings: 245,
        status: 'available',
        location: { latitude: 19.0700, longitude: 72.8500 } // Haji Ali
    },
    {
        name: 'Ravi Tiwari',
        email: 'ravi@test.com',
        skills: ['Electrician', 'Plumbing'],
        rating: 4.2,
        totalRatings: 54,
        status: 'available',
        location: { latitude: 19.1176, longitude: 72.9060 } // Kurla
    },
    {
        name: 'Kavita Nair',
        email: 'kavita@test.com',
        skills: ['Cleaning', 'Painting', 'Gardening'],
        rating: 4.7,
        totalRatings: 178,
        status: 'available',
        location: { latitude: 19.0425, longitude: 72.8200 } // Nariman Point
    }
];

/**
 * Seed Firestore with sample helpers for testing
 * Call this from the admin dashboard or browser console
 */
export async function seedHelpers() {
    const promises = sampleHelpers.map(async (helper, index) => {
        const helperId = `helper_${index + 1}`;
        await setDoc(doc(db, 'helpers', helperId), {
            helperId,
            ...helper,
            createdAt: new Date().toISOString()
        });
        // Also create user record
        await setDoc(doc(db, 'users', helperId), {
            userId: helperId,
            name: helper.name,
            email: helper.email,
            role: 'helper',
            location: helper.location,
            createdAt: new Date().toISOString()
        });
    });

    await Promise.all(promises);
    console.log(`✅ Seeded ${sampleHelpers.length} sample helpers!`);
    return sampleHelpers.length;
}

/**
 * Service types available in the system
 */
export const SERVICE_TYPES = [
    { id: 'Cleaning', label: 'Cleaning', icon: '🧹', color: '#10b981' },
    { id: 'Plumbing', label: 'Plumbing', icon: '🔧', color: '#0ea5e9' },
    { id: 'Electrician', label: 'Electrician', icon: '⚡', color: '#f59e0b' },
    { id: 'Cooking', label: 'Cooking', icon: '👨‍🍳', color: '#ef4444' },
    { id: 'Gardening', label: 'Gardening', icon: '🌿', color: '#22c55e' },
    { id: 'Painting', label: 'Painting', icon: '🎨', color: '#8b5cf6' }
];
