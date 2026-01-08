import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { API_BASE } from "../config/api";
import { useLocation } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Colored marker icons
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const orangeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map centering when a new pothole is added
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15, { animate: true });
    }
  }, [center, zoom, map]);
  
  return null;
};

const PotholeMap = () => {
  const [potholes, setPotholes] = useState([]);
  const [selectedPothole, setSelectedPothole] = useState(null);
  const [mapCenter, setMapCenter] = useState([17.385, 78.4867]);
  const [mapZoom, setMapZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [activeMapLayer, setActiveMapLayer] = useState("street");
  const [statusFilter, setStatusFilter] = useState("all");
  const location = useLocation();

  const loadPotholes = async () => {
    const res = await fetch(`${API_BASE}/report/potholes`);
    const data = await res.json();
    setPotholes(data);
  };

  useEffect(() => {
    loadPotholes();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadPotholes();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Check if redirected from report submission with new pothole location
  useEffect(() => {
    if (location.state?.newPothole) {
      const { latitude, longitude } = location.state.newPothole;
      setMapCenter([latitude, longitude]);
      setMapZoom(16);
    }
  }, [location]);

  // Stats calculation
  const stats = {
    total: potholes.length,
    high: potholes.filter(p => p.severity === 'high').length,
    medium: potholes.filter(p => p.severity === 'medium').length,
    low: potholes.filter(p => p.severity === 'low').length,
    completed: potholes.filter(p => p.status === 'completed').length,
  };

  const [severityFilter, setSeverityFilter] = useState('all');

  // Combined filtering (severity + status)
  const filteredPotholes = potholes.filter(p => {
    const severityMatch = severityFilter === 'all' || p.severity === severityFilter;
    const statusMatch = statusFilter === 'all' || p.status === statusFilter;
    return severityMatch && statusMatch;
  });

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(15);
        },
        (error) => {
          alert("Unable to get your location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Search location using Nominatim API
  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a location");
      return;
    }

    setSearchError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapZoom(15);
        setSearchQuery("");
      } else {
        setSearchError("Location not found. Try a different query.");
      }
    } catch (error) {
      setSearchError("Failed to search location. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .pulse-marker { animation: pulse-ring 2s ease-in-out infinite; }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .leaflet-container {
          z-index: 1;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Google Maps-Style Search Bar */}
        <div className="glass-card rounded-xl shadow-2xl mb-6">
          <div className="flex items-center gap-2 p-2">
            {/* Menu Icon */}
            <button className="p-3 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchError("");
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                placeholder="Search pothole locations or address..."
                className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              />
              {searchError && (
                <p className="text-red-400 text-sm px-4 pb-2">{searchError}</p>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleLocationSearch}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Current Location Button */}
            <button
              onClick={handleGetCurrentLocation}
              className="p-3 hover:bg-blue-600 bg-blue-500 rounded-full transition-colors"
              title="Get current location"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Google Maps-Style Category Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {/* Severity Filters */}
          <button
            onClick={() => { setSeverityFilter('all'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-medium transition-all shadow-lg ${
              severityFilter === 'all' && statusFilter === 'all'
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            All ({stats.total})
          </button>

          <button
            onClick={() => { setSeverityFilter('high'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-medium transition-all shadow-lg ${
              severityFilter === 'high'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
            </svg>
            High Priority ({stats.high})
          </button>

          <button
            onClick={() => { setSeverityFilter('medium'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-medium transition-all shadow-lg ${
              severityFilter === 'medium'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Medium ({stats.medium})
          </button>

          <button
            onClick={() => { setSeverityFilter('low'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-medium transition-all shadow-lg ${
              severityFilter === 'low'
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Low ({stats.low})
          </button>

          {/* Status Filters */}
          <button
            onClick={() => { setStatusFilter('completed'); setSeverityFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-medium transition-all shadow-lg ${
              statusFilter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed ({stats.completed})
          </button>

          <button
            onClick={() => { setStatusFilter('reported'); setSeverityFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-medium transition-all shadow-lg ${
              statusFilter === 'reported'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pending
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center hidden">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              severityFilter === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105'
                : 'glass-card text-gray-300 hover:bg-white/20'
            }`}
          >
            All Potholes
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              severityFilter === 'high'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg scale-105'
                : 'glass-card text-gray-300 hover:bg-white/20'
            }`}
          >
            High
          </button>
          <button
            onClick={() => setSeverityFilter('medium')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              severityFilter === 'medium'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                : 'glass-card text-gray-300 hover:bg-white/20'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setSeverityFilter('low')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              severityFilter === 'low'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                : 'glass-card text-gray-300 hover:bg-white/20'
            }`}
          >
            Low
          </button>
        </div>

        {/* Map Container */}
        <div className="glass-card rounded-2xl p-4 shadow-2xl relative">
          <div className="text-sm text-gray-300 mb-2 flex items-center justify-between">
            <span>Showing {filteredPotholes.length} pothole(s)</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 pulse-marker"></div>
              <span>Live Updates</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-white/10 relative" style={{ height: "750px" }}>
            {/* Layers Control Button (Google Maps Style) */}
            <div className="absolute top-4 right-4 z-[1000]">
              <button
                onClick={() => setShowLayersMenu(!showLayersMenu)}
                className="bg-white hover:bg-gray-100 text-slate-900 px-4 py-2 rounded-lg shadow-lg font-medium flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Layers
              </button>

              {/* Layers Menu */}
              {showLayersMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-lg shadow-2xl p-3 w-48">
                  <div className="space-y-2">
                    <button
                      onClick={() => { setActiveMapLayer('street'); setShowLayersMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeMapLayer === 'street' ? 'bg-blue-600 text-white' : 'text-slate-900 hover:bg-gray-100'
                      }`}
                    >
                      🗺️ Street Map
                    </button>
                    <button
                      onClick={() => { setActiveMapLayer('satellite'); setShowLayersMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeMapLayer === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-900 hover:bg-gray-100'
                      }`}
                    >
                      🛰️ Satellite View
                    </button>
                    <button
                      onClick={() => { setActiveMapLayer('dark'); setShowLayersMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeMapLayer === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-900 hover:bg-gray-100'
                      }`}
                    >
                      🌙 Dark Mode
                    </button>
                  </div>
                </div>
              )}
            </div>

            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              zoomControl={false}
              style={{ height: "100%", width: "100%", borderRadius: "12px" }}
            >
              <ZoomControl position="bottomright" />
              <MapController center={mapCenter} zoom={mapZoom} />
              
              {/* Conditional TileLayer based on activeMapLayer */}
              {activeMapLayer === 'street' && (
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}
              
              {activeMapLayer === 'satellite' && (
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}
              
              {activeMapLayer === 'dark' && (
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              )}

              {/* 🕳️ Potholes */}
              {filteredPotholes
                .filter((p) => p.latitude != null && p.longitude != null)
                .map((p, i) => {
                  let icon = greenIcon; // default low
                  if (p.severity === "high") icon = redIcon;
                  else if (p.severity === "medium") icon = orangeIcon;

                  // Status display
                  const statusDisplay = p.status === 'completed' ? '✅ Closed' : '🔴 Open';
                  const statusColor = p.status === 'completed' ? 'green' : 'red';

                  return (
                    <Marker 
                      key={p._id || i} 
                      position={[p.latitude, p.longitude]} 
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          setSelectedPothole(p);
                        }
                      }}
                    >
                      <Popup maxWidth={450} className="dark-popup">
                        <div style={{ 
                          minWidth: '400px',
                          background: 'linear-gradient(135deg, rgba(30,30,50,0.95) 0%, rgba(50,30,70,0.95) 100%)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          padding: '16px',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                        }}>
                          {/* Pothole Image */}
                          {p.image && (
                            <div style={{ marginBottom: '12px', position: 'relative', cursor: 'pointer' }} onClick={() => setSelectedPothole(p)}>
                              <img 
                                src={p.image.startsWith('data:') ? p.image : `${API_BASE}/uploads/${p.image}`}
                                alt="Pothole" 
                                style={{ 
                                  width: '100%', 
                                  height: '220px', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px',
                                  border: '2px solid rgba(255,255,255,0.2)',
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(0,0,0,0.8)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                letterSpacing: '0.5px'
                              }}>
                                📍 LOCATION VIEW
                              </div>
                              <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                left: '8px',
                                background: 'rgba(0,0,0,0.8)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#93c5fd'
                              }}>
                                Click to enlarge
                              </div>
                            </div>
                          )}
                          
                          <div style={{ 
                            background: 'linear-gradient(90deg, rgba(59,130,246,0.3) 0%, rgba(168,85,247,0.3) 100%)',
                            padding: '12px', 
                            borderRadius: '8px',
                            marginBottom: '12px',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            <h3 style={{ 
                              margin: '0', 
                              fontSize: '18px',
                              fontWeight: 'bold',
                              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>
                              Pothole Report
                            </h3>
                          </div>
                          
                          {/* Status */}
                          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#a78bfa' }}>Status:</strong>
                            <span style={{ 
                              color: statusColor === 'green' ? '#34d399' : '#ef4444', 
                              fontWeight: 'bold',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: statusColor === 'green' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'
                            }}>
                              {p.status === 'completed' ? 'Closed' : 'Open'}
                            </span>
                          </div>
                          
                          {/* Severity */}
                          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#a78bfa' }}>Severity:</strong>
                            <span style={{ 
                              textTransform: 'capitalize',
                              fontWeight: 'bold',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              color: p.severity === 'high' ? '#f87171' : 
                                     p.severity === 'medium' ? '#fbbf24' : '#34d399',
                              background: p.severity === 'high' ? 'rgba(248,113,113,0.2)' : 
                                          p.severity === 'medium' ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)'
                            }}>
                              {p.severity}
                            </span>
                          </div>
                          
                          {/* AI Confidence */}
                          {p.detectionConfidence > 0 && (
                            <div style={{ 
                              marginBottom: '10px',
                              padding: '8px',
                              background: 'rgba(59,130,246,0.2)',
                              borderRadius: '6px',
                              border: '1px solid rgba(59,130,246,0.3)'
                            }}>
                              <strong style={{ color: '#60a5fa' }}>AI Confidence:</strong>{' '}
                              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#93c5fd' }}>
                                {(p.detectionConfidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                          
                          {/* Dimensions */}
                          {p.width && p.height && (
                            <div style={{ 
                              marginBottom: '10px',
                              padding: '8px',
                              background: 'rgba(168,85,247,0.2)',
                              borderRadius: '6px',
                              border: '1px solid rgba(168,85,247,0.3)'
                            }}>
                              <strong style={{ color: '#c084fc' }}>Dimensions:</strong>{' '}
                              <span style={{ color: '#e9d5ff' }}>
                                {p.width}px × {p.height}px
                              </span>
                            </div>
                          )}
                          
                          {/* Location */}
                          {p.location && (
                            <div style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#a78bfa' }}>Location:</strong>{' '}
                              <div style={{ color: '#d1d5db', marginTop: '4px' }}>
                                {p.location}
                              </div>
                            </div>
                          )}
                          
                          {/* Description */}
                          {p.description && (
                            <div style={{ marginBottom: '10px' }}>
                              <strong style={{ color: '#a78bfa' }}>Description:</strong>
                              <div style={{ 
                                fontSize: '13px', 
                                color: '#d1d5db',
                                marginTop: '4px',
                                lineHeight: '1.5'
                              }}>
                                {p.description}
                              </div>
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#999',
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid #e5e7eb'
                          }}>
                            Reported: {p.createdAt 
                              ? new Date(p.createdAt).toLocaleString()
                              : p.timestamp 
                              ? new Date(p.timestamp).toLocaleString()
                              : "No timestamp"}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* User's Current Location Marker */}
                {userLocation && (
                  <Circle
                    center={userLocation}
                    radius={50}
                    pathOptions={{
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.2,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div style={{ textAlign: 'center', padding: '8px' }}>
                        <strong style={{ color: '#3b82f6' }}>📍 Your Location</strong>
                      </div>
                    </Popup>
                  </Circle>
                )}
            </MapContainer>
          </div>

          {/* Legend Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-red-900/20 border border-red-700/50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-400 text-sm">High Severity</span>
              </div>
              <p className="text-xs text-gray-400">Immediate attention required</p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-yellow-400 text-sm">
                  Medium Severity
                </span>
              </div>
              <p className="text-xs text-gray-400">Should be addressed soon</p>
            </div>

            <div className="bg-green-900/20 border border-green-700/50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-400 text-sm">Low Severity</span>
              </div>
              <p className="text-xs text-gray-400">Minor issue, low priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedPothole && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPothole(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedPothole(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 transition-colors"
            >
              ✕
            </button>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Pothole Details</h3>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className={`px-3 py-1 rounded-full ${
                    selectedPothole.severity === 'high' ? 'bg-red-600' :
                    selectedPothole.severity === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                  }`}>
                    {selectedPothole.severity?.toUpperCase()}
                  </span>
                  <span>{selectedPothole.location}</span>
                </div>
              </div>
              <img
                src={selectedPothole.image?.startsWith('data:') ? selectedPothole.image : `${API_BASE}/uploads/${selectedPothole.image}`}
                alt="Pothole Full View"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {selectedPothole.detectionConfidence > 0 && (
                  <div className="bg-slate-700 p-3 rounded">
                    <div className="text-gray-400 text-xs">AI Confidence</div>
                    <div className="text-white font-semibold">{(selectedPothole.detectionConfidence * 100).toFixed(1)}%</div>
                  </div>
                )}
                {selectedPothole.width && selectedPothole.height && (
                  <div className="bg-slate-700 p-3 rounded">
                    <div className="text-gray-400 text-xs">Dimensions</div>
                    <div className="text-white font-semibold">{selectedPothole.width} × {selectedPothole.height}px</div>
                  </div>
                )}
                <div className="bg-slate-700 p-3 rounded">
                  <div className="text-gray-400 text-xs">Status</div>
                  <div className="text-white font-semibold capitalize">{selectedPothole.status}</div>
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  <div className="text-gray-400 text-xs">Reported</div>
                  <div className="text-white font-semibold text-xs">{new Date(selectedPothole.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotholeMap;  