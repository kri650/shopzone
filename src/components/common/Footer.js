import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      Back to top
    </div>
    <div className="footer-mid">
      <div className="footer-col">
        <h4>Get to Know Us</h4>
        <Link to="#">About ShopZone</Link>
        <Link to="#">Careers</Link>
        <Link to="#">Press Releases</Link>
        <Link to="#">Investor Relations</Link>
        <Link to="#">Blog</Link>
      </div>
      <div className="footer-col">
        <h4>Make Money with Us</h4>
        <a href="https://shopzon-vendor-dashboard.vercel.app/register" target="_blank" rel="noreferrer">Sell on ShopZone</a>
        <Link to="/vendor-register">Become a Vendor (Mock)</Link>
        <Link to="#">Become an Affiliate</Link>
        <Link to="#">Advertise Your Products</Link>
        <Link to="#">ShopZone Business</Link>
        <Link to="#">ShopZone Pay</Link>
      </div>
      <div className="footer-col">
        <h4>Let Us Help You</h4>
        <Link to="/account">Your Account</Link>
        <Link to="/my-orders">Your Orders</Link>
        <Link to="#">Shipping Rates & Policies</Link>
        <Link to="#">Returns & Replacements</Link>
        <Link to="#">Help Centre</Link>
      </div>
      <div className="footer-col">
        <h4>Connect With Us</h4>
        <Link to="#">Facebook</Link>
        <Link to="#">Twitter / X</Link>
        <Link to="#">Instagram</Link>
        <Link to="#">YouTube</Link>
        <Link to="#">LinkedIn</Link>
      </div>
    </div>
    <div className="footer-divider" />
    <div className="footer-bottom">
      <div className="footer-logo">ShopZone<span>.in</span></div>
      <div className="footer-bottom-links">
        <Link to="#">Conditions of Use</Link>
        <Link to="#">Privacy Policy</Link>
        <Link to="#">Interest-Based Ads</Link>
      </div>
      <p>© 2025 ShopZone Private Limited. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;