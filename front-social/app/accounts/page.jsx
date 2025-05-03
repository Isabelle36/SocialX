'use client';
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const Connecting = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInstagramLogin = () => {
    window.location.href = "/api/auth/facebook";
  };

  const handleDisconnect = (userInstaId) => {
    fetch("/api/logout", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ userInstaId }),
    }).then((res) => {
      if (res.ok) {
        setAccounts((prev) => prev.filter((account) => account.userInstaId !== userInstaId));
        window.location.href = "/";
      }
      else {
        throw new Error("Failed to disconnect the account.");
      }
    })
      .catch((err) => {
        console.log("Error during disconnecting account:", err);
      });
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/auth/checking-login", {
          credentials: "include",
        });

        console.log("Checking login response:", res.status);
        if (res.status === 401) {
          console.log("User not authenticated");
          return;
        }

        if (!res.ok) {
          throw new Error("Internal server error");
        }


        setLoading(true); // Set loading to true before fetching
        const AccountRes = await fetch("/api/getting_saved_accounts", {
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!AccountRes.ok) {
          if (AccountRes.status === 401) {
            // Handle token expiration
            const refreshRes = await fetch("/api/refresh_token", {
              credentials: "include",
              headers: {
                "content-type": "application/json",
              },
            })
            if (!refreshRes.ok) {
              throw new Error("Session expired. Please log in again.");
            }

            // Retry fetching accounts after refreshing the token
            const retryFetchAcc = await fetch("/api/getting_saved_accounts", {
              credentials: "include",
              headers: {
                "content-type": "application/json",
              },
            });

            if (!retryFetchAcc.ok) {
              throw new Error("Failed to fetch accounts after refreshing token.");
            }
            const retryFetchedData = await retryFetchAcc.json();
            setAccounts(retryFetchedData);
          }
          else {

            throw new Error("Failed to authenticate.");
          }
        }
        else {
          const data = await AccountRes.json();
          setAccounts(data);
        }

      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError(err.message || "Failed to load accounts. Please try again.");
      }
      finally {
        setLoading(false); 
      };
    };
    checkLogin();
  }, []);


  return (
    <div className="bg-zinc-900 text-white h-screen p-6" >
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
      {loading && <p className="text-white">Loading the accounts please be patient...</p>}
      {!loading && accounts.length === 0 && <p>Add an account first in order to schedule posts</p>}
      {!loading && accounts.length > 0 && (
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
                </div>
              </div>
              <Button
                className="text-white bg-red-500/93 hover:bg-red-500 cursor-pointer"
                onClick={() => handleDisconnect(account.userInstaId)}
              >
                Disconnect
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Connecting;