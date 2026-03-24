import { useState, useRef, useEffect } from 'react'
import SideBar from './SideBar'
import TopBar from './topBar'

function HomePage(){
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

export default HomePage
