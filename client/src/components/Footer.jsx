import React from 'react';

function Footer() {
    return (
        <footer className="footer ">
            <div className="container flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="row">
                    <a href="https://www.fatsecret.com">
                        <img src="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret.png" alt='fatsecretsicon' srcset="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret_2x.png 2x, https://platform.fatsecret.com/api/static/images/powered_by_fatsecret_3x.png 3x" border="0" />
                    </a>
                </div>
            </div>
        </footer>
    )
};

export default Footer;
