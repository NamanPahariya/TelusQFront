/**
 * Application footer component
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
      <footer className="bg-white py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} TelusQ. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">About</span>
                About
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">Help</span>
                Help
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">Contact</span>
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;