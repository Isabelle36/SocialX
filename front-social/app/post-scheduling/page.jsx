'use client'

import React, { useState } from 'react'

const page = () => {
  const [showDropdown, setshowDropdown] = useState(false);
  const [Accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleAccounts = async () => {
    setshowDropdown((prev) => !prev)

    if (!showDropdown) {

      try {
        const resOfAcc = await fetch('api/getting_saved_accounts', {
          credentials: 'include',
          headers: {
            "content-type": 'application/json'
          }
        })

        if (resOfAcc.status === 401) {
          console.log('User not authenticated')
          setAccounts([]);
          return;
        }

        if (!resOfAcc.ok) {
          throw new Error('Internal server error')
        }
        const data = await resOfAcc.json();
        setAccounts(data)
      } catch (err) {
        console.log('Error while fetching accounts:', err)
      }
    }
  }

  const handleselect = (acc) => {
    setshowDropdown(false);
    console.log('selected account', acc)
    setSelectedAccount(acc);
  }

  return (
    <div className='bg-black h-screen'>
      <h1 className='text-3xl text-center pt-[2%] font-inter font-stretch-semi-expanded text-white'>Schedule Your <span className='font-instrumentSerif italic text-4xl text-green-300'>Posts</span></h1>
      <p className='text-2xl pt-[5%] pl-[5%] text-white font-inter font-bold'>Create a Post</p>
      <textarea placeholder='Type your caption here' className='bg-zinc-800 border border-white/30 text-white rounded-2xl mt-5 p-3 ml-[5%] w-[80%] h-[110px] focus:outline-none focus:ring-1 focus:ring-white/40 ' style={{ scrollbarWidth: "none" }}></textarea>
      <div onClick={handleAccounts} className='flex items-center text-white/85 justify-between text-xs bg-zinc-800 w-[13%] h-[5%] ml-[5%] mt-[1.5%] p-2 rounded-xl cursor-pointer font-inter font-medium focus:ring-2 border border-white/20 ring-white/40'>
        {selectedAccount ? (
          <div className='flex space-x-3 cursor-pointer items-center'>
            <img className='rounded-full w-6 h-6' src={selectedAccount.profile_picture_url} alt='pfp' />
            <p className='text-sm text-white'>{selectedAccount.username}</p>
          </div>
        ) : (
          <>
            <p>Choose Your Account</p>
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </span>
          </>
        )}
      </div>
      {showDropdown && (
        <div
          className='bg-zinc-900 flex flex-col text-white ml-[5%] rounded-lg mt-[0.5%] p-2 w-[13%] shadow-lg max-h-60 overflow-y-auto'
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
        >
          {Accounts.length === 0 && (
            <p className='text-gray-400 text-sm text-center'>No accounts available</p>
          )}
          {Accounts.length > 0 &&
            Accounts.map((acc) => (
              <div
                key={acc.userInstaId}
                onClick={() => handleselect(acc)}
                className='flex items-center space-x-4 p-2 rounded-lg cursor-pointer hover:bg-zinc-800 transition duration-200'
              >
                <img
                  className='rounded-full w-8 h-8'
                  src={acc.profile_picture_url}
                  alt='pfp'
                />
                <p className='text-sm text-white'>{acc.username}</p>
              </div>
            ))}
        </div>
      )}
      
    </div>
  )
}

export default page