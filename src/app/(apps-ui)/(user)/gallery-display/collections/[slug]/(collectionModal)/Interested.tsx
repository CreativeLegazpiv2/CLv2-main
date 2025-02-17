import { getSession } from "@/services/authservice";
import { supabase } from "@/services/supabaseClient";
import { Icon } from "@iconify/react/dist/iconify.js";
import { motion } from "framer-motion";
import { jwtVerify } from "jose";
import { ArrowLeft, Loader, Search, SendHorizontal, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import Lottie from "lottie-react";
import animationData from "../../../../../../../../public/lottie/message.json";
import { useRouter } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret";

interface FormData {
  childid: string;
  created_at: Date;
  title: string;
  desc: string;
  year: number;
  artist: string;
  image: File | null; // Keep image property as File
}

interface EditCollectionProps {
  childid: string;
  created_at: Date;
  image: string | null;
  title: string;
  desc: string;
  year: number;
  artist: string;
  onCancel: () => void;
  chat: boolean;
}

interface Message {
  id: number;
  sessionid: number;
  message: string;
  sender: string;
  created_at: string;
  image_path: string;
}

interface Session {
  id: string; // ID of the session
  a: string; // Sender A
  b: string; // Sender B
  // Add other session fields as needed
  created_at: string;
  userDetails: userDetails;
}

interface userDetails {
  detailsid: number;
  first_name: string;
  creative_field?: string;
  role?: string;
  profile_pic?: string;
}

interface getUsers {
  detailsid: string;
  first_name: string;
  creative_field?: string;
  role?: string;
  profile_pic?: string;
}

export const Interested = ({
  childid,
  created_at,
  image,
  title,
  desc,
  year,
  artist,
  onCancel,
  chat,
}: EditCollectionProps) => {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(image);
  const [formData, setFormData] = useState<FormData>({
    childid,
    created_at,
    title,
    desc,
    year,
    artist,
    image: null, // Initialize image as null
  });

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [autoSendTriggered, setAutoSendTriggered] = useState<boolean>(false); // Flag to track auto-send
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [selectedId, setselectedId] = useState<string | null>(null);
  const [gettokenId, settokenId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<userDetails[]>([]);
  const [isRightColumnVisible, setIsRightColumnVisible] = useState(false);
  const [isChat, setChat] = useState<boolean>(false);
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);

  const [getUsers, setUsers] = useState<getUsers[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMsgLoading, setMsgLoading] = useState<boolean>(false);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);  // Loading state for sending message
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const suggestionsList = [
    'audiovisual-media',
    'digital-interactive-media',
    'creative-services',
    'design',
    'publishing-and-printing-media',
    'performing-arts',
    'visual-arts',
    'traditional-and-cultural-expressions',
    'cultural-sites'
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "auto",
      });
    }
  };

  useEffect(() => {
    if (!isMsgLoading && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isMsgLoading, isRightColumnVisible]);

  const fetchusersData = async () => {
    const token = getSession();
    if (!token) return;

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      const userIdFromToken = payload.id as string;

      const response = await fetch("/api/chat/new-msg", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          tokenid: userIdFromToken, // Pass sender_a in headers
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      console.log("Fetched sessions:", data);

      if (data && data.length > 0) {
        setUsers(data);
      } else {
        console.log("No user found.");
      }
    } catch (error) {
      console.log("Error fetching session data:", error);
    }
  };

  useEffect(() => {
    fetchusersData();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;

    const subscription = supabase
      .channel("getMsg")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "allmessage",
        },
        (payload: any) => {
          if (payload.new.sessionid === selectedSessionId) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedSessionId]); // Depend on selectedSessionId


  useEffect(() => {
    getSessionToken();
    fetchSessionData();
  }, []);

  useEffect(() => {
    if (!chat) {
      setChat(false);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsRightColumnVisible(true);
      }, 1500)

    } else {
      setChat(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsRightColumnVisible(false);
      }, 1500)
    }
  }, []);

  const getSessionToken = async () => {
    const token = getSession();
    if (!token) return;
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    const userIdFromToken = payload.id as string;
    settokenId(userIdFromToken);
  };

  const fetchSessionData = async () => {
    console.log("Fetching recent messages...");
    setIsLoading(true); // 🌟 Set loading before fetching
  
    const token = getSession();
    if (!token) return;
  
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      const userIdFromToken = payload.id as string;
  
      const response = await fetch(`/api/chat/msg-recent/${userIdFromToken}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        console.log(`Failed to fetch sessions: ${response.statusText}`);
        return;
      }
  
      const data = await response.json();
  
      // 🌟 Delay updating state for at least 2 seconds to avoid flicker
      setTimeout(() => {
        setSessions(Array.isArray(data) ? data : []);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.log("Error fetching session data:", error);
      setTimeout(() => setIsLoading(false), 2000); // 🌟 Prevent immediate empty state
    }
  };
  

  useEffect(() => {
    setPreviewImage(image);
  }, [image, title, desc, year]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const debouncedAutoSend = debounce(async () => {
    await autoSend();
  }, 1000);

  useEffect(() => {
    let isAutoSendCalled = false;

    const checkAndAutoSend = async () => {
      const token = getSession();
      if (!token || autoSendTriggered || chat || isAutoSendCalled) {
        console.log(
          "Early return: token, autoSendTriggered, or chat condition met"
        );
        return;
      }

      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(JWT_SECRET)
        );
        const userIdFromToken = payload.id as string;

        const response = await fetch("/api/chat/msg-session", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            sender_a: userIdFromToken,
            sender_b: formData.childid,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();

        // const imageExists = sessions.some((session: any) =>
        //   session.messages.some((msg: any) => msg.image_path === previewImage)
        // );

        console.log("Auto-send triggered");
        debouncedAutoSend();
        setAutoSendTriggered(true);
        isAutoSendCalled = true;
        fetchSessionData();
      } catch (error: any) {
        console.log("Error checking and auto-sending message:", error.message);
      }
    };

    checkAndAutoSend();
  }, [autoSendTriggered, chat, formData.childid, previewImage]);



  const fetchMessages = async () => {
    const token = getSession();
    if (!token) return;
    if (!isChat) {
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(JWT_SECRET)
        );
        const userIdFromToken = payload.id as string;
        const childid = formData.childid as string;

        const response = await fetch("/api/chat/msg-session1", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            sender_a: userIdFromToken, // Use the user ID from the token
            sender_b: childid, // Use the child ID from formData
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        if (data && data.sessions && data.sessions.length > 0) {
          // Instead of using flatMap, just use the data directly
          setMessages(data.sessions); // This assumes 'sessions' contains all the message data you need
  
          
          setMsgLoading(false);

        } else {
          setMsgLoading(false);
        }
      } catch (error: any) {
        console.log("Error fetching messages:", error.message);
      }
    } else {
      try {
        console.log ("selectedSessionId:", selectedSessionId);
        const response = await fetch("/api/chat/all-msg-session", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            sender_a: selectedSessionId as string, // Use the user ID from the token
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        if (data && data.length > 0) {
          console.log("Sessions:", data.sessions);
          setMessages(data.message);
          console.log("message:", data.message);
          setMsgLoading(false);
        } else {
          console.log("message:", data.message);
          setMsgLoading(false);
        }
      } catch (error: any) {
        console.log("Error fetching messages:", error.message);
      }
    }
  };

  const autoSend = async () => {
    const token = getSession();
    if (!token) return;

    try {
      // Verify the JWT token to get the sender's user ID
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      const userIdFromToken = payload.id as string;

      // Send the chat message
      const response = await fetch("/api/chat/msg-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_a: userIdFromToken, // Sender's ID
          sender_b: formData.childid, // Recipient's ID
          image_path: previewImage,
          message: `Hello, I'm interested in this item!. Entitled: ${formData.title}`, // Default message
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      console.log("Message sent successfully", data);

      // Extract session ID and other details from the response
      const sessionId = data.sessionId; // Assuming the API returns the session ID
      const senderA = userIdFromToken;
      const senderB = formData.childid;

      // Trigger handleClick to open the chat session
      handleClick(sessionId, senderA, senderB);

      setMessage(""); // Clear the message input
      fetchMessages(); // Fetch messages again to update the chat
    } catch (error: any) {
      console.error("Error sending message:", error.message);
    }
  };

  const handleSendMessage = async () => {
    if (isSending) return; // Prevent multiple sends if already sending
    const token = getSession();
    if (!token) return;
  
    if (!message.trim()) return; // Prevent sending empty messages
  
    setIsSending(true); // Set loading to true before sending
  
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const userIdFromToken = payload.id as string;
  
      const requestBody = {
        sender_a: userIdFromToken,
        sender_b: isChat ? selectedId : formData.childid, // Determine recipient ID
        message,
      };
  
      const response = await fetch("/api/chat/msg-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
  
      const data = await response.json();
      console.log("Message sent successfully", data);
      setMessage(""); // Clear the message input
  
      // After sending, re-check if a session exists and update chat view
      setTimeout(() => handleClickNewChat(requestBody.sender_b as string), 500);
    } catch (error: any) {
      console.log("Error sending message:", error.message);
    } finally {
      setIsSending(false); // Reset loading state after sending
    }
  };
  



  const handleBackToSessions = () => {
    setChat(true);
    setSelectedSessionId(null);
    setIsRightColumnVisible(false);
    setMessages([]);
    setselectedId(null);
    setUserDetails([]); // 🌟 Reset user details to prevent showing old user
    setMessage("");
  
    setIsLoading(true);  // Start loading
  
    // Simulate a 1.5-second loading delay
    setTimeout(() => {
      setIsLoading(false);  // Stop loading after 1.5 seconds
      fetchSessionData();
    }, 1500);
  };
  

  const closeSearch = () => {
    setSearchQuery('')
    setShowModal(false)
  }


  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  useEffect(() => {
    const fetchRecentChats = async () => {
      const token = getSession();
      if (!token) return;

      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(JWT_SECRET)
        );
        const userIdFromToken = payload.id as string;

        const response = await fetch(`/api/chat/recent-chats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "user-id": userIdFromToken,
          },
        });

        // if (!response.ok) {
        //   throw new Error("Failed to fetch recent chats");
        // }

        const data = await response.json();
        setRecentChats(data.recentChats);
      } catch (error: any) {
        throw error;
      }
    };

    fetchRecentChats();
  }, []);


  const filteredUsers = getUsers.filter((user) =>
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.creative_field ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleClick = async (id: string, getA: string, getB: string) => {
    setMsgLoading(true);
    const token = getSession();
    if (!token) return;

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      const userIdFromToken = payload.id as string;

      const selectedUserId = getA === userIdFromToken ? getB : getA;
      setselectedId(selectedUserId);
      setSelectedSessionId(id);
      setIsRightColumnVisible(true);

      // Fetch user details
      const { data, error } = await supabase
        .from("userDetails")
        .select("detailsid, first_name, profile_pic, creative_field")
        .eq("detailsid", selectedUserId)
        .single();

      if (error) throw error;
      setUserDetails([data]); // Store the fetched user details

    } catch (error: any) {
      console.error("Error fetching user details:", error.message);
    } finally {
      setMsgLoading(false);
    }

    // Fetch messages only if they exist
    try {
      const response = await fetch("/api/chat/all-msg-session", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          sender_a: id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      if (data.message.length > 0) {
        setMessages(data.message);
      } else {
        setMessages([]); // No messages yet, do not store session
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error.message);
    }
  };

  const handleClickNewChat = async (id: string) => {
    setMsgLoading(true)
    console.log('clicked id:', id)
    const token = getSession()

    if (!token) {
      console.log('No session token found')
      return
    }

    setIsRightColumnVisible(true)

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      const userIdFromToken = payload.id as string

      // Fetch user details & check for existing chat session
      const response = await fetch(`/api/chat/senderMessage`, {
        method: 'GET',
        headers: {
          userIdFromToken: userIdFromToken,
          id: id,
        },
      })

      // Ensure response is JSON before parsing
      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (error) {
        console.error('Invalid JSON response:', text)
        throw new Error('Invalid response from server')
      }

      if (data.sessionId) {
        setselectedId(id)
        setSelectedSessionId(data.sessionId) // Set session ID if found
        console.log('Found existing session:', data.sessionId)
        await handleClick(data.sessionId, userIdFromToken, id)
 
      } else {
        const noId = ""
        setselectedId(id)
        setSelectedSessionId('')
        await handleClick(id, userIdFromToken, id)
        console.log('No session found, starting new chat')
      }
    } catch (error: any) {
      console.log('Error preparing new chat:', error.message)
    } finally {
      setMsgLoading(false)
    }
  }



  return (
    <div className="poppins fixed bottom-1.5 right-2 z-[900] w-full md:max-w-sm md:min-w-[24rem] max-w-[95%] h-[70vh] overflow-hidden flex flex-col rounded-xl shadow-customShadow3 bg-gray-200">
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 p-1 bg-gray-200 rounded-lg cursor-pointer"
      >
        <X size={20} />
      </button>
      <div className="bg-primary-2 p-2.5">
        <div className="text-xl text-gray-200 font-extrabold min-h-10">
          {/* Conditional rendering based on selected session */}
          {!selectedSessionId ? (
            // No session clicked yet, show "Chat" placeholder
            <p>Chat</p>
          ) : (
            // Session is selected, show the user details
            userDetails.length > 0 && (
              <div>
                <div className="flex items-center">
                  <img
                    onClick={() => router.push(`/gallery-display/collections/${userDetails[0].detailsid}`)}
                    src={userDetails[0].profile_pic || "/images/creative-directory/profile.jpg"}
                    alt={userDetails[0].first_name}
                    className="w-10 h-10 rounded-full mr-2 object-cover cursor-pointer"
                  />

                  <div className="flex flex-col">
                    <p className="text-gray-200 text-sm font-semibold line-clamp-1">
                      {userDetails[0].first_name}
                    </p>
                    <p className="text-gray-200 text-xs font-normal">
                      {userDetails[0].creative_field
                        ? userDetails[0].creative_field.replace(/-/g, ' ')
                        : "Buyer"}
                    </p>

                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="w-full h-full rounded-lg overflow-hidden custom-scrollbar">
        <div className="w-full h-full flex flex-col">
          {!isRightColumnVisible && (
            // Search user section
            <div className="bg-white w-full h-full z-[900] flex flex-col">
              <div className="h-fit w-full p-2 relative group">
                <Search className="absolute top-1/2 left-4 transform -translate-y-1/2 text-primary-3/30 group-focus-within:text-primary-3" />

                <input
                  type="text"
                  list="suggestions"
                  className="border border-primary-3/30 pl-10 pr-4 py-2 rounded-full w-full outline-none focus:ring-primary-3 focus:ring-1 peer appearance-none"
                  placeholder="Search creative username or field"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (e.target.value) {
                      const filteredSuggestions = suggestionsList.filter((suggestion) =>
                        suggestion.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                      setFilteredSuggestions(filteredSuggestions)
                      setShowModal(true)
                    } else {
                      setShowModal(false)
                      setFilteredSuggestions([])
                    }
                  }}

                />

                {/* Datalist provides native suggestions */}
                <datalist id="suggestions">
                  <option value="audiovisual-media" />
                  <option value="digital-interactive-media" />
                  <option value="creative-services" />
                  <option value="design" />
                  <option value="publishing-and-printing-media" />
                  <option value="performing-arts" />
                  <option value="visual-arts" />
                  <option value="traditional-and-cultural-expressions" />
                  <option value="cultural-sites" />
                </datalist>

                {/* Close Button */}
                {searchQuery && (
                  <button
                    onClick={closeSearch}
                    className="absolute top-1/2 right-6 transform -translate-y-1/2 text-primary-3/50 hover:text-primary-3 focus:outline-none"
                  >
                    ✕
                  </button>
                )}
              </div>


              {/* Modal for searched users */}
              {showModal && filteredSuggestions.length > 0 && (
                <div className="w-full h-full ">
                  <div className="bg-white p-2 shadow-lg w-full h-full max-h-56 flex flex-col overflow-y-auto">
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute top-2 right-2 p-1 bg-gray-200 rounded-lg cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="font-bold pb-2 text-black/50 text-sm">
                      Search Results
                    </h3>
                    <ul className="space-y-2 w-full h-fit ">
                      {filteredUsers.map((user) => (
                        <li
                          key={user.detailsid}
                          onClick={() => {
                            handleClickNewChat(user.detailsid); // Handle new chat creation
                            setShowModal(false);
                          }}
                          className="flex flex-row capitalize bg-black/10 rounded-md p-2 gap-4 cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              className="w-full h-full object-cover"
                              src={
                                user.profile_pic || "/images/creative-directory/profile.jpg"
                              }
                              alt="Profile Picture"
                              width={48}
                              height={48}
                            />
                          </div>
                          <div className="flex flex-col">
                            <strong className="text-sm"><p className="line-clamp-1">{user.first_name}</p></strong>
                            {user.role === "buyer" ? (
                              <span className="text-xs text-black/50">
                                {user.role}
                              </span>
                            ) : (
                              <div className="text-xs text-black/50">
                                {user.creative_field
                                  ? user.creative_field.replace(/-/g, ' ')
                                  : ''}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="w-full h-full overflow-y-auto relative flex flex-col border border-black/10">
                <h3 className="h-fit text-sm text-black/50 font-bold px-4 p-2">
                  Recent Messages
                </h3>
                <div className="space-y-4 h-full flex flex-col gap-2 overflow-hidden">
                  {isLoading ? (
                    <div className="w-full h-full flex justify-center items-center">
                      <Loader size={55} className="animate-spin" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="w-full h-full flex flex-col justify-center items-center">
                      <p>No Recent Messages yet</p>
                      <p className="text-sm text-palette-7/50">Try to search for a user or creative field</p>
                    </div>
                  ) : (
                    <ul className="space-y-2 overflow-y-auto p-2 flex flex-col h-full">
                      {sessions
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())  // Sort descending
                        .map((session) => (
                          <li
                            key={session.id}
                            onClick={() => handleClick(session.id, session.a, session.b)}
                            className={`${selectedSessionId === session.id ? "bg-gray-400" : ""}`}
                          >
                            <div className="flex flex-row capitalize bg-black/10 rounded-md p-2 gap-4 cursor-pointer">
                              <div className="w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                  className="w-full h-full object-cover"
                                  src={session.userDetails.profile_pic || "/images/creative-directory/profile.jpg"}
                                  alt={session.userDetails.first_name}
                                  width={48}
                                  height={48}
                                />
                              </div>
                              <div className="flex flex-col">
                                <strong className="text-sm">
                                  <p className="line-clamp-1">{session.userDetails.first_name}</p>
                                </strong>
                                {session.userDetails.role === "buyer" ? (
                                  <span className="text-xs text-black/50">
                                    {session.userDetails.role}
                                  </span>
                                ) : (
                                  <div className="text-xs text-black/50">
                                    {session.userDetails.creative_field
                                      ? session.userDetails.creative_field.replace(/-/g, ' ')
                                      : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>

                  )}
                </div>
              </div>
            </div>
          )}

          {isRightColumnVisible && (
            <div className="flex flex-col h-full w-full bg-white z-[900]">
              <button
                onClick={handleBackToSessions}
                className="absolute top-2 right-2 p-1 bg-gray-200 rounded-lg cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="h-full flex flex-col gap-4 w-full">
                <div
                  ref={containerRef} // Attach ref only to the scrolling container
                  className="h-full overflow-y-auto p-4 w-full scroll-none"
                >
                  {messages.length === 0 ? (
                    <div className="w-full h-full flex justify-center items-center">
                      <div className="w-full h-full flex justify-center items-center">
                        <Lottie
                          animationData={animationData}
                          loop={true}
                          className="w-80 h-80 md:w-96 md:h-96" // Adjust size as needed
                        />
                        <p className="text-sm text-black/50">
                          Start a conversation with your favorite artist
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const createdAt = new Date(msg.created_at);
                      const formattedDate = createdAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      const formattedTime = createdAt.toLocaleString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });

                      return (
                        <div
                          key={msg.id} // Use unique key for each message
                          className={`p-2 flex flex-col w-full ${msg.sender === gettokenId
                            ? "items-end"
                            : "items-start"
                            }`}
                        >
                          <div
                            className={`mb-2 p-4 min-w-14 rounded-t-3xl flex flex-col gap-2 max-w-[80%] ${msg.sender === gettokenId
                              ? "bg-[skyblue] rounded-bl-3xl"
                              : "bg-black/10 rounded-br-3xl"
                              }`}
                          >
                            <p className="text-sm">{msg.message}</p>

                            {msg.image_path && (
                              <div className="w-full">
                                <Image
                                  src={msg.image_path || "/images/creative-directory/profile.jpg"}
                                  alt="Message Image"
                                  width={300}
                                  height={200}
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-[10px] ${msg.sender === gettokenId
                                ? "text-black/80"
                                : "text-black/70"
                                }`}
                            >
                              {formattedDate}, {formattedTime}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {isRightColumnVisible && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="h-fit flex gap-2 bg-primary-2 p-4"
                  >
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}

                      placeholder="Send a message..."
                      className="w-full py-2 border border-gray-300 rounded-full px-4"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !message.trim()}
                      className={`px-2 rounded-md cursor-pointer  ${isSending ? 'text-gray-400 cursor-not-allowed' : 'text-white'
                        }`}
                    >
                      <SendHorizontal size={24} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
