'use client'

import React,{useState} from 'react'

const page = () => {
  const [showDropdown, setshowDropdown] = useState(false);
  
  const handleAccounts=()=>{
    setshowDropdown((prev)=>!prev)
  }

  return (
    <div className='bg-black h-screen'>
      <h1 className='text-3xl text-center pt-[2%] font-inter font-stretch-semi-expanded text-white'>Schedule Your <span className='font-instrumentSerif italic text-4xl text-green-300'>Posts</span></h1>
      <p className='text-2xl pt-[5%] pl-[5%] text-white font-inter font-bold'>Create a Post</p>
      <textarea placeholder='Type your caption here' className='bg-zinc-800 border border-white/30 text-white rounded-2xl mt-5 p-3 ml-[5%] w-[80%] h-[110px] focus:outline-none focus:ring-1 focus:ring-white/40 ' style={{ scrollbarWidth: "none" }}></textarea>
      <div onClick={handleAccounts} className='flex items-center text-white/85 justify-between  text-xs bg-zinc-800 w-[13%] h-[5%] ml-[5%] mt-[1.5%] p-2 rounded-xl cursor-pointer font-inter font-medium focus:ring-2 border border-white/20 ring-white/40'>
        Choose Your Account
        <span >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-white "
          >
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </span>
        </div>
        {showDropdown && (
          <>
            <div className='bg-zinc-900 flex justify-center items-center ml-[5%] rounded-lg mt-[0.5%] p-1 w-[13%]'>
              <p className='text-sm w-[13%] cursor-pointer hover:bg-zinc-600 text-white'>baby remember</p>
            </div>
          </>
        )}
    </div>
  )
}

export default page