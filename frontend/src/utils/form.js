function handleChange(e, callback){
  const name = e.target.name
  const value = e.target.value
  callback(values => ({...values, [name]:value}))
}
export default handleChange