import { useContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { api_prefix, backend, frontend } from "../config"
import UsersTable from "../components/tables/usertable"
import GroupTable from "../components/tables/grouptable"
import Aside from "../components/aside"
import TitleBar from "../components/titlebar"
import { LoadingContext } from "../context/loading"

function Dashboard(){
  const params = useParams()
  const [models, setModels] = useState([])
  const {setLoading} = useContext(LoadingContext)
  useEffect(() => {
    setLoading(true)
    fetch(backend+api_prefix+"admin/models/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type" : "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      setModels(data.models)
      setLoading(false)
    })
    .catch(e => console.log("Unable to fetch models.",e))
  }, [])
  return (
    <main className="flex relative">
      <Aside title="Activities">
        {models.map((model) => (
          <li key={model} className={params.model==model?"active":""}>
            <Link to={frontend+"/dashboard/"+model+'/'}>{model}</Link>
          </li>
        ))}
      </Aside>
      <section className="flex-1 min-w-max mr-2 overflow-x-auto">
        <TitleBar>Dashboard</TitleBar>
        {params.model=="users"?<UsersTable/>
        :params.model=="group"?<GroupTable models={models}/>
        :""}
      </section>
    </main>
  )
}
export default Dashboard