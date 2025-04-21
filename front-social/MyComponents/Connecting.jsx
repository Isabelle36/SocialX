'use client';
import React, { useEffect, useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Connecting = () => {
  const [accounts, setAccounts] = useState([]); 
  const [error, setError] = useState(''); 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accounts = params.get("accounts");

    if (accounts) {
        try {
            const parsedAccounts = JSON.parse(decodeURIComponent(accounts)); 
            setAccounts(parsedAccounts); 
            console.log("Parsed Accounts:", parsedAccounts); 
        } catch (error) {
            console.error("Error parsing accounts:", error);
            setError("Failed to load accounts. Please try again.");
        }
    }
}, []);

  

  const handleInstagramLogin = () => {
    window.location.href = "/api/auth/facebook";
  };


  return (
    <div className='bg-black h-screen p-6 text-white'>
      <h1 className='text-4xl text-white/60 font-sans text-center mb-4'>Manage Accounts</h1>
      <Separator className="bg-white/30 mb-6" />
      <Button
        variant="outline"
        className="text-black hover:bg-white/80 cursor-pointer mb-4"
        onClick={handleInstagramLogin}
      >
        + Add account
      </Button>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.instagramId}
            className="flex items-center justify-between bg-white/10 p-4 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <img
                src={account.profile_picture_url}
                alt="Profile"
                className="w-12 h-12 rounded-full"
              />
              <p>{account.username}</p>
            </div>
            <Button
              variant="destructive"
              className="text-white cursor-pointer bg-red-600/94 hover:bg-red-600"
              onClick={() => disconnectAccount(account.username)}
            >
              Disconnect
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Connecting;
