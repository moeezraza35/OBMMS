import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { static_dir } from "../config"
import { addStop, getStops, updateStop } from "../utils/stops"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"
import { Marker, Popup } from "react-leaflet"
import { Horizontal_Card_Content } from '../components/content'
import Location, { LocationPicker } from "../components/location"
import Dialog from "../components/dialog"
import L from "leaflet"

function StopsTable(){
  // const [newPosition, setPosition] = useState([])
  const [dialog, setDialog] = useState(false)
  const [formMode, setMode] = useState(0)
  const [formData, setData] = useState({})
  const [rows, setRows] = useState([])
  const {session_id, checkFlag} = useContext(AuthContext)
  const {setLoading} = useContext(LoadingContext)
  const navigate = useNavigate()
  const icon = L.icon({
    iconUrl: '/images/icons/stop.svg',
    iconRetinaUrl: '',
    shadowUrl: '',
    iconSize: [38, 38],
    iconAnchor: [12, 30],
    popupAnchor: [7, -34],
    shadowSize: [41, 41]
  })
  const setPosition = (position) => {
    setData(values => ({...values, latitudes: position[0], longitudes: position[1]}))
  }
  const loadData = async () => {
    if (!checkFlag) return
    setLoading(true)
    const data = await getStops(
      session_id,
      setRows,
      null,
      navigate
    )
    setLoading(false)
    return data
  }
  useEffect(() => {
    loadData()
  }, [checkFlag])
  return (
    <>
      <Dialog
        dialog={dialog}
        formMode={formMode}
        inputs={[
          {type: "text", name: "name", required: true},
          {type: "text", name: "description", required: true},
          {type: "number", name: "latitudes", disabled: true},
          {type: "number", name: "longitudes", disabled: true},
          {type: "checkbox", name: "active"},
          {type: "checkbox", name: "campus"}
        ]}
        formData={formData}
        addRow={addStop}
        updateRow={updateStop}
        setData={setData}
        setDialog={setDialog}
        setRows={setRows}/>
      <Location cursor="pointer">
        {rows.map(item => (
          <Marker key={item.id} position={item.location} icon={L.icon({
            iconUrl: '/images/icons/stop'+(item.active?"":"-disabled")+'.svg',
            iconRetinaUrl: '',
            shadowUrl: '',
            iconSize: [38, 38],
            iconAnchor: [12, 30],
            popupAnchor: [7, -34],
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
                  "campus": item.campus
                })
                setMode(item.id)
                setDialog(true)
              }}>
                <img src={static_dir+"images/icons/edit.svg"}/>
              </button>
            <button className="del-btn"><img src={static_dir+"images/icons/delete.svg"}/></button>
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