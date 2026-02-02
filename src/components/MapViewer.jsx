import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { X, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Fix for default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

// Custom icon for the marker
const createCustomIcon = (color = "#BE8D4A") => {
  return L.divIcon({
    html: `
      <div style="position: relative;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
    className: 'custom-marker-icon'
  })
}

// Component to handle map view updates when coordinates change
const MapViewUpdater = ({ center, zoom }) => {
  const map = useMap()
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])
  
  return null
}

const MapViewer = ({ 
  isOpen, 
  onClose, 
  latitude, 
  longitude, 
  title = "موقع المدرسة",
  markerLabel = "موقع المدرسة"
}) => {
  const mapRef = useRef(null)
  
  // Parse coordinates
  const lat = parseFloat(latitude)
  const lng = parseFloat(longitude)
  
  // Check if coordinates are valid
  const isValidCoords = !isNaN(lat) && !isNaN(lng) && 
                       lat >= -90 && lat <= 90 && 
                       lng >= -180 && lng <= 180
  
  // Set default center if coordinates are invalid
  const defaultCenter = [32.8872, 13.1913] // Default to Tripoli
  const mapCenter = isValidCoords ? [lat, lng] : defaultCenter
  const mapZoom = isValidCoords ? 15 : 12
  
  // Handle getting directions (Google Maps)
  const handleGetDirections = () => {
    if (isValidCoords) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      window.open(url, '_blank')
    }
  }
  
  // Handle copy coordinates
  const handleCopyCoordinates = () => {
    if (isValidCoords) {
      const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      navigator.clipboard.writeText(coords)
      .then(() => {
        // You might want to add a toast notification here
        alert('تم نسخ الإحداثيات إلى الحافظة')
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
      })
    }
  }
  
  // Handle opening in OpenStreetMap
  const handleOpenInOSM = () => {
    if (isValidCoords) {
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
      window.open(url, '_blank')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] mx-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold text-right">
              {title}
            </h2>
            {!isValidCoords && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                إحداثيات غير صالحة
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="إغلاق"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-0">
          {isValidCoords ? (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
              ref={mapRef}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapCenter} icon={createCustomIcon()}>
                <Popup>
                  <div className="text-center p-2">
                    <strong>{markerLabel}</strong>
                    <p className="mt-1 text-sm text-gray-600">
                      خط العرض: {lat.toFixed(6)}<br />
                      خط الطول: {lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <MapViewUpdater center={mapCenter} zoom={mapZoom} />
            </MapContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-100 p-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-red-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  إحداثيات غير متوفرة
                </h3>
                <p className="text-gray-600 max-w-md">
                  لا تتوفر إحداثيات صالحة للعرض. يرجى التحقق من البيانات.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  الإحداثيات المدخلة: {latitude}, {longitude}
                </p>
              </div>
            </div>
          )}
          
          {/* Location Info Box */}
          {isValidCoords && (
            <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:top-auto md:bottom-4 md:w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000]">
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-gray-800 mb-1">الإحداثيات</h4>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 bg-gray-50 p-2 rounded text-sm font-mono">
                      {lat.toFixed(6)}, {lng.toFixed(6)}
                    </code>
                    <button
                      onClick={handleCopyCoordinates}
                      className="p-2 text-gray-600 hover:text-[#BE8D4A] hover:bg-gray-100 rounded"
                      title="نسخ الإحداثيات"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleGetDirections}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white py-2 px-3 rounded-lg hover:bg-[#a67a3f] transition-colors text-sm"
                  >
                    <Navigation size={16} />
                    <span>الاتجاهات</span>
                  </button>
                  <button
                    onClick={handleOpenInOSM}
                    className="flex items-center justify-center gap-2 border border-gray-300 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>OpenStreetMap</span>
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <p>انقر واسحب للتكبير/التصغير • انقر على العلامة للمزيد من المعلومات</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 order-2 md:order-1">
              {isValidCoords ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>الإحداثيات الجغرافية (WGS84)</span>
                  <span className="hidden sm:inline">•</span>
                  <span>التكبير: {mapZoom}x</span>
                </div>
              ) : (
                <span>الموقع: افتراضي (طرابلس، ليبيا)</span>
              )}
            </div>
            
            <div className="flex gap-3 order-1 md:order-2">
              <button
                onClick={handleGetDirections}
                disabled={!isValidCoords}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  isValidCoords
                    ? 'bg-[#BE8D4A] text-white hover:bg-[#a67a3f]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Navigation size={18} />
                <span>الاتجاهات</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapViewer