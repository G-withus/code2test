

import footerLogo from "../assets/footerlogo.png"

const Footer = () => {

  const data=new Date();
  return (
<div className="w-full mx-auto bottom-0">
  <footer className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50"> 
    <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4"> 
      {/* Logo Section */}
      <div className="md:pl-10 pl-4"> {/* Adjusted padding for mobile and desktop */}
        <img 
          src={footerLogo}  
          alt="Marine Drone Tech"   
          className="h-[47px] w-[220px]"
        />
      </div>

      {/* Copyright Section */}
      <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-gray-600 text-center md:text-left md:pr-10 pr-4"> 
        <span>© Copyright {data.getFullYear()} MDTKR, All Rights Reserved.</span>
        <div className="hidden md:block w-1 h-1 bg-gray-400 rounded-full" /> 
        <span>Empowering Innovation with Gwithus.</span>
      </div>
    </div>
  </footer>
</div>
  )
}

export default Footer