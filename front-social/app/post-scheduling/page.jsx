'use client'

import { Calendar } from '@/components/ui/calendar';
import { format } from "date-fns";
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarIcon, Clock4, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useEffect, useState, useRef } from 'react';

const page = () => {
  const [showDropdown, setshowDropdown] = useState(false);
  const [Caption, setCaption] = useState("")
  const [scheduledTime, setScheduledTime] = useState(null);
  const [Accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [date, setDate] = useState(null);
  const [file, setFile] = useState([]);
  const [time, setTime] = useState({ hour: 12, minute: 0, period: 'AM' });
  const [hasSelectedTime, setHasSelectedTime] = useState(false);
  const [timeZone, setTimeZone] = useState("UTC");
  const [loading, setLoading] = useState(false);
   const dropdownRef = useRef(null);

   useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setshowDropdown(false); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handlingFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const videos = selectedFiles.filter(file =>
      file.type.startsWith("video/")
    );
    const images = selectedFiles.filter(file =>
      file.type.startsWith("image/")
    );

    if (videos.length > 1) {
      alert("You can only upload one video.");
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }

    if (images.length > 10) {
      alert("You can only upload up to 10 images.");
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }

    if (videos.length === 1 && images.length > 0) {
      alert("Please upload either one video or up to 10 images — not both.");
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }
    setFile((prevFiles) => [...prevFiles, ...selectedFiles]);
    console.log(selectedFiles);
  }

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

  const handleCaption = (e) => {
    setCaption(e.target.value);
  }
  const getZonedTime = () => {
    if (!date) return "Pick a date & time";

    const selectedDate = new Date(date);
    const timeString = `${time.hour}:${String(time.minute).padStart(2, '0')} ${time.period}`;
    const [hours, minutes] = timeString.split(/[: ]/).map(Number);
    const isPM = time.period === "PM";

    selectedDate.setHours(isPM ? hours + 12 : hours, minutes);
    const formatTime = formatInTimeZone(selectedDate, timeZone, "yyyy-MM-dd HH:mm:ssXXX");
    return formatTime;
  };

  useEffect(() => {
    if (date && time) {
      const zonedTime = getZonedTime();
      setScheduledTime(zonedTime);
    }
  }, [date, time, timeZone]);

  const fileInputRef = useRef(null)

  const handleScheduleSubmit = async () => {
    if (!file || !Caption || !scheduledTime || !selectedAccount) {
      alert("Please fill in all the required fields.");
      return;
    }

    const currentTime = new Date();
    const selectedTime = new Date(scheduledTime);

    if (selectedTime <= currentTime) {
      alert("The scheduled time must be in the future. Please select a valid time.");
      return;
    }

    try {
      const formData = new FormData();
      file.forEach((e) => {
        formData.append("file", e);
      })

      const uploadResponse = await fetch("/api/file-upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { urls: imageUrls } = await uploadResponse.json();

      const payload = {
        imageUrls,
        caption: Caption,
        scheduledTime,
        igUserId: selectedAccount.userInstaId,
        accessToken: selectedAccount.accessToken,
      };

      console.log("Payload:", payload);

      const response = await fetch("/api/scheduling-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Post scheduled successfully!");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error scheduling post:", error);
      alert("An error occurred while scheduling the post.");
    }
    setCaption("");
    setFile([]);
    setDate(null);
    setScheduledTime(null);
    setTimeZone("UTC");
    setTime({ hour: 12, minute: 0, period: 'AM' });
    setHasSelectedTime(false);
    setshowDropdown(false);
    setSelectedAccount(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }

  };

  return (
    <div className='bg-black h-screen'>
      <h1 className='text-3xl text-center pt-[2%] font-inter font-stretch-semi-expanded text-white'>Schedule Your <span className='font-instrumentSerif italic text-4xl text-green-300'>Posts</span></h1>
      <p className='text-2xl pt-[5%] pl-[5%] text-white font-inter font-bold'>Create a Post</p>
      <textarea placeholder='Type your caption here' value={Caption} onChange={handleCaption} className='bg-zinc-900 border border-white/30 text-white rounded-2xl mt-5 p-3 ml-[5%] w-[80%] h-[110px] focus:outline-none focus:ring-1 focus:ring-white/40 ' style={{ scrollbarWidth: "none" }}></textarea>
      <div className='flex items-center ml-[11%] mt-[1.5%] space-x-4'>
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
              <Clock4 />
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


      <div className="flex flex-col mt-[2.5%] text-center ml-[26%] space-y-4">

        <div className="relative w-full  max-w-md">
          <form>
            <input
              id="media-upload"
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handlingFileChange}
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </form>
          <div className="flex items-center justify-center w-full h-12 bg-zinc-900/70  border border-white/20 rounded-md cursor-pointer">
            <div>
              <Images className='text-white/75 mr-2' />
            </div>
            <p className="text-white/80 text-sm">Upload image/videos</p>
          </div>
        </div>
      </div>


      <div className='flex items-center mt-[6%] ml-[41%]'>
        <button onClick={handleScheduleSubmit} className='bg-green-500 p-1.5 w-[14%] text-sm font-medium cursor-pointer hover:bg-green-400 text-black rounded-sm text-center '>
          Schedule Post
        </button>
      </div>
      {showDropdown && (
        <div
          className='bg-zinc-900 ml-[11%] mt-[-13.8%] flex flex-col text-white rounded-lg p-2 w-[13.6%] shadow-lg max-h-60 overflow-y-auto'
          ref={dropdownRef} style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
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