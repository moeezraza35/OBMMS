import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { frontend } from "../config"
import UsersTable from "../components/tables/usertable"
import GroupTable from "../components/tables/grouptable"
import Aside from "../components/aside"
import TitleBar from "../components/titlebar"
import { LoadingContext } from "../context/loading"
import { AuthContext } from "../context/auth"
import { getModels } from "../utils/models"

function Dashboard(){
  const params = useParams()
  const [models, setModels] = useState([])
  const {loading, setLoading} = useContext(LoadingContext)
  const {user} = useContext(AuthContext)
  const navigate = useNavigate()
  useEffect(() => {
    console.log("Dashboard working...") // Debug print
    if (loading) {
      console.log("Dashboard is blocked by loading")  // Debug print
      return
    }
    if (user == null) {
      console.log("returning back to login")  // Debug print
      navigate("/login/")
    }
    setLoading(true)
    getModels()
    .then(data => {
      setModels(data.models)
      setLoading(false)
    })
    .catch(e => console.log("Unable to fetch models.",e))
  }, [user])
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