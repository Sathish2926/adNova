import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./messages.css";

const SOCKET_URL = "http://localhost:5000"; 
const socket = io.connect(SOCKET_URL);

// --- Encryption ---
const SimpleCrypto = {
  encrypt: (text, key) => {
    try { return btoa(text.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('')); } 
    catch (e) { return text; }
  },
  decrypt: (encoded, key) => {
    try { return atob(encoded).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join(''); } 
    catch (e) { return "**Error**"; }
  }
};

export default function Messages() {
  const [user, setUser] = useState({ name: "", email: "", isLoggedIn: false });
  const [activeTab, setActiveTab] = useState("chats");
  
  const [contacts, setContacts] = useState([]);
  const [requests, setRequests] = useState([]);

  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const messagesEndRef = useRef(null);

  // --- ROOM ID GENERATOR (Consistency is Key) ---
  const generateRoomId = (email1, email2) => {
    return [email1.toLowerCase(), email2.toLowerCase()].sort().join("_");
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    if (user.isLoggedIn && user.email) {
      const myEmail = user.email.toLowerCase();
      socket.emit("register_user", myEmail);

      // 1. Load Requests
      socket.on("existing_requests", (data) => {
        const mapped = data.map(r => ({
          id: r._id, name: r.senderName, email: r.senderEmail, time: r.timestamp
        }));
        setRequests(mapped); // Replace list to prevent duplicates
      });

      // 2. Load Conversations (Contacts)
      socket.on("existing_conversations", (data) => {
        const mapped = data.map(c => ({
          ...c, role: "connected"
        }));
        setContacts(mapped);
      });

      // 3. New Request Received
      socket.on("receive_request", (data) => {
        setRequests(prev => {
          if (prev.some(r => r.email === data.email)) return prev;
          return [{...data, id: data._id || data.id}, ...prev];
        });
      });

      // 4. Request Accepted (I sent invite -> They accepted)
      socket.on("request_accepted", (data) => {
         updateContactToConnected(data);
      });

      // 5. Request Accepted Confirm (I accepted -> Update my UI)
      socket.on("request_accepted_confirm", (data) => {
         // This is redundant if we did optimistic update, but good for safety
      });

      // 6. Chat History Loaded
      socket.on("chat_history", (history) => {
         if (currentChat) {
             const roomId = generateRoomId(user.email, currentChat.email);
             const cleanHistory = history.map(msg => ({
                 ...msg,
                 message: SimpleCrypto.decrypt(msg.message, roomId)
             }));
             setMessages(cleanHistory);
         }
      });

      // 7. Receive Message (From me OR them)
      socket.on("receive_message", (data) => {
        if (currentChat) {
           const roomId = generateRoomId(user.email, currentChat.email);
           if (data.room === roomId) {
              const text = SimpleCrypto.decrypt(data.message, roomId);
              setMessages(prev => {
                  // Prevent strict duplicates
                  if(prev.length > 0) {
                      const last = prev[prev.length - 1];
                      if(last.time === data.time && last.message === text) return prev;
                  }
                  return [...prev, { ...data, message: text }];
              });
           }
        }
      });
    }

    return () => {
      socket.off("existing_requests");
      socket.off("existing_conversations");
      socket.off("receive_request");
      socket.off("request_accepted");
      socket.off("request_accepted_confirm");
      socket.off("chat_history");
      socket.off("receive_message");
    };
  }, [user.isLoggedIn, user.email, currentChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper to upgrade a contact status
  const updateContactToConnected = (data) => {
     setContacts(prev => {
         const newContact = {
             id: data.conversationId || Date.now(),
             name: data.name,
             email: data.email,
             avatar: data.name[0].toUpperCase(),
             role: "connected",
             lastMessage: "Conversation Started",
             time: "Now"
         };

         // Replace the "pending" entry if it exists
         const isPending = prev.find(c => c.email === data.email);
         if (isPending) {
             return prev.map(c => c.email === data.email ? newContact : c);
         }
         return [newContact, ...prev];
     });

     // IMPORTANT: If I am looking at this chat, update currentChat so the "Pending" banner disappears
     if (currentChat && currentChat.email === data.email) {
         setCurrentChat(prev => ({ ...prev, role: "connected" }));
     }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (user.email) {
      const name = user.email.split("@")[0];
      setUser({ ...user, name, isLoggedIn: true });
    }
  };

  const sendInvite = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      const targetEmail = inviteEmail.toLowerCase();
      // Check if already exists
      if(contacts.some(c => c.email === targetEmail) || requests.some(r => r.email === targetEmail)) {
          alert("Contact already exists or request pending.");
          return;
      }

      socket.emit("send_request", {
        to: targetEmail,
        requestData: { name: user.name, email: user.email, time: "Now" }
      });
      
      const pending = {
          id: "temp_" + Date.now(),
          name: targetEmail.split("@")[0],
          email: targetEmail,
          avatar: "⏳",
          role: "pending",
          lastMessage: "Invite Sent",
          time: "Now"
      };
      setContacts(prev => [pending, ...prev]);
      setCurrentChat(pending);
      setInviteEmail("");
      setShowInviteForm(false);
    }
  };

  const acceptRequest = (req) => {
    // Notify Server
    socket.emit("accept_request", {
        requestId: req.id,
        acceptorName: user.name,
        acceptorEmail: user.email
    });

    // Optimistic: Add to contacts
    const newContact = {
      id: req.id,
      name: req.name,
      email: req.email,
      avatar: req.name[0].toUpperCase(),
      role: "connected",
      lastMessage: "Conversation Started",
      time: "Now"
    };
    setContacts(prev => [newContact, ...prev]);
    
    // Remove from requests
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setActiveTab("chats");
    
    // Open the chat immediately
    joinChat(newContact);
  };

  const joinChat = (contact) => {
    setCurrentChat(contact);
    setMessages([]); 
    // Join room regardless of pending/connected to ensure listeners work for self-messages
    const roomId = generateRoomId(user.email, contact.email);
    socket.emit("join_room", roomId);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentChat && currentChat.role !== 'pending') {
      const roomId = generateRoomId(user.email, currentChat.email);
      const encrypted = SimpleCrypto.encrypt(newMessage, roomId);
      
      const msgData = {
        room: roomId,
        author: user.name,
        message: encrypted,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        participants: [user.email, currentChat.email] 
      };

      await socket.emit("send_message", msgData);
      setNewMessage("");
    }
  };

  if (!user.isLoggedIn) return (
    <div className="messaging-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="login-card">
        <h2>AdNova Login</h2>
        <form onSubmit={handleLogin}>
          <input className="login-input" type="email" placeholder="Enter Email" onChange={e => setUser({...user, email: e.target.value})} required />
          <button className="btn-accept">Login</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        {/* SIDEBAR */}
        <div className="msg-sidebar">
          <div className="msg-header">
            <div className="user-profile">
              <div className="avatar-circle">{user.name[0].toUpperCase()}</div>
              <div className="user-info"><h4>{user.name}</h4><span className="user-email">{user.email}</span></div>
            </div>
          </div>
          <div className="sidebar-tabs">
            <button className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>Chats</button>
            <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Requests ({requests.length})</button>
          </div>
          
          <div className="contact-list">
            {activeTab === 'chats' && contacts.map(c => (
              <div key={c.id} className={`contact-item ${currentChat?.email === c.email ? 'active' : ''}`} onClick={() => joinChat(c)}>
                <div className="avatar-circle">{c.avatar}</div>
                <div className="contact-details">
                  <div className="contact-top"><span className="contact-name">{c.name}</span><span className="contact-time">{c.time}</span></div>
                  <p className="last-message">{c.role === 'pending' ? 'Pending Acceptance...' : c.lastMessage}</p>
                </div>
              </div>
            ))}
            {activeTab === 'requests' && requests.map(r => (
              <div key={r.id} className="request-item">
                <div style={{display:'flex',justifyContent:'space-between'}}><span>{r.name}</span><span>{r.time}</span></div>
                <div style={{fontSize:'0.8rem', color:'#aaa'}}>{r.email}</div>
                <div className="request-actions">
                  <button className="btn-accept" onClick={() => acceptRequest(r)}>Accept</button>
                  <button className="btn-reject" onClick={() => setRequests(prev => prev.filter(x => x.id !== r.id))}>Reject</button>
                </div>
              </div>
            ))}
          </div>

          <div className="invite-section">
            {!showInviteForm ? 
              <button className="invite-btn-main" onClick={() => setShowInviteForm(true)}>+ New Chat</button> :
              <form onSubmit={sendInvite} className="invite-form">
                <input type="email" placeholder="Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} autoFocus />
                <div className="invite-actions">
                  <button type="submit" className="btn-accept">Send</button>
                  <button type="button" className="btn-reject" onClick={() => setShowInviteForm(false)}>Cancel</button>
                </div>
              </form>
            }
          </div>
        </div>

        {/* CHAT */}
        <div className="chat-area">
          {currentChat ? (
            <>
              <div className="chat-header">
                <div className="user-profile">
                  <div className="avatar-circle">{currentChat.avatar}</div>
                  <div><span className="contact-name">{currentChat.name}</span> <span className="chat-role-badge">{currentChat.role === 'pending' ? 'PENDING' : 'CONNECTED'}</span></div>
                </div>
              </div>
              <div className="messages-feed">
                {messages.map((m, i) => (
                  <div key={i} className={`message-wrapper ${m.author === user.name ? 'sent' : 'received'}`}>
                    <div className="message-bubble">{m.message}<div className="msg-time">{m.time}</div></div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {currentChat.role === 'pending' ? 
                <div className="pending-notice">Waiting for acceptance...</div> :
                <form className="chat-input-area" onSubmit={sendMessage}>
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." />
                  <button className="send-btn">➤</button>
                </form>
              }
            </>
          ) : <div className="empty-chat"><h3>Select a chat</h3></div>}
        </div>
      </div>
    </div>
  );
}