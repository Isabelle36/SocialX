"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const tabs = ["All", "Published", "Scheduled", "Failed"];

const Page = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="bg-black h-screen">
      <h1 className="text-white font-inter font-medium p-[2%] text-3xl">Scheduled Posts</h1>
      
      <div className="flex ml-[2%] flex-row space-x-10">
        {tabs.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            variant={activeTab === tab ? "outline" : ''}
            className={
              activeTab === tab
                ? "cursor-pointer"
                : "border border-white/10 cursor-pointer text-white hover:bg-white/10"
            }
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="text-white ml-[2%] mt-10">
        {activeTab === "All" && <p>Showing all posts...</p>}
        {activeTab === "Published" && <p>Showing published posts...</p>}
        {activeTab === "Scheduled" && <p>Showing scheduled posts...</p>}
        {activeTab === "Failed" && <p>Showing failed posts...</p>}
      </div>
    </div>
  );
};

export default Page;
