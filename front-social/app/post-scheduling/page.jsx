'use client'

import { Calendar } from '@/components/ui/calendar';
import { format } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useEffect, useState } from 'react';

const page = () => {
  const [showDropdown, setshowDropdown] = useState(false);
  const [Accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState({ hour: 12, minute: 0, period: 'AM' });
  const [hasSelectedTime, setHasSelectedTime] = useState(false);
  const [timeZone, setTimeZone] = useState("UTC");
  const [loading, setLoading] = useState(false);

  const timeZones = [
    "UTC",
    "America/New_York",
    "Europe/London",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "Australia/Sydney",
  ]; 

  useEffect(() => {
    const fetchAccounts = async () => {

      setLoading(true);
      try {
        const resOfAcc = await fetch('api/getting_saved_accounts', {
          credentials: 'include',
          headers: {
            "content-type": 'application/json'
          }
        });

        if (resOfAcc.status === 401) {
          console.log('User not authenticated');
          setAccounts([]);
          return;
        }

        if (!resOfAcc.ok) {
          throw new Error('Internal server error');
        }
        const data = await resOfAcc.json();
        setAccounts(data);
      } catch (err) {
        console.log('Error while fetching accounts:', err);
      }
      finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);



  const incrementTime = (field) => {
    setHasSelectedTime(true);
    setTime((prev) => {
      if (field === 'hour') {
        const newHour = prev.hour === 12 ? 1 : prev.hour + 1;
        return { ...prev, hour: newHour };
      }
      if (field === 'minute') {
        const newMinute = prev.minute === 59 ? 0 : prev.minute + 1;
        return { ...prev, minute: newMinute };
      }
      if (field === 'period') {
        const newPeriod = prev.period === 'AM' ? 'PM' : 'AM';
        return { ...prev, period: newPeriod };
      }
      return prev;
    });
  };

  const decrementTime = (field) => {
    setHasSelectedTime(true);
    setTime((prev) => {
      if (field === 'hour') {
        const newHour = prev.hour === 1 ? 12 : prev.hour - 1;
        return { ...prev, hour: newHour };
      }
      if (field === 'minute') {
        const newMinute = prev.minute === 0 ? 59 : prev.minute - 1;
        return { ...prev, minute: newMinute };
      }
      if (field === 'period') {
        const newPeriod = prev.period === 'AM' ? 'PM' : 'AM';
        return { ...prev, period: newPeriod };
      }
      return prev;
    });
  };

  const handleAccounts = () => {
    setshowDropdown((prev) => !prev);
  }

  const handleselect = (acc) => {
    setshowDropdown(false);
    setSelectedAccount(acc);
  };

  const handleTimeZoneChange = (event) => {
    setTimeZone(event.target.value);
  };

  const getZonedTime = () => {
    if (!date) return "Pick a date & time";

    const selectedDate = new Date(date);
    const timeString = `${time.hour}:${String(time.minute).padStart(2, '0')} ${time.period}`;
    const [hours, minutes] = timeString.split(/[: ]/).map(Number);
    const isPM = time.period === "PM";

    // Set the selected time on the date
    selectedDate.setHours(isPM ? hours + 12 : hours, minutes);

    // Format the date in the selected time zone
    return formatInTimeZone(selectedDate, timeZone, "yyyy-MM-dd HH:mm:ssXXX");
  };

  return (
    <div className='bg-black h-screen'>
      <h1 className='text-3xl text-center pt-[2%] font-inter font-stretch-semi-expanded text-white'>Schedule Your <span className='font-instrumentSerif italic text-4xl text-green-300'>Posts</span></h1>
      <p className='text-2xl pt-[5%] pl-[5%] text-white font-inter font-bold'>Create a Post</p>
      <textarea placeholder='Type your caption here' className='bg-zinc-900 border border-white/30 text-white rounded-2xl mt-5 p-3 ml-[5%] w-[80%] h-[110px] focus:outline-none focus:ring-1 focus:ring-white/40 ' style={{ scrollbarWidth: "none" }}></textarea>
      <div className='flex items-center ml-[5%] mt-[1.5%] space-x-4'>
        <div onClick={handleAccounts} className='flex items-center hover:bg-zinc-900/60 text-white/80 justify-between w-[180px] h-[40px] text-sm bg-zinc-900/70   mt-[1.5%] p-1.5 rounded-md cursor-pointer font-normal focus:ring-2 border border-white/20 ring-white/40'>
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "w-[180px] h-[40px] cursor-pointer justify-start focus:ring-2 border border-white/20 ring-white/40 text-left hover:bg-zinc-900/60 bg-zinc-900/70 text-white font-normal ml-[5%] mt-[2%]",
                !date && "text-white/80"
              )}
            >
              <CalendarIcon />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-zinc-900 text-white rounded-lg shadow-lg" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "w-[180px] h-[40px] cursor-pointer justify-start focus:ring-2 border border-white/20 ring-white/40 text-left hover:bg-zinc-900/60 bg-zinc-900/70 text-white font-normal ml-[5%] mt-[2%]",
                !time && "text-white/80"
              )}
            >
              {hasSelectedTime
                ? `${time.hour}:${String(time.minute).padStart(2, '0')} ${time.period}`
                : <span className='font-normal text-white/80 '>Pick a time</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 bg-zinc-900 text-white rounded-lg shadow-lg" align="start">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col items-center">
                <button onClick={() => incrementTime('hour')} className="text-white bg-zinc-800 p-2 rounded-md">+</button>
                <span className="text-lg">{time.hour}</span>
                <button onClick={() => decrementTime('hour')} className="text-white bg-zinc-800 p-2 rounded-md">-</button>
              </div>
              <span className="text-lg">:</span>
              <div className="flex flex-col items-center">
                <button onClick={() => incrementTime('minute')} className="text-white bg-zinc-800 p-2 rounded-md">+</button>
                <span className="text-lg">{String(time.minute).padStart(2, '0')}</span>
                <button onClick={() => decrementTime('minute')} className="text-white bg-zinc-800 p-2 rounded-md">-</button>
              </div>
              <div className="flex flex-col items-center">
                <button onClick={() => incrementTime('period')} className="text-white bg-zinc-800 p-2 rounded-md">+</button>
                <span className="text-lg">{time.period}</span>
                <button onClick={() => decrementTime('period')} className="text-white bg-zinc-800 p-2 rounded-md">-</button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div className='flex mt-[2%] ml-[4%] items-center  text-white justify-between w-[180px] h-[40px] text-sm bg-zinc-900 p-1.5 rounded-md cursor-pointer font-normal border border-white/20 '
        >
          <select
            value={timeZone}
            onChange={handleTimeZoneChange}
            className='p-[5%]  text-white bg-zinc-900   focus:outline-none cursor-pointer appearance-none '
          >
            {timeZones.map((zone) => (
              <option className='cursor-pointer' key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
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
        </div>
      </div>
      {showDropdown && (
        <div
          className='bg-zinc-900 flex flex-col text-white ml-[5%] rounded-lg mt-[0.5%] p-2 w-[13%] shadow-lg max-h-60 overflow-y-auto'
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
        >
          {Accounts.length === 0 && (
            <p className='text-gray-400 text-sm text-center'>No accounts available</p>
          )}
          {
            loading && <p className='text-gray-400 text-sm text-center'>Loading accounts...</p>
          }
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
  );

};

export default page;