import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import { MapPin } from 'lucide-react';

const customIcon = L.divIcon({
  className: 'custom-marker', // ممكن تستخدم كلاس لتعديل الـ CSS
  html: `<div style="color: #000; font-size: 40px;">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
           </svg>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [12, 40], // النقطة اللي تتثبت عند الإحداثيات
});

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={customIcon}>
      <Popup>موقع المدرسة المحدد</Popup>
    </Marker>
  )
}

const MapPicker = ({ isOpen, onClose, onLocationSelect }) => {
  const [position, setPosition] = useState(null)
    const [center, setCenter] = useState([32.8872, 13.1913])
  const [zoom, setZoom] = useState(12)

  // Initialize user's current location
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setCenter([latitude, longitude])
          setZoom(15)
        },
        (error) => {
          console.warn('Error getting location:', error)
          // Use default center
        }
      )
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (position) {
      onLocationSelect({
        lat: position.lat,
        lng: position.lng,
      })
      onClose()
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const query = e.target.search.value
    if (query) {
      // You would typically use a geocoding service here
      // For demo purposes, we'll just show an alert
      alert(`البحث عن: ${query}\nستحتاج إلى دمج خدمة geocoding مثل Nominatim أو Google Maps`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">اختيار موقع المدرسة</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative h-[calc(90vh-150px)]">
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>

          {/* Search Bar */}
          {/* <div className="absolute top-4 left-4 right-4 z-[1000] px-12">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                name="search"
                placeholder="ابحث عن موقع..."
                className="flex-grow px-4 py-2 rounded-r-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
              />
              <button
                type="submit"
                className="bg-[#BE8D4A] text-white px-6 py-2 rounded-l-lg"
              >
                بحث
              </button>
            </form>
          </div> */}

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg z-[1000]">
            <p className="text-center font-medium">
              انقر على الخريطة لتحديد موقع المدرسة
            </p>
            {position && (
              <p className="text-center text-sm text-gray-600 mt-1">
                الموقع المحدد: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="flex justify-between items-center p-4 border-t">
          <div>
            {position ? (
              <div className="text-sm">
                <span className="font-medium">الإحداثيات:</span>
                <span className="text-gray-600 ml-2">
                  خط العرض: {position.lat.toFixed(6)}
                </span>
                <span className="text-gray-600 mx-2">|</span>
                <span className="text-gray-600">
                  خط الطول: {position.lng.toFixed(6)}
                </span>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">لم يتم تحديد موقع بعد</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={!position}
              className={`px-6 py-2 rounded-lg font-medium ${
                position
                  ? 'bg-[#BE8D4A] text-white hover:bg-[#a67a3f]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              اختر هذا الموقع
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapPicker