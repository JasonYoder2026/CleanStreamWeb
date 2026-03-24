import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

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
