import './styles/App.css'
import TopBar from './components/topBar'
import Login from "./components/LoginPage"
import { useState, useRef, useEffect } from 'react'
import SideBar from './components/SideBar'
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom';


function Login(){
  return(<div>
    <Link to="/Home">Hello</Link>
  </div>)
}

function Home(){
    const [showSideBar, setShowSideBar] = useState(false)
  const sideBarRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (sideBarRef.current && !sideBarRef.current.contains(event.target)) {
        setShowSideBar(false)
      }
    }

    if (showSideBar) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSideBar])

  return (
    <div className='app-container'>
      <TopBar
        setShowSideBar={setShowSideBar}
        sideBarRef={sideBarRef}
      />
      <div className='content-container'>
        {showSideBar && <SideBar ref={sideBarRef} />}
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App