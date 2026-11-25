import { BrowserRouter, Routes, Route } from "react-router"
import { AuthProvider } from "./context/auth"
import { LoadinProvider } from "./context/loading"
import { WebSocketProvider } from "./context/websocket"
import Home from "./pages/home"
import Login from "./pages/login"
import Dashboard from "./pages/dashboard"
import Password from "./pages/password"
import Profile from "./pages/profile"
import Header from "./components/header"
import Footer from "./components/footer"
import UpdateNotifier from "./components/UpdateNotifier"
import Map from "./pages/map"
import "./assets/App.css"

function Wrapper({children}){
  return (
    <>
      <Header/>
      {children}
      <Footer/>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LoadinProvider>
        <AuthProvider>
          <WebSocketProvider>
            <UpdateNotifier />
            <Routes>
              <Route path='' element={<Wrapper><Home/></Wrapper>}/>
              <Route path="/login/" element={<Wrapper><Login/></Wrapper>}/>
              <Route path="/dashboard/" element={<Wrapper><Dashboard/></Wrapper>}/>
              <Route path="/dashboard/:model/" element={<Wrapper><Dashboard/></Wrapper>}/>
              <Route path="/profile/" element={<Wrapper><Profile/></Wrapper>}/>
              <Route path="/map/" element={<Map/>}/>
              <Route path="/change_password/" element={<Wrapper><Password/></Wrapper>}/>
            </Routes>
          </WebSocketProvider>
        </AuthProvider>
      </LoadinProvider>
    </BrowserRouter>
  )
}

export default App
