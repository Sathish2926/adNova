import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../contexts/AuthContext"; 
import { useLocation, useNavigate } from "react-router-dom"; 
import Navbar from "../components/navbar"; 
import "./messages.css";

const SOCKET_URL = "http://localhost:5000";
const socket = io.connect(SOCKET_URL);

const SimpleCrypto = {
  encrypt: (text, key) => { try { return btoa(text.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('')); } catch (e) { return text; } },
  decrypt: (encoded, key) => { try { return atob(encoded).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join(''); } catch (e) { return "**Error**"; } }
};

export default function Messages() {
  const { name = "User", email = "", isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Added navigate hook

  const [activeTab, setActiveTab] = useState("chats");
  const [contacts, setContacts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const messagesEndRef = useRef(null);

  const generateRoomId = (email1, email2) => [email1.toLowerCase(), email2.toLowerCase()].sort().join("_");

  // --- 1. HANDLE "INITIATE CHAT" (FIXED) ---
  useEffect(() => {
    if (location.state && location.state.initiateChat) {
        const targetEmail = location.state.initiateChat.toLowerCase();
        
        // Wait for contacts to load before making a decision
        if (contacts.length > 0) {
            const existingContact = contacts.find(c => c.email.toLowerCase() === targetEmail);

            if (existingContact) {
                setCurrentChat(existingContact);
                setActiveTab("chats");
                setShowInviteForm(false);
            } else {
                setInviteEmail(targetEmail);
                setShowInviteForm(true);
            }
            // SAFETY FIX: Use navigate to clear state instead of window.history
            navigate(location.pathname, { replace: true, state: {} });
        } else if (contacts.length === 0) {
             // Fallback if no contacts yet
             setInviteEmail(targetEmail);
             setShowInviteForm(true);
             // Don't clear state yet, wait for contacts to potentially load
        }
    }
  }, [location, contacts, navigate]); 

  // --- 2. SOCKET SETUP ---
  useEffect(() => {
    if (isLoggedIn && email) {
      const myEmail = email.toLowerCase();
      socket.emit("register_user", myEmail);

      socket.on("existing_requests", (data) => setRequests(data.map(r => ({ id: r._id, name: r.senderName, email: r.senderEmail, time: r.timestamp }))));
      socket.on("existing_conversations", (data) => setContacts(data.map(c => ({ ...c, role: "connected" }))));
      
      socket.on("receive_request", (data) => setRequests(prev => {
          if (prev.some(r => r.email === data.email)) return prev;
          return [{...data, id: data._id || data.id}, ...prev];
      }));

      socket.on("request_accepted", (data) => updateContactToConnected(data));
      
      socket.on("chat_history", (history) => {
         if (currentChat) {
             const roomId = generateRoomId(email, currentChat.email);
             setMessages(history.map(msg => ({ ...msg, message: SimpleCrypto.decrypt(msg.message, roomId) })));
         }
      });

      socket.on("receive_message", (data) => {
        if (currentChat) {
           const roomId = generateRoomId(email, currentChat.email);
           if (data.room === roomId) {
              const text = SimpleCrypto.decrypt(data.message, roomId);
              setMessages(prev => {
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
      socket.off("chat_history");
      socket.off("receive_message");
    };
  }, [isLoggedIn, email, currentChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const updateContactToConnected = (data) => {
     setContacts(prev => {
         const newContact = {
             id: data.conversationId || Date.now(), name: data.name, email: data.email,
             avatar: (data.name && data.name[0]) ? data.name[0].toUpperCase() : "?",
             role: "connected", lastMessage: "Conversation Started", time: "Now"
         };
         const filtered = prev.filter(c => c.email !== data.email);
         return [newContact, ...filtered];
     });
     if (currentChat && currentChat.email === data.email) {
         setCurrentChat(prev => ({ ...prev, role: "connected" }));
     }
  };

  const sendInvite = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      const targetEmail = inviteEmail.toLowerCase();
      if(targetEmail === email.toLowerCase()) { alert("Cannot message yourself."); return; } 
      if(contacts.some(c => c.email === targetEmail) || requests.some(r => r.email === targetEmail)) { 
          alert("Contact exists or request pending."); 
          return; 
      }
      socket.emit("send_request", { to: targetEmail, requestData: { name: name, email: email, time: "Now" } });
      const pending = { id: "temp_" + Date.now(), name: targetEmail.split("@")[0], email: targetEmail, avatar: "⏳", role: "pending", lastMessage: "Invite Sent", time: "Now" };
      setContacts(prev => [pending, ...prev]);
      setCurrentChat(pending);
      setInviteEmail("");
      setShowInviteForm(false);
    }
  };

  const acceptRequest = (req) => {
    socket.emit("accept_request", { requestId: req.id, acceptorName: name, acceptorEmail: email });
    const newContact = { id: req.id, name: req.name, email: req.email, avatar: (req.name && req.name[0]) ? req.name[0].toUpperCase() : "?", role: "connected", lastMessage: "Conversation Started", time: "Now" };
    setContacts(prev => [newContact, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setActiveTab("chats");
    joinChat(newContact);
  };

  const joinChat = (contact) => {
    setCurrentChat(contact);
    setMessages([]); 
    socket.emit("join_room", generateRoomId(email, contact.email));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentChat && currentChat.role !== 'pending') {
      const roomId = generateRoomId(email, currentChat.email);
      const encrypted = SimpleCrypto.encrypt(newMessage, roomId);
      await socket.emit("send_message", { room: roomId, author: name, message: encrypted, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), participants: [email, currentChat.email] });
      setNewMessage("");
    }
  };

  if (!isLoggedIn) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}><h2>Please log in.</h2></div>;

  const safeName = name || "User";
  const safeAvatar = safeName[0] ? safeName[0].toUpperCase() : "?";

  return (
    <>
    <Navbar />
    <div className="messaging-page">
      <div className="messaging-container">
        <div className="msg-sidebar">
          <div className="msg-header">
            <div className="user-profile">
              <div className="avatar-circle">{safeAvatar}</div>
              <div className="user-info"><h4>{safeName}</h4><span className="user-email">{email}</span></div>
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
            {!showInviteForm ? <button className="invite-btn-main" onClick={() => setShowInviteForm(true)}>+ New Chat</button> :
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
                  <div key={i} className={`message-wrapper ${m.author === name ? 'sent' : 'received'}`}>
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
    </>
  );
}