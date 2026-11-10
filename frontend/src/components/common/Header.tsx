import { useState } from "react";
import Navbar from "./Navbar";
import Profile from "./Profile";
import "../../css/Header.css";

// Sticky top bar with the profile side panel
function Header() {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <header className="navigation shadow-sm">
      <Navbar handleOpenProfile={() => setShowProfile(true)} />
      <Profile showCanvas={showProfile} handleClose={() => setShowProfile(false)} />
    </header>
  );
}

export default Header;
