import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/auth"
import { LoadingContext } from "../context/loading"
import { useNavigate } from "react-router-dom"
import { static_dir } from "../config"
import Dialog from "./dialog"

function Table({children, cols=[], model="", inputs=[], addRow=()=>{}, updateRow=()=>{}, fetchData=async()=>{}, renderRows=()=>{}}){
  const [rows, setRows] = useState([])            // Data to be render
  const [dialog, setDialog] = useState(false)     // Toggle dialog box
  const [formMode, setMode] = useState(0)         // 0 for add and number for update
  const [formData, setData] = useState({})        // Form data for posting
  const {setLoading} = useContext(LoadingContext)
  const {session_id, user, permissions, checkFlag} = useContext(AuthContext)
  const navigate = useNavigate()
  const loadData = async () => {
    setLoading(true)
    const data = await fetchData(session_id, navigate)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => {
    loadData()
  }, [checkFlag])
  return (
    <>
      <Dialog
        dialog={dialog}
        formMode={formMode}
        inputs={inputs}
        formData={formData}
        addRow={addRow}
        updateRow={updateRow}
        setData={setData}
        setDialog={setDialog}
        setRows={setRows}/>
      { children }
      <table>
        <thead>
          <tr>
            {cols.map(col => (
            <th key={col}>{col}</th>
            ))}
            {user?.is_admin || permissions[model]==='w'?<th>
              <button className="add-btn" onClick={() => {
                setMode(0)
                setDialog(true)
              }}><img src={static_dir+"images/icons/add.svg"}/></button>
            </th>:""}
          </tr>
        </thead>
        <tbody>
          {renderRows(rows, user, permissions, setMode, setData, setDialog)}
        </tbody>
      </table>
    </>
  )
}
export default Table