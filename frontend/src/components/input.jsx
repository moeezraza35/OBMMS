function Input({name, type="text", handleChange=()=>{}, value="", placeholder="", required=false, disabled=false}){
  return (
    <input
      type={type}
      name={name}
      id={name}
      placeholder={placeholder?placeholder:name.charAt(0).toUpperCase()+name.slice(1)+"..."}
      className="text-input"
      value={value}
      onChange={handleChange}
      required={required}
      disabled={!required && disabled}/>
  )
}
function Select({name, value="", values=[], required=false, disabled=false, handleChange=()=>{}}){
  return (
    <select
      name={name}
      id={name}
      className="text-input"
      value={value}
      onChange={handleChange}
      required={required}
      disabled={!required && disabled}>{values?.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label?opt.label:opt.value}</option>
      ))}</select>
  )
}
function SelectBox({name, value="", values=[], placeholder="", required=false, disabled=false, handleChange=()=>{}}){
  return (
    <div>
      <div className="flex">
        <label htmlFor={name} className="p-2 capitalize">{placeholder!==""?placeholder:name}</label>
        <Select
          name={name}
          handleChange={handleChange}
          value={value}
          values={values}
          required={required}
          disabled={disabled}/>
      </div>
    </div>
  )
}
function Checkbox({name, placeholder="", value=false, handleChange=()=>{}}){
  return (
    <label className="mb-2">
      <input
        type="checkbox"
        name={name}
        id={name}
        className="checkbox-input"
        checked={value}
        onChange={handleChange}
      />
      {placeholder!==""?placeholder:name.charAt(0).toUpperCase()+name.slice(1)}
    </label>
  )
}
export {Input, Select, SelectBox, Checkbox}