import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Horizontal_Card_Content } from './content'
import L from "leaflet"
import "../assets/leaflet.css"

function Location(){
  const icon = L.icon({
  iconUrl: '/images/riphah-logo.jpg',
  iconRetinaUrl: '',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [40, 40],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})
  return(
    <div className='relative overflow-hidden z-0 flex flex-col w-full'>
      <MapContainer center={[31.488641778350072, 74.33929846962278]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[31.488641778350072, 74.33929846962278]} icon={icon}>
          <Popup>Bus Location</Popup>
        </Marker>
      </MapContainer>
      <div className='flex w-full py-2'>
        <div className='horizontal-slider'>
          <Horizontal_Card_Content>
            <h3>Thokar Stop</h3>
            <p>Metro station, Thokar Niaz Baig, Lahore</p>
            <button>Edit</button>
          </Horizontal_Card_Content>
          <Horizontal_Card_Content>
            <h3>Campus Stop</h3>
            <p>Naseerabad, Gullberg III, Lahore</p>
            <button>Edit</button>
          </Horizontal_Card_Content>
        </div>
        <button>Add</button>
      </div>
    </div>
  )
}
export default Location