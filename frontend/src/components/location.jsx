import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet'
import L from "leaflet"
import "../assets/leaflet.css"

function LocationPicker({position, setPosition}){
  const icon = L.icon({
    iconUrl: '/images/icons/pin.svg',
    iconRetinaUrl: '',
    shadowUrl: '',
    iconSize: [38, 38],
    iconAnchor: [19, 30],
    popupAnchor: [0, -20],
    shadowSize: [41, 41]
  }, [])
  useMapEvent({
    click(e){
      setPosition([e.latlng.lat.toFixed(4), e.latlng.lng.toFixed(4)])
      console.log("Location:",[e.latlng.lat, e.latlng.lng])
    }
  })
  if (position && position.length > 0) return (
    <Marker position={position} icon={icon}>
      <Popup>New Stop</Popup>
    </Marker>
  ) 
}

function Location({ children }){
  return(
    <MapContainer
      center={[31.4886, 74.3392]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
      className="leaflet-pointer">
      <TileLayer
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      { children }
    </MapContainer>
  )
}
export { LocationPicker }
export default Location