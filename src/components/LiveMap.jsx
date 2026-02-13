import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';

// --- Custom Icons (CSS based) ---
const createIcon = (emoji, colorStr) => {
    return L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="
      background-color: ${colorStr};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: 3px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      position: relative;
    ">
      ${emoji}
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${colorStr};
      "></div>
    </div>`,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
        popupAnchor: [0, -48]
    });
};

const userIcon = createIcon('👤', '#3B82F6'); // Blue-500
const helperAvailableIcon = createIcon('⚡', '#10B981'); // Green-500
const helperBusyIcon = createIcon('🔨', '#F59E0B'); // Amber-500

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

export default function LiveMap({ bookings = [], userLocation, role = 'user' }) {
    const { userProfile } = useAuth();

    // Default center (Mumbai)
    const defaultCenter = [19.0760, 72.8777];

    // Determine center
    let mapCenter = defaultCenter;
    if (userLocation) {
        mapCenter = [userLocation.lat, userLocation.lng];
    } else if (role === 'user' && bookings.length > 0) {
        // If we have an active booking with a location
        const active = bookings.find(b => b.status !== 'completed' && b.status !== 'cancelled');
        if (active && active.location) {
            mapCenter = [active.location.lat, active.location.lng];
        }
    }

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={true} // Enabled for full screen experience
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // We can add custom zoom controls if needed
            >
                {/* Light Mode Tiles (CartoDB Positron - Clean/Minimal) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={mapCenter} />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup className="custom-popup">
                            <div className="font-bold text-slate-800">You are here</div>
                        </Popup>
                    </Marker>
                )}

                {/* Helpers / Bookings Markers */}
                {/* Logic depends on role. 
            User: See assigned helper.
            Helper: See pickup location.
            Admin: See everyone.
        */}

                {/* Simple implementation for demo: Show markers from passed bookings/props would need real helper locations */}
                {/* Use random offsets from center for demo if no real data */}
            </MapContainer>
        </div>
    );
}
