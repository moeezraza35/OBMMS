import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { LoadingContext } from "../context/loading"
import { AuthContext } from "../context/auth"
import { getModels } from "../utils/models"
import { frontend } from "../config"
import UsersTable from "./usertable"
import GroupTable from "./grouptable"
import Aside from "../components/aside"
import TitleBar from "../components/titlebar"
import BusTable from "./bustable"
import LocationTable from "./locationtable"
import StopsTable from "./stopstable"
import RoutesTable from "./routestable"
import PackagesTable from "./packagestable"
import HistoryTable from "./historytable"
import LogsTable from "./logstable"
import redirect from "../utils/redirect"

function Dashboard(){
  const [rows, setRows] = useState([])            // Data to be render
  const [dialog, setDialog] = useState(false)     // Toggle dialog box
  const [formMode, setMode] = useState(0)         // 0 for add and number for update
  const [formData, setData] = useState({})        // Form data for posting
  const [models, setModels] = useState([])        // List of Menu
  const {setLoading} = useContext(LoadingContext)
  const {session_id, user, permissions, checkFlag} = useContext(AuthContext)
  const params = useParams()
  const navigate = useNavigate()
  const tableProps = {session_id, user, permissions, checkFlag, rows, setRows, dialog, setDialog, formMode, setMode, formData, setData, navigate, setLoading}
  const loadData = async () => {
    if (!checkFlag) {
      return
    }
    await redirect(user, navigate)
    setLoading(true)
    await getModels(
      session_id,
      data => setModels(data),
      null,
      navigate
    )
    setLoading(false)
  }
  useEffect(() => {
    loadData()
  }, [checkFlag])
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
        {params.model==="users"?<UsersTable {...tableProps}/>
        :params.model==="group"?<GroupTable models={models} {...tableProps}/>
        :params.model==="buses"?<BusTable {...tableProps}/>
        :params.model==="location"?<LocationTable {...tableProps}/>
        :params.model==="stops"?<StopsTable {...tableProps}/>
        :params.model==="routes"?<RoutesTable {...tableProps}/>
        :params.model==="packages"?<PackagesTable {...tableProps}/>
        :params.model==="history"?<HistoryTable {...tableProps}/>
        :<LogsTable {...tableProps}/>}
      </section>
    </main>
  )
}
export default Dashboard