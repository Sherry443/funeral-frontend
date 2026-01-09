/**
 *
 * Footer - West River Funeral Directors
 *
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import logo from "../../../../public/images/logo.png"
import { MapPin, Phone, Mail, Printer, Facebook } from 'lucide-react';
import "./Footer.css"

const Footer = () => {
  return (
    <footer className='funeral-footer'>
      <Container fluid>
        <Row className='g-0'>
          {/* Left Section - Logo and Grief Support */}
          <Col lg={4} className='footer-left-section'>
            <div className='footer-logo-section'>
              <Link to='/'>
                <img
                  src={logo}
                  alt='West River Funeral Directors LLC'
                  className='footer-logo'
                />
              </Link>
            </div>

            <div className='footer-grief-support'>
              <h3 className='grief-support-title'>A year of daily grief support</h3>
              <p className='grief-support-text'>
                Our support in your time of need does not end after the funeral services.
                ◆Enter your email below to receive a grief support message from us each day
                for a year. ◆You can unsubscribe at any time.
              </p>
              <div className='grief-support-form'>
                <input
                  type='email'
                  placeholder='Your Email'
                  className='grief-email-input'
                />
              </div>
            </div>
          </Col>

          {/* Center Section - Location */}
          <Col lg={4} className='footer-center-section'>
            <div className='footer-location-info'>
              <h3 className='footer-section-title'>Our Location</h3>

              <div className='location-details'>
                <div className='location-item'>
                  <MapPin size={20} className='location-icon' />
                  <div className='location-text'>
                    <strong>West River Funeral Directors LLC</strong><br />
                    420 East Saint Patrick St, Ste 106<br />
                    Rapid City, SD 57701
                  </div>
                </div>

                <div className='location-item'>
                  <Phone size={18} className='location-icon' />
                  <div className='location-text'>
                    Tel: 1-605-787-3940
                  </div>
                </div>

                <div className='location-item'>
                  <Printer size={18} className='location-icon' />
                  <div className='location-text'>
                    Fax: 1-605-854-5202
                  </div>
                </div>

                <div className='footer-social-icons'>
                  <a href='https://www.google.com/maps' target='_blank' rel='noreferrer noopener' className='social-icon'>
                    <MapPin size={20} />
                  </a>
                  <a href='mailto:info@westriverfd.com' className='social-icon'>
                    <Mail size={20} />
                  </a>
                  <a href='#' onClick={(e) => { e.preventDefault(); window.print(); }} className='social-icon'>
                    <Printer size={20} />
                  </a>
                  <a href='https://facebook.com' target='_blank' rel='noreferrer noopener' className='social-icon'>
                    <Facebook size={20} />
                  </a>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Section - Navigation Links */}
          <Col lg={4} className='footer-right-section'>
            <nav className='footer-navigation'>
              <ul className='footer-nav-list'>
                <li className='footer-nav-item'>
                  <Link to='/'>Home</Link>
                </li>
                <li className='footer-nav-item'>
                  <Link to='/obituaries'>Obituaries</Link>
                </li>
                <li className='footer-nav-item'>
                  <Link to='/about'>About Us</Link>
                </li>
                <li className='footer-nav-item'>
                  <Link to='/services'>Services</Link>
                </li>
                <li className='footer-nav-item'>
                  <Link to='/pre-plan'>Pre-Plan</Link>
                </li>
                <li className='footer-nav-item'>
                  <Link to='/location'>Location</Link>
                </li>
                <li className='footer-nav-item'>
                  <Link to='/resources'>Resources</Link>
                </li>
                <li className='footer-nav-item'>
                  <Link to='/veterans'>Veterans</Link>
                </li>
              </ul>
            </nav>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;