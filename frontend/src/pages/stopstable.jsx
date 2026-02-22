import { useEffect } from "react"
import { static_dir } from "../config"
import { addStop, getStops, updateStop, deleteStop } from "../utils/stops"
import { Marker, Popup } from "react-leaflet"
import { Horizontal_Card_Content } from '../components/content'
import Location, { LocationPicker } from "../components/location"
import Dialog from "../components/dialog"
import L from "leaflet"

function StopsTable({session_id="", user=null, permissions=Object(), checkFlag=false, rows=[], setRows=()=>{}, dialog=false, setDialog=()=>{}, formMode=0, setMode=()=>{}, formData={}, setData=()=>{}, navigate=()=>{}, setLoading=()=>{}}){
  const dialogProp = { dialog, formMode, formData, addRow: addStop, updateRow: updateStop, setData, setDialog, setRows }
  const setPosition = (position) => {
    setData(values => ({...values, latitudes: position[0], longitudes: position[1]}))
  }
  const loadData = async () => {
    setRows([])
    if (!checkFlag) return
    setLoading(true)
    await getStops(session_id, setRows, null, navigate)
    setLoading(false)
  }
  useEffect(() => {loadData()}, [checkFlag])
  return (
    <>
      <Dialog
        inputs={[
          {type: "text", name: "name", required: true},
          {type: "text", name: "description", required: true},
          {type: "number", name: "latitudes", disabled: true},
          {type: "number", name: "longitudes", disabled: true},
          {type: "checkbox", name: "active"},
          {type: "checkbox", name: "campus"}
        ]}
        {...dialogProp}>Stop</Dialog>
      <Location cursor="pointer">
        {rows.map(item => (
          <Marker key={item.id} position={item.location} icon={item.is_campus?L.icon({
            iconUrl: '/images/riphah-logo.png',
            iconRetinaUrl: '',
            shadowUrl: '',
            iconSize: [38, 38],
            iconAnchor: [20, 25],
            popupAnchor: [0, -20],
            shadowSize: [41, 41]
          }):L.icon({
            iconUrl: '/images/icons/stop'+(item.active?"":"-disabled")+'.svg',
            iconRetinaUrl: '',
            shadowUrl: '',
            iconSize: [38, 38],
            iconAnchor: [16, 28],
            popupAnchor: [0, -18],
            shadowSize: [41, 41]
          })}>
            <Popup>{item.name}</Popup>
          </Marker>
        ))}
        <LocationPicker position={formData.latitudes && formData.longitudes?[formData.latitudes,formData.longitudes]:[]} setPosition={setPosition}/>
      </Location>
      <div className='flex w-full py-2'>
        <div className='horizontal-slider'>{rows.map(item => (
          <Horizontal_Card_Content key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p><b>Status: </b>{item.active?'🟢':'🔴'}</p>
            <button
              className="edit-btn"
              onClick={() => {
                setData({
                  "id": item.id,
                  "name": item.name,
                  "description": item.description,
                  "latitudes": item.location[0],
                  "longitudes": item.location[1],
                  "active": item.active,
                  "campus": item.is_campus
                })
                setMode(item.id)
                setDialog(true)
              }}>
                <img src={static_dir+"images/icons/edit.svg"}/>
              </button>
            <button onClick={() => deleteStop({id: item.id}, session_id, () => {
              setRows(prev => prev.filter(r => r.id !== item.id))
            }, null, navigate)} className="del-btn"><img src={static_dir+"images/icons/delete.svg"}/></button>
          </Horizontal_Card_Content>
        ))}</div>
        <button
          className="add-btn"
          onClick={() => {
            if (formData.latitudes && formData.longitudes){
              setMode(0)
              setDialog(true)
            } else {
              alert("Please select a location from map")
            }
          }}>
          <img src={static_dir+"images/icons/add.svg"}/>
        </button>
      </div>
    </>
  )
}
export default StopsTable