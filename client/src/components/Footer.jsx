/**
 * @file Footer.jsx
 * @module Footer
 * @description Displays the social media icons and FatSecret branding at the bottom of the page.
 */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';

/**
 * Footer component
 *
 * @component
 * @returns {JSX.Element} A footer with social media links and "Powered by FatSecret" image.
 */
const Footer = () => {
    return (
        <footer className="footer flex flex-col items-center justify-center min-h-max bg-gradient-to-r from-green-400 to-teal-500 shadow-lg p-6">
            <div className="container flex flex-col items-center justify-center p-4">
                <div className="social-icons flex space-x-4 mb-4">
                    <a href="https://www.instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>
                    <a href="https://www.facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faFacebook} />
                    </a>
                    <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faTwitter} />
                    </a>
                    <a href="https://www.youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faYoutube} />
                    </a>
                </div>
                <div className="powered-by">
                    <a href="https://www.fatsecret.com" target="_blank" rel="noopener noreferrer" aria-label="Powered by FatSecret">
                        <img 
                            src="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.png" 
                            alt="Powered by FatSecret" 
                            srcSet="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret_2x.png 2x, https://platform.fatsecret.com/api/static/images/powered_by_fatsecret_3x.png 3x" 
                            border="0" 
                        />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
