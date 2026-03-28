import { NavLink } from 'react-router-dom'; // Using 'react-router-dom' for standard practice
import { useAuth } from '../../store/AuthContextProvider'; 
import "../../css/footer.css";
import { IoBookSharp } from 'react-icons/io5';
import { CiMail, CiPhone } from 'react-icons/ci';



function Footer() {
  const { currentUser } = useAuth();
  const currentYear = new Date().getFullYear();

  // Conditional links based on the image's requirement (unauthenticated state)
  const defaultQuickLinks = (
    <ul className="olms-list">
      {/* Note: The image uses the accent color for 'Browse Catalog' and 'New Arrivals' */}
      <li className='text-start'><NavLink to="/" className="olms-link olms-link-highlight">Browse Catalog</NavLink></li>
    </ul>
  );

  // User/Admin links (preserving your original logic)
  const userQuickLinks = (
    <ul className="olms-list">
      {/* Assuming user links should be muted/white */}
      <li className='text-start'><NavLink to="/" className="olms-link olms-link-muted">Browse Catalog</NavLink></li>
      <li className='text-start'><NavLink to="/user/my-books" className="olms-link olms-link-muted">My Books</NavLink></li>
      <li className='text-start'><NavLink to="/user/my-books/borrow-books" className="olms-link olms-link-muted">Borrowed Books</NavLink></li>
      <li className='text-start'><NavLink to="/user/my-books/returned-books" className="olms-link olms-link-muted">Returned Books</NavLink></li>
      <li className='text-start'><NavLink to="/user/cart" className="olms-link olms-link-muted">Cart</NavLink></li>
    </ul>
  );

  const adminQuickLinks = (
    <ul className="olms-list">
      <li><NavLink to="/" className="olms-link olms-link-muted">Browse Catalog</NavLink></li>
    </ul>
  );

  let linksToRender;
  if (currentUser?.role === "user") {
    linksToRender = userQuickLinks;
  } else if (currentUser?.role === "admin") {
    linksToRender = adminQuickLinks;
  } else {
    linksToRender = defaultQuickLinks;
  }

  return (
    <footer className="olms-footer">
      <div className="olms-footer-content-wrapper">

        {/* Column 1: Brand/About and Quick Links */}
        <div className="olms-col-left">
          
          {/* Brand/About */}
          <div className="olms-brand-group">
            <div className="olms-brand">
              {/* Using a span for the icon and text to match the image's alignment */}
              {/* <span className="olms-book-icon"></span> */}<IoBookSharp className=' text-white fs-4'/>
              <h3 className="olms-title">OLMS</h3>
            </div>
            <p className="olms-about-text">
              Your gateway to knowledge. Explore thousands books, journals, and digital resources anytime and anywhere.
            </p>
          </div>

          {/* Quick Links (Placed beside Brand/About in the image's structure) */}
          <div className="olms-quick-links">
            <h5 className="olms-heading">Quick Links</h5>
            {linksToRender}
          </div>
        </div>

        {/* Column 2: Stay Informed */}
        <div className="olms-col-right">
          <h5 className="olms-heading">Stay Informed</h5>
          <p className="olms-subscribe-text">
            Subscribe for new arrivals, reading events, and library updates.
          </p>

         <form className="olms-subscribe-form">
              <input
                type="email"
                placeholder="Enter your email"
                // The visual change is achieved through the CSS class below
                className="olms-email-input" 
              />
              <button className="olms-subscribe-button" type='button'>
                Subscribe
              </button>
            </form>
        <div className="olms-contact-info">
            <p className='olms-contact-item'>
              {/* --- UPDATED EMAIL LINE --- */}
              <CiMail className="contact-icon" /> support@librarylink.com
            </p>
            <p className='olms-contact-item'>
              {/* --- UPDATED PHONE LINE --- */}
              <CiPhone className="contact-icon" /> 1-800-LIBRARY
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="olms-bottom-bar">
        <div className="olms-bottom-bar-content">
          <p className="olms-copyright">
            © {currentYear} OLMS
          </p>
          <div className="olms-policy-links">
            <NavLink to="/privacy" className="olms-policy-link">Privacy Policy</NavLink>
            <span className="olms-separator">|</span>
            <NavLink to="/terms" className="olms-policy-link">Terms of Service</NavLink>
            <span className="olms-separator">|</span>
            <NavLink to="/cookies" className="olms-policy-link">Cookie Policy</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;