import { useContext, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"
import { getBuses, getActiveBuses } from "../utils/buses"
import { getActiveStops, getStops } from "../utils/stops"
import { getActiveLocation } from "../utils/location"
import MapLabel, { BusLabel } from "../components/mapLabel"
import Location from "../components/location"
import { WebSocketContext } from "../context/websocket"

function Map(){
  const [stops, setStops] = useState([])
  const [buses, setBuses] = useState([])
  const [location, setLocation] = useState([])
  const {setLoading} = useContext(LoadingContext)
  const {user, checkFlag, require_auth} = useContext(AuthContext)
  const {data, setCallBack} = useContext(WebSocketContext)
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const loadData = async () => {
    if (!checkFlag) return
    setLoading(true)
    const session_id = params.get("session_id")
    if (user===null){
      await require_auth(session_id)
    }
    await getStops(session_id, setStops, async () => {
      await getActiveStops(session_id, setStops, (e) => console.error(e), navigate)
    }, navigate)

    await getBuses(session_id, setBuses, async () => {
      await getActiveLocation(session_id, (data) => {
        setBuses(data.buses)
        setLocation(data.location)
      }, (e) => console.error(e), navigate)
    }, navigate)

    
    setLoading(false)
  }
  const callBack = async (data) => {
    switch (data?.type) {
      case "bus active":
        setBuses(buses => [...buses, data.bus])
        break
      case "bus stop":
        setBuses(prev => {
          const busToRemove = prev.find(b => b.id === data.bus);
          if (busToRemove && busToRemove.location) {
              // Remove its location too
            setLocation(locs => locs.filter(l => l.id !== busToRemove.location));
          }
          return prev.filter(b => b.id !== data.bus);
        });
        break;
      case "location":
        // Find the bus
        const targetBus = buses.find(b => b.id === data.bus)
        if (!targetBus) break

        // Check if bus needs location ID
        if (!targetBus.location) {
          // Update bus with new location ID
          setBuses(prev => prev.map(b => 
            b.id === data.bus?{ ...b, location: data.location.id } : b
          ))
        }
        setLocation(prev => {
          // Check if location already exists
          const existingLocation = prev.find(l => l.id === data.location.id)
          if (existingLocation) {
            // Update existing location
            return prev.map(l => 
              l.id === data.location.id ? { ...l, ...data.location } : l
            )
          } else {
            // Add new location
            return [...prev, data.location]
          }
        });
        break;
    }
  }
  useEffect(() => {loadData()}, [checkFlag])
  useEffect(() => {
    if (data === null) return
    callBack(data)
  }, [data])
  // useEffect(() => {console.log(location)}, [location])  // Debug print
  // useEffect(() => {console.log(buses)}, [buses])        // Debug print
  return (
    <div id="map" className="h-screen">
      <Location width="100%" height="100vh">
        {location.map(item => (
          <BusLabel
            key={item.id}
            location={item.location}
            text={buses.filter(bus => bus.location === item.id)[0]?.license || "-"}/>
        ))}
        {stops.map(item => (
          <MapLabel key={item.id} text={item.name} location={item.location} isCampus={item.is_campus} active={item.active}/>
        ))}
      </Location>
    </div>
  )
}
export default Map