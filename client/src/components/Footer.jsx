import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className='border-t '>
      <div className='container mx-auto p-4 text-center flex flex-col lg:flex-row lg:justify-between gap-4'>
         <p>©All Rights Reserved 2026</p> 
           <div className='flex items-center gap-4 justify-center'>
              <a href=''className='hover:text-primary-100'>
                <FaFacebook/>
              </a>
              <a className='hover:text-primary-100'>
                <FaSquareInstagram />
              </a>
              <a className='hover:text-primary-100'>
                <FaLinkedin />
              </a>
           </div>
      </div>
    </footer>
  )
}

export default Footer
