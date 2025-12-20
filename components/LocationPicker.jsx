'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Navigation, AlertTriangle } from 'lucide-react';

// Dynamic import for Leaflet (client-side only)
let L = null;
if (typeof window !== 'undefined') {
    L = require('leaflet');
}

export default function LocationPicker({
    onClose,
    onSelectLocation,
    initialLocation = null
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const shopMarkerRef = useRef(null);
    const polylineRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(initialLocation || {
        lat: -6.7924, // Dar es Salaam default
        lng: 39.2083,
        address: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [outsideTanzania, setOutsideTanzania] = useState(false);

    // Tanzania bounds (approximate)
    const TANZANIA_BOUNDS = {
        north: -0.99,
        south: -11.75,
        west: 29.34,
        east: 40.47
    };

    // Check if coordinates are within Tanzania
    const isInTanzania = (lat, lng) => {
        return lat >= TANZANIA_BOUNDS.south &&
            lat <= TANZANIA_BOUNDS.north &&
            lng >= TANZANIA_BOUNDS.west &&
            lng <= TANZANIA_BOUNDS.east;
    };

    // Shop location (Kariakoo)
    const SHOP_LOCATION = {
        lat: -6.8160,
        lng: 39.2803,
        name: 'Kariakoo Shop'
    };

    // Update polyline when location changes
    const updatePolyline = (lat, lng) => {
        if (!mapInstanceRef.current || !L) return;

        // Remove existing polyline
        if (polylineRef.current) {
            mapInstanceRef.current.removeLayer(polylineRef.current);
        }

        // Draw new polyline from shop to selected location
        const polyline = L.polyline(
            [[SHOP_LOCATION.lat, SHOP_LOCATION.lng], [lat, lng]],
            {
                color: '#10b981', // emerald-500
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10'
            }
        ).addTo(mapInstanceRef.current);

        polylineRef.current = polyline;

        // Fit map to show both markers and the line
        const bounds = L.latLngBounds(
            [SHOP_LOCATION.lat, SHOP_LOCATION.lng],
            [lat, lng]
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    };

    // Initialize map
    useEffect(() => {
        if (!L || mapInstanceRef.current) return;

        // Wait for DOM to be ready
        const initTimer = setTimeout(() => {
            if (!mapRef.current) return;

            // Fix Leaflet default icon issue
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            // Create map
            const map = L.map(mapRef.current).setView(
                [selectedLocation.lat, selectedLocation.lng],
                13
            );

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Create custom icon for shop
            const shopIcon = L.divIcon({
                html: '<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-size: 16px; font-weight: bold; color: white;">S</div>',
                className: 'custom-shop-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            // Add shop marker (non-draggable)
            const shopMarker = L.marker([SHOP_LOCATION.lat, SHOP_LOCATION.lng], {
                icon: shopIcon,
                draggable: false
            }).addTo(map);

            shopMarker.bindPopup(`<strong>${SHOP_LOCATION.name}</strong><br/>Your shop location`);
            shopMarkerRef.current = shopMarker;

            // Add draggable customer marker
            const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
                draggable: true
            }).addTo(map);

            marker.bindPopup('Delivery Location<br/><em>Drag to adjust</em>');

            // Draw initial polyline
            updatePolyline(selectedLocation.lat, selectedLocation.lng);

            // Handle marker drag
            marker.on('dragend', async (e) => {
                const pos = e.target.getLatLng();
                updatePolyline(pos.lat, pos.lng);
                await reverseGeocode(pos.lat, pos.lng);
            });

            // Handle map click
            map.on('click', async (e) => {
                marker.setLatLng(e.latlng);
                updatePolyline(e.latlng.lat, e.latlng.lng);
                await reverseGeocode(e.latlng.lat, e.latlng.lng);
            });

            mapInstanceRef.current = map;
            markerRef.current = marker;
        }, 100);

        return () => {
            clearTimeout(initTimer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
                shopMarkerRef.current = null;
                polylineRef.current = null;
            }
        };
    }, []);

    // Reverse geocode to get address from coordinates
    const reverseGeocode = async (lat, lng) => {
        setIsLoading(true);

        // Check if location is in Tanzania
        const inTanzania = isInTanzania(lat, lng);
        setOutsideTanzania(!inTanzania);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setSelectedLocation({ lat, lng, address });
        } catch (error) {
            console.error('Geocoding error:', error);
            setSelectedLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
        }
        setIsLoading(false);
    };

    // Search for location
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const data = await response.json();

            if (data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);

                setSelectedLocation({ lat, lng, address: result.display_name });

                if (mapInstanceRef.current && markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                    updatePolyline(lat, lng);
                }

                // Check Tanzania
                const inTanzania = isInTanzania(lat, lng);
                setOutsideTanzania(!inTanzania);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
        setIsLoading(false);
    };

    // Get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                if (mapInstanceRef.current && markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                    updatePolyline(lat, lng);
                }

                await reverseGeocode(lat, lng);
                setIsLocating(false);
            },
            (error) => {
                console.error('Location error:', error);
                alert('Unable to get your location. Please enable location services.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Handle confirm
    const handleConfirm = () => {
        if (outsideTanzania) {
            alert('Sorry, delivery is only available within Tanzania');
            return;
        }
        onSelectLocation(selectedLocation);
        onClose();
    };

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800">
            {/* Search Bar */}
            <div className="p-4 border-b dark:border-gray-700 flex-shrink-0">
                <div className="flex space-x-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search in Tanzania..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm"
                    >
                        Search
                    </button>
                    <button
                        onClick={getCurrentLocation}
                        disabled={isLocating}
                        className="p-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                        title="Use my current location"
                    >
                        <Navigation size={18} className={isLocating ? 'animate-pulse' : ''} />
                    </button>
                </div>
            </div>

            {/* Map Container */}
            <div
                ref={mapRef}
                className="flex-1 w-full bg-gray-200 dark:bg-gray-700 min-h-[250px]"
            />

            {/* Selected Location */}
            <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                {outsideTanzania && (
                    <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-center space-x-2">
                        <AlertTriangle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                            This location is outside Tanzania. Delivery only available in Tanzania.
                        </p>
                    </div>
                )}
                <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Selected Location</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {isLoading ? 'Loading address...' : (selectedLocation.address || 'Click on the map to select a location')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t dark:border-gray-700 flex space-x-3 flex-shrink-0 bg-white dark:bg-gray-800">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={!selectedLocation.address || isLoading || outsideTanzania}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Confirm Location
                </button>
            </div>
        </div>
    );
}
