import { BrowserRouter, Routes, Route } from "react-router"
import { AuthProvider } from "./context/auth"
import { LoadinProvider } from "./context/loading"
import Home from "./pages/home"
import Login from "./pages/login"
import Dashboard from "./pages/dashboard"
import Settings from "./pages/settings"
import Profile from "./pages/profile"
import Header from "./components/header"
import Footer from "./components/footer"
import "./assets/App.css"

function App() {
  return (
    <BrowserRouter>
      <LoadinProvider>
        <AuthProvider>
          <Header/>
          <Routes>
            <Route path='' element={<Home/>}/>
            <Route path="/login/" element={<Login/>}/>
            <Route path="/dashboard/" element={<Dashboard/>}/>
            <Route path="/dashboard/:model/" element={<Dashboard/>}/>
            <Route path="/profile/" element={<Profile/>}/>
            <Route path="/settings/" element={<Settings/>}/>
          </Routes>
          <Footer/>
        </AuthProvider>
      </LoadinProvider>
    </BrowserRouter>
  )
}

export default App
