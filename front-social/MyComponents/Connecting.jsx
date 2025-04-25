'use client';
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Connecting = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);

  const handleInstagramLogin = () => {
    window.location.href = "/api/auth/facebook";
  };

  const handleDisconnect = (userInstaId) => {
    console.log(`Disconnecting user with ID: ${userInstaId}`);
  };

  useEffect(() => {
    fetch("/api/getting_saved_accounts", {
      credentials: "include", // Include cookies in the request
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Handle token expiration
            return fetch("/api/refresh_token", {
              credentials: "include", 
            })
              .then((refreshRes) => {
                if (!refreshRes.ok) {
                  throw new Error("Session expired. Please log in again.");
                }
                return refreshRes.json();
              })
              .then(() => {
                // Retry fetching accounts after refreshing the token
                return fetch("/api/getting_saved_accounts", {
                  credentials: "include",
                });
              })
              .then((retryRes) => {
                if (!retryRes.ok) {
                  throw new Error("Failed to fetch accounts after refreshing token.");
                }
                return retryRes.json();
              });
          }
          throw new Error("Failed to authenticate.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAccounts(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching accounts:", err);
        setError(err.message || "Failed to load accounts. Please try again.");
      });
  }, []);

  return (
    <div className="bg-black h-screen p-6 text-white">
      <h1 className="text-4xl text-white/60 font-sans text-center mb-4">
        Manage Accounts
      </h1>
      <Separator className="bg-white/30 mb-6" />
      <Button
        variant="outline"
        className="text-black hover:bg-white/80 cursor-pointer mb-4"
        onClick={handleInstagramLogin}
      >
        + Add account
      </Button>
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.userInstaId}
            className="flex items-center justify-between bg-white/10 p-4 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <img
                src={account.profile_picture_url}
                className="w-12 h-12 rounded-full"
                alt={account.username}
              />
              <div>
                <p className="text-lg font-medium">{account.username}</p>
                <p className="text-sm text-gray-400">{account.pageName}</p>
              </div>
            </div>
            <Button
              className="bg-red-600/90 cursor-pointer hover:bg-red-600/100 text-white"
              onClick={() => handleDisconnect(account.userInstaId)}
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