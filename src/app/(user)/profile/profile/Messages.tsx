"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getMessageId, getSession, getUserName } from "@/services/authservice";
import { jwtVerify } from "jose";
import { removeLocal } from "@/services/authservice";
import { supabase } from "@/services/supabaseClient";
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

interface Message {
  id: string;
  first_name: string;
  created_at: string;
  message: string;
  for: string;
}

interface UserDetail {
  detailsid: string;
  first_name: string;
}

export const Messages = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetail[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);


  useEffect(() => {
    const subscription = supabase
      .channel('articles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, (payload: any) => {
        setChatMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);


  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch messages and user details
  useEffect(() => {
    const fetchMessages = async () => {
      const token = getSession();
      if (token) {
        try {
          const messageId = localStorage.getItem("messageId");
          const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
          const userIdFromToken = payload.id as string;
          const userNameFromToken = payload.username as string;
          setUserId(userIdFromToken);
          setMessageId(messageId);

          const response = await fetch('/api/chat', {
            method: 'GET',
            headers: {
              'Authorization': userIdFromToken,
              'Append': userNameFromToken,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch messages');
          }

          const data = await response.json();
          setMessages(data.messages || []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('No session token found');
      }
    };

    fetchMessages(); // Initial fetch

    const intervalId = setInterval(fetchMessages, 1000); // Fetch messages every 2 seconds
    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, [refreshKey]);


  const handleSendMessage = async () => {
    const token = getSession();
    if (!newMessage || !token) return;
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const userIdFromToken = payload.id as string;
      const getUser = getUserName();
      const messageId = getMessageId();
      const messageData = {
        message: newMessage,
        forId: messageId,
        first_name: getUser
      };

      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": userIdFromToken,
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const { data: updatedMessages } = await response.json(); // Now we get the updated messages

      // Update the state with the updated messages
      setChatMessages(updatedMessages);
      setNewMessage("");
      setRefreshKey((prev) => prev + 1); // Optionally trigger any refresh logic you have
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoadingMsg(false);
    }
  };


  useEffect(() => {
    const handleBeforeUnload = () => {
      removeLocal();
    };

    // Add event listener for refresh or unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clean up the event listener on component unmount
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);


  // useEffect(() => {
  //   const token = getSession();
  //   if (!token) return;
  //   const getUpdatedData = async () => {
  //     try {
  //       const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
  //       const userIdFromToken = payload.id as string;
  //       const getUser = getUserName();
  //       const messageId = getMessageId();
  //       const response = await fetch('/api/forRefresh', {
  //         method: 'GET',
  //         headers: {
  //           "Content-Type": "application/json",
  //           "Authorization": userIdFromToken,
  //         },
  //       });

  //       if (response.status === 200) {
  //         const data = await response.json();
  //         setChatMessages(data.messages);
  //       } else {
  //         console.error('Failed to fetch messages');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching messages:', error);
  //     }
  //   };

  // }, []);

  const handleUserClick = async (userId: string, messageId: string, msgFor: string) => {
    removeLocal();
    setLoading(true);
    setChatMessages([]);
    const token = getSession();
    if (!token) return;
    try {
      const messageId = getMessageId();
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const userIdFromToken = payload.id as string;
      const userNameFromToken = payload.username as string;
      setUserId(userIdFromToken);

      const response = await fetch('/api/chat', {
        method: 'GET',
        headers: {
          'Authorization': userIdFromToken,
          'Append': userNameFromToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setUserDetails(data.userDetails || []);
      if (data.userDetails && Array.isArray(data.userDetails)) {
        data.userDetails.forEach((userDetail: UserDetail) => {
          const first_name = userDetail.first_name
          localStorage.setItem("user", first_name);
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
    try {
      localStorage.setItem("messageId", messageId);
      const getMessageToken = getMessageId();
      console.log("Token ID" + getMessageToken);
      const someoneMessage = messages.filter((msg) => msg.id === messageId);
      const yourMessage = messages.filter((msg) => (msg.id === userId && msg.for == messageId));

      const combinedMessages = [...someoneMessage, ...yourMessage];
      const sortedMessages = combinedMessages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setChatMessages(sortedMessages);
      setIsChatOpen(true);
      setRefreshKey((prev) => prev + 1); // Trigger re-fetch on user click
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null); // Reference to the container
  const [firstTime, setFirstTime] = useState(true); // State to track the first load

  useEffect(() => {
    // Scroll to bottom logic
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      if (firstTime) {
        setFirstTime(false);
      }
    }
  }, [chatMessages]); // Run effect whenever chatMessages changes



  const filteredMessages = messages.filter((message) => message.id !== userId);

  const latestMessages = filteredMessages.reduce<Record<string, Message>>((acc, message) => {
    if (!acc[message.id] || new Date(message.created_at) > new Date(acc[message.id].created_at)) {
      acc[message.id] = message;
    }
    return acc;
  }, {});

  const latestMessagesArray = Object.values(latestMessages);
  return (
    <div className="w-full md:px-6 md:py-4 bg-shade-1 rounded-b-xl">
      <div className="w-full flex flex-col gap-6 p-4 rounded-lg">
        {/* Search Bar */}
        <div className="w-full flex items-center gap-4 p-2 px-4 rounded-full border border-primary-2">
          <Icon icon="lets-icons:search-light" width="35" height="35" />
          <input
            className="w-full bg-transparent placeholder:text-secondary-2 outline-none"
            type="text"
            placeholder="Search Direct Messages"
          />
        </div>

        {/* Main Content */}
        <div className="w-full h-[70dvh] flex bg-primary-1 text-primary-2 rounded-xl overflow-hidden">
          {/* Messages List */}
          {(!isChatOpen || !isMobile) && (
            <div className="w-full h-full lg:max-w-sm p-4 border border-primary-3 rounded-l-xl overflow-y-auto custom-scrollbar">
              {loading ? (
                <p>Loading messages...</p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  {latestMessagesArray.map((msg) => (
                    <div
                      key={msg.id}
                      className={`w-full flex items-center gap-2 p-4 rounded-lg cursor-pointer text-primary-2 ${msg.id == messageId ? 'bg-shade-8/60 ' : ''
                        }`}
                      onClick={() => {
                        if (userId) {
                          handleUserClick(userId, msg.id, msg.for);
                          console.log("msg CLICK: " + messageId);
                        }
                      }}
                    >
                      <div className="w-fit h-fit">
                        <div className="w-10 h-10 rounded-full bg-primary-2 text-secondary-1 flex items-center justify-center">
                          <span className="text-lg font-semibold">{msg.first_name ? msg.first_name[0] : 'U'}</span>
                        </div>
                      </div>
                      <div className="w-full flex flex-col">
                        <div className="w-full flex justify-between items-center">
                          <p className="text-sm font-semibold">{msg.first_name ? msg.first_name : 'User'}</p>
                          <p className="text-xs font-semibold opacity-80">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className={`text-base font-bold ${msg.message.length > 10 ? "line-clamp-1" : ""}`}>
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Window */}
          {(!isMobile || isChatOpen) && (
            <div className="w-full h-full border border-primary-3 rounded-r-xl flex flex-col overflow-hidden">
              <div className="h-fit p-2 bg-primary-1 border-b-2 border-primary-3 w-full flex justify-between items-center">
                <div className="h-fit w-fit">
                  {/* display user name here and profile picture */}
                  {chatMessages.length > 0 && (
                    <div className="flex items-center gap-2 p-1">
                      <div className="w-10 h-10 rounded-full bg-primary-2 text-secondary-1 flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {chatMessages[0].first_name
                            ? chatMessages[0].first_name[0]
                            : 'U'}
                        </span>
                      </div>
                      <p className="text-lg font-bold">
                        {chatMessages[0].first_name
                          ? chatMessages[0].first_name
                          : 'User'}
                      </p>
                    </div>
                  )}
                </div>
                {isMobile && ( 
                  <button
                    className=" text-secondary-1 h-fit z-10"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <Icon icon="eva:arrow-back-outline" width="25" height="25" />
                  </button>
                )}
              </div>

              <div ref={containerRef} className="w-full h-full overflow-y-auto custom-scrollbar lg:p-4 p-2">
                {loadingMsg ? (
                  <p>Loading messages...</p>
                ) : (
                  chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                      <div
                        className={`flex ${msg.id === userId ? 'justify-end' : 'justify-start'} w-full mb-4 `}
                      >
                        <div className={`flex ${msg.id === userId ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 overflow-hidden max-w-md md:max-w-lg lg:max-w-sm`}>
                          <div className="w-fit h-fit">
                            <div className="w-8 h-8 rounded-full bg-primary-3 flex items-center justify-center relative">
                              <span className="text-sm font-semibold rounded-full">{msg.first_name ? msg.first_name[0] : 'U'}</span>
                            </div>
                          </div>

                          <div className={`w-full p-3 rounded-lg  ${msg.id === userId ? 'bg-shade-3 text-white' : 'bg-gray-200 text-primary-2'}`}>
                            {/* break all to prevent overflow hahahah english amp*/}
                            <p className="break-all">
                              {msg.message}
                            </p>
                            <p className="text-[10px] mt-1 opacity-70">{new Date(msg.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Click specific messages to display.</p>
                  )
                )}
              </div>

              {/* Message Input */}
              <div className="w-full p-4 bg-primary-1">
                <div className="w-full flex gap-2 justify-between items-center text-primary-2 bg-shade-8 rounded-full px-4">
                  <input
                    className="w-full p-3 outline-none ring-0 placeholder:text-primary-2 bg-transparent"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-primary-2 font-bold"
                    onClick={handleSendMessage}
                  >
                    <Icon
                      className="rotate-[-36deg] cursor-pointer -mt-1"
                      type="submit"
                      icon="proicons:send"
                      width="35"
                      height="35"
                    />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};