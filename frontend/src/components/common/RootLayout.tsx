import { Outlet } from "react-router"
import Header from "./Header"
import Footer from "./Footer"
import { SearchTermProvider } from "../../store/SearchContext"
import ScrollToTop from "../ScrollToTop";

function RootLayout() {
  return (
    <div>
      <ScrollToTop />
      <SearchTermProvider>
        <Header/>
        <div style={{ minHeight: "400px"}}>
          <Outlet/>
        </div>
        <Footer/>
      </SearchTermProvider>
    </div>
  )
}

export default RootLayout
