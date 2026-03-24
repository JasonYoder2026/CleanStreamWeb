import { useEffect, useState } from 'react'
import '../styles/topBar.css'
import supabase from '../api/supabase-client'
import HamburgerMenu from '../assets/hamburger-menu.svg'

function TopBar({setShowSideBar, sideBarRef }) {
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    const yourUuid = "bea49d86-0630-44a3-a6de-c192518215aa";
    const { data, error } = await supabase
      .from('Location_to_Admin')
      .select('profiles(*)').eq('user_id', yourUuid)

    if (error) console.error(error)
    setUserData(data[0])
  };

  const toggleSideBar = () => {
    setShowSideBar(prev => !prev)
  }

  return (
    <div className="top-bar-container">
      <div className='image-container'>
        <img src="src\assets\Icon.png" alt="clean stream icon" />
        <img src="src\assets\Slogan.png" alt="clean stream laundry solutions slogan" />
      </div>
      <p className='admin-name'>Welcome: {userData?.profiles?.full_name}</p>
      <img
        ref={sideBarRef}
        onClick={toggleSideBar}
        className="menu"
        src={HamburgerMenu}
        alt="menu"
      />
    </div>
  )
}

export default TopBar