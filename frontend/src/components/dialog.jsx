import { useContext } from "react"
import { Input, Checkbox, SelectBox } from "../components/input"
import { LoadingContext } from "../context/loading"
import { AuthContext } from "../context/auth"
import handleChange from "../utils/form"

function Dialog({dialog=false, formMode=0, inputs=[], formData, addRow, updateRow, setData, setDialog, setRows}){
  const {setLoading} = useContext(LoadingContext)
  const {session_id} = useContext(AuthContext)
  return (
    <div className={"dialog"+(dialog?" active":"")}>
      <form onSubmit={async e => {
        e.preventDefault()
        setLoading(true)
        formMode===0?await addRow(formData, session_id, data => {
          setRows(prevRows => [...prevRows, data])
          setDialog(false)
        }):await updateRow(formData, session_id, data => {
          setDialog(false)
          setRows(prevRows => prevRows.map(item => item.id === data.id ? data : item))
        })
        setLoading(false)
      }}>
        <h3 className="mb-2">
          {formMode==0?"Add User":"Edit User"}
        </h3>
        <Input
          name="id"
          type="number"
          placeholder="ID..."
          handleChange={e => handleChange(e, setData)}
          value={formData.id || ""}
          disabled={formMode!==0}
          />
        {inputs.map(i => (
          i.type==="select"?
          <SelectBox
            key={i.name}
            name={i.name}
            value={formData[i.name] || ""}
            placeholder={i.placeholder!==""?i.placeholder:i.name}
            handleChange={e => handleChange(e, setData)}
            values={i.values}
            required={i.required}
            disabled={i.disabled}/>
          :i.type==="checkbox"?
          <Checkbox
            key={i.name}
            name={i.name}
            placeholder={i.placeholder}
            value={formData[i.name] || false}
            handleChange={() => setData({...formData, [i.name]: !formData[i.name]})}/>
          :<Input
            key={i.name}
            type={i.type}
            name={i.name}
            placeholder={i.placeholder}
            handleChange={e => handleChange(e, setData)}
            value={formData[i.name]}
            required={i.required}/>
        ))}
        <div className="flex gap-2">
          <input type="submit" value="Save" className="submit-input" />
          <input type="reset" value="Cancel" className="reset-input" onClick={() => {setDialog(false)}} />
        </div>
      </form>
    </div>
  )
}
export default Dialog