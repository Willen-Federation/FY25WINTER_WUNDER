'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Helper to get image URL safely
const getIconUrl = (icon: any) => {
    if (typeof icon === 'string') return icon;
    if (typeof icon === 'object' && icon.src) return icon.src;
    return icon;
};

// Create a custom icon instance
const defaultIcon = L.icon({
    iconUrl: getIconUrl(markerIcon),
    iconRetinaUrl: getIconUrl(markerIcon2x),
    shadowUrl: getIconUrl(markerShadow),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface UserLocation {
    userId: string
    displayName: string
    lat: number
    lng: number
    updatedAt: string
}

interface Props {
    locations: UserLocation[]
    center?: [number, number]
}

export default function Map({ locations, center }: Props) {
    // Default center: Hakuba (Snowy)
    const defaultCenter: [number, number] = [36.6982, 137.8619]

    // Use first user location as center if available and no center provided?
    const paramCenter = center || (locations.length > 0 ? [locations[0].lat, locations[0].lng] : defaultCenter)

    return (
        <MapContainer center={paramCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map(loc => {
                const customIcon = L.divIcon({
                    className: '', // Remove default class to avoid interference
                    html: `
                        <div style="
                            background-color: white;
                            color: #333;
                            padding: 5px 10px;
                            border-radius: 20px;
                            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                            font-weight: bold;
                            font-size: 14px;
                            border: 2px solid #3b82f6;
                            white-space: nowrap;
                            position: relative;
                            display: inline-block;
                            transform: translate(-50%, -50%);
                        ">
                            ${loc.displayName}
                            <div style="
                                position: absolute;
                                bottom: -6px;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 0; 
                                height: 0; 
                                border-left: 6px solid transparent;
                                border-right: 6px solid transparent;
                                border-top: 6px solid #3b82f6;
                            "></div>
                        </div>
                    `,
                    iconSize: [0, 0], // Let CSS handle size
                    iconAnchor: [0, 20] // Anchor at bottom centerish
                })

                return (
                    <Marker key={loc.userId} position={[loc.lat, loc.lng]} icon={customIcon}>
                        <Popup>
                            <strong>{loc.displayName}</strong><br />
                            最終確認: {loc.updatedAt}
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    )
}
