import { useEffect, useState } from "react"
import { getBusesName } from "../utils/buses"
import { getLocation } from "../utils/location"
import { BusLabel } from "../components/mapLabel"
import Location from "../components/location"

function LocationTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const [buses, setBuses] = useState([])
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    await getBusesName(session_id, setBuses, null, navigate)
    await getLocation(session_id, setRows, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <Location>
      {rows.map(item => (
        <BusLabel
          key={item.id}
          location={item.location}
          text={buses.filter(bus => bus.location === item.id)[0]?.license || "-"}/>
      ))}
    </Location>
  )
}
export default LocationTable