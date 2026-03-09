import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const campusIcon = L.icon({
  iconUrl: '/images/riphah-logo.png',
  iconRetinaUrl: '',
  shadowUrl: '',
  iconSize: [38, 38],
  iconAnchor: [20, 25],
  popupAnchor: [0, -20],
  shadowSize: [41, 41]
})
const stopIcon = (active) => L.icon({
  iconUrl: '/images/icons/stop'+(active?"":"-disabled")+'.svg',
  iconRetinaUrl: '',
  shadowUrl: '',
  iconSize: [38, 38],
  iconAnchor: [16, 28],
  popupAnchor: [0, -18],
  shadowSize: [41, 41]
})
const busIcon = L.icon({
  iconUrl: '/images/icons/bus.svg',
  iconRetinaUrl: '',
  shadowUrl: '',
  iconSize: [38, 38],
  iconAnchor: [19, 25],
  popupAnchor: [0, -10],
  shadowSize: [41, 41]
})
function MapLabel({text, location, isCampus, active}){
  const icon = isCampus ? campusIcon : stopIcon(active);
  return (
    <Marker position={location} icon={icon}>
      <Popup>{text}</Popup>
    </Marker>
  )
}
function BusLabel({text, location}){
  return (
    <Marker position={location} icon={busIcon}>
      <Popup>{text}</Popup>
    </Marker>
  )
}
export { BusLabel } 
export default MapLabel