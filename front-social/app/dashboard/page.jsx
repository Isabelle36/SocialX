"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tabs = ["All", "Published", "Pending", "Failed"];

const ScheduledPosts = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
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
        setLoading(true);
        try {
          const response = await fetch("/api/fetching-posts-database");
          if (!response.ok) {
            throw new Error("Failed to fetch posts");
          }
          const data = await response.json();
          setPosts(data);
          setFilteredPosts(data);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
      finally {
        setLoading(false);
      };
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeTab.toLowerCase() === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter((post) => post.status.toLowerCase() === activeTab.toLowerCase())
      );
    }
  }, [activeTab, posts]);


  const getStatusStyles = (status) => {
    switch (status) {
      case "Published":
        return "border-green-400/40";
      case "failed":
        return "border-red-400/40";
      case "pending":
        return "border-orange-400/40";
      default:
        return "border-white/15";
    }
  };

  return (
    <div className="bg-black pb-[5%] min-h-screen">
      <h1 className="text-white font-inter font-medium p-[2%] text-3xl">
        Scheduled Posts
      </h1>

      <div className="flex ml-[2%] flex-row space-x-10">
        {tabs.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            variant={activeTab === tab ? "outline" : ""}
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

      {activeTab === "All" &&
        <div className="text-white ml-[2%] grid grid-cols-2 space-y-3 gap-4 mt-10">
          {loading ? (
            <p>Loading posts...</p>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post._id}
                className={`border max-w-[90%] hover:bg-zinc-800/40 rounded-lg p-4 flex flex-col justify-between min-h-[350px] space-y-5 bg-zinc-800/20 ${getStatusStyles(post.status)}`}
              >
                <h2 className="font-semibold text-xl line-clamp-2">{post.caption}</h2>
                <p className="text-sm text-gray-400">
                  Scheduled Time: {new Date(post.scheduledTime).toLocaleString()}
                </p>
                <div className="flex overflow-x-auto rounded-lg space-x-4">
                  {post.videos && (
                    <video className="w-40 h-40 rounded-lg object-cover" autoPlay muted loop src={post.videos} type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {Array.isArray(post.images) ? (
                    post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post Image ${index + 1}`}
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    ))
                  ) : (
                    post.images && (
                      <img
                        src={post.images}
                        alt="Post Image"
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    )
                  )}
                </div>

                <p className="text-sm text-gray-400">
                  <Badge variant="outline" className={`text-white text-center  w-[90px] py-1 font-normal text-xs capitalize ${post.status === "failed" ? "bg-red-400/20 border-red-300" : post.status === "pending" ? "bg-orange-400/20 border-orange-300" : post.status === "Published" || post.status === "Published with Warnings" ? "bg-green-400/20 border-green-300" : "bg-gray-400/20 border-gray-300"}`}>{post.status}</Badge>
                </p>

                {post.status === "failed" && post.error && (
                  <p className="text-sm text-red-400">Error: {post.error}</p>
                )}
              </div>
            ))
          ) : (
            <p>No posts to display.</p>
          )}
        </div>
      }
      {activeTab === "Published" &&
        <div className="text-white ml-[2%] grid grid-cols-2 space-y-3 gap-4 mt-10">
          {loading ? (
            <p>Loading posts...</p>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post._id}
                className={`border max-w-[90%] hover:bg-zinc-800/40 rounded-lg p-4 flex flex-col justify-between min-h-[350px] space-y-5 bg-zinc-800/20 ${getStatusStyles(post.status)}`}
              >
                <h2 className="font-semibold text-xl line-clamp-2">{post.caption}</h2>
                <p className="text-sm text-gray-400">
                  Scheduled Time: {new Date(post.scheduledTime).toLocaleString()}
                </p>
                <div className="flex overflow-x-auto space-x-4">
                  {post.videos && (
                    <video className="w-40 h-40 rounded-lg object-cover" autoPlay muted loop src={post.videos} type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {Array.isArray(post.images) ? (
                    post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post Image ${index + 1}`}
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    ))
                  ) : (
                    post.images && (
                      <img
                        src={post.images}
                        alt="Post Image"
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    )
                  )}
                </div>

                <p className="text-sm text-gray-400">
                  <Badge variant="outline" className={`text-white text-center  w-[90px] py-1 font-normal text-xs capitalize ${post.status === "failed" ? "bg-red-400/20 border-red-300" : post.status === "pending" ? "bg-orange-400/20 border-orange-300" : post.status === "Published" || post.status === "Published with Warnings" ? "bg-green-400/20 border-green-300" : "bg-gray-400/20 border-gray-300"}`}>{post.status}</Badge>
                </p>

                {post.status === "failed" && post.error && (
                  <p className="text-sm text-red-400">Error: {post.error}</p>
                )}
              </div>
            ))
          ) : (
            <p>No posts to display.</p>
          )}
        </div>
      }
      {activeTab === "Failed" &&
        <div className="text-white ml-[2%] grid grid-cols-2 space-y-3 gap-4 mt-10">
          {loading ? (
            <p>Loading posts...</p>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post._id}
                className={`border max-w-[90%] hover:bg-zinc-800/40 rounded-lg p-4 flex flex-col justify-between min-h-[350px] space-y-5 bg-zinc-800/20 ${getStatusStyles(post.status)}`}
              >
                <h2 className="font-semibold text-xl line-clamp-2">{post.caption}</h2>
                <p className="text-sm text-gray-400">
                  Scheduled Time: {new Date(post.scheduledTime).toLocaleString()}
                </p>
                <div className="flex overflow-x-auto space-x-4">
                  {post.videos && (
                    <video className="w-40 h-40 rounded-lg object-cover" autoPlay muted loop src={post.videos} type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {Array.isArray(post.images) ? (
                    post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post Image ${index + 1}`}
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    ))
                  ) : (
                    post.images && (
                      <img
                        src={post.images}
                        alt="Post Image"
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    )
                  )}
                </div>

                <p className="text-sm text-gray-400">
                  <Badge variant="outline" className={`text-white text-center  w-[90px] py-1 font-normal text-xs capitalize ${post.status === "failed" ? "bg-red-400/20 border-red-300" : post.status === "pending" ? "bg-orange-400/20 border-orange-300" : post.status === "Published" || post.status === "Published with Warnings" ? "bg-green-400/20 border-green-300" : "bg-gray-400/20 border-gray-300"}`}>{post.status}</Badge>
                </p>

                {post.status === "failed" && post.error && (
                  <p className="text-sm text-red-400">Error: {post.error}</p>
                )}
              </div>
            ))
          ) : (
            <p>No posts to display.</p>
          )}
        </div>
      }
      {activeTab === "Pending" &&
        <div className="text-white ml-[2%] grid grid-cols-2 space-y-3 gap-4 mt-10">
          {loading ? (
            <p>Loading posts...</p>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div
                key={post._id}
                className={`border max-w-[90%] hover:bg-zinc-800/40 rounded-lg p-4 flex flex-col justify-between min-h-[350px] space-y-5 bg-zinc-800/20 ${getStatusStyles(post.status)}`}
              >
                <h2 className="font-semibold text-xl line-clamp-2">{post.caption}</h2>
                <p className="text-sm text-gray-400">
                  Scheduled Time: {new Date(post.scheduledTime).toLocaleString()}
                </p>
                <div className="flex overflow-x-auto space-x-4">
                  {post.videos && (
                    <video className="w-40 h-40 rounded-lg object-cover" autoPlay muted loop src={post.videos} type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {Array.isArray(post.images) ? (
                    post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post Image ${index + 1}`}
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    ))
                  ) : (
                    post.images && (
                      <img
                        src={post.images}
                        alt="Post Image"
                        className="w-40 h-40 object-cover rounded-md"
                      />
                    )
                  )}
                </div>

                <p className="text-sm text-gray-400">
                  <Badge variant="outline" className={`text-white text-center  w-[90px] py-1 font-normal text-xs capitalize ${post.status === "failed" ? "bg-red-400/20 border-red-300" : post.status === "pending" ? "bg-orange-400/20 border-orange-300" : post.status === "Published" || post.status === "Published with Warnings" ? "bg-green-400/20 border-green-300" : "bg-gray-400/20 border-gray-300"}`}>{post.status}</Badge>
                </p>

                {post.status === "failed" && post.error && (
                  <p className="text-sm text-red-400">Error: {post.error}</p>
                )}
              </div>
            ))
          ) : (
            <p>You have no post scheduled.</p>
          )}
        </div>
      }
    </div>
  );
};

export default ScheduledPosts;
