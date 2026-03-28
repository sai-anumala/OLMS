import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop=()=>{
  // get the current location object which updates on navigation
  const {pathname}=useLocation();

  // useEffect hook is used whenever the pathname changes
  useEffect(() => {
    // scrolls to top of that window
    window.scrollTo(0,0);
  },[pathname]); 

  return null;
};

export default ScrollToTop;