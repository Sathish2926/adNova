// ==============================
// FILE: client/src/pages/Messages.jsx
// ==============================
import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { useAuth } from "../contexts/AuthContext"; 
import { useLocation, useNavigate } from "react-router-dom"; 
import Navbar from "../components/navbar"; 
import "./messages.css";
import API_BASE_URL from "../apiConfig"; 

const DEFAULT_PFP = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";

const SimpleCrypto = {
  encrypt: (text, key) => { try { return btoa(text.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('')); } catch (e) { return text; } },
  decrypt: (encoded, key) => { try { return atob(encoded).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join(''); } catch (e) { return "**Error**"; } }
};

export default function Messages() {
  const { name = "User", email = "", isLoggedIn, userId, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const socketRef = useRef();
  const activeChatRef = useRef(null);

  const [activeTab, setActiveTab] = useState("chats");
  const [contacts, setContacts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [myImage, setMyImage] = useState(null);
  const messagesEndRef = useRef(null);

  const generateRoomId = (email1, email2) => [email1.toLowerCase(), email2.toLowerCase()].sort().join("_");

  const getImgUrl = (path) => {
      if (!path || path === "") return DEFAULT_PFP;
      if (path.startsWith('http')) return path;
      return `${API_BASE_URL}${path}`;
  };

  const handleImgError = (e) => {
      e.target.onerror = null;
      e.target.src = DEFAULT_PFP;
  };

  useEffect(() => {
    activeChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(() => {
      if(userId) {
          fetch(`${API_BASE_URL}/api/auth/profile/${userId}`)
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    const img = role === 'business' ? data.user.businessProfile?.logoUrl : data.user.influencerProfile?.pfp;
                    setMyImage(img);
                }
            }).catch(console.error);
      }
  }, [userId, role]);

  const updateContactToConnected = useCallback((data) => {
     setContacts(prev => {
         const newContact = {
             id: data.conversationId || Date.now(), 
             name: data.name, 
             email: data.email,
             image: data.image, 
             role: "connected", 
             lastMessage: "Conversation Started", 
             time: "Now"
         };
         const filtered = prev.filter(c => c.email !== data.email);
         return [newContact, ...filtered];
     });
     
     if (activeChatRef.current && activeChatRef.current.email === data.email) {
         setCurrentChat(prev => ({ ...prev, role: "connected" }));
     }
  }, []);

  useEffect(() => {
    if (location.state && location.state.initiateChat) {
        const targetEmail = location.state.initiateChat.toLowerCase();
        
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
            navigate(location.pathname, { replace: true, state: {} });
        } else if (contacts.length === 0) {
             setInviteEmail(targetEmail);
             setShowInviteForm(true);
        }
    }
  }, [location, contacts, navigate]);

  useEffect(() => {
    if (isLoggedIn && email) {
      socketRef.current = io.connect(API_BASE_URL);
      const socket = socketRef.current;

      const myEmail = email.toLowerCase();
      const register = () => socket.emit("register_user", myEmail);
      register();

      socket.on("connect", register);

      socket.on("existing_requests", (data) => setRequests(data.map(r => ({ id: r._id, name: r.senderName, email: r.senderEmail, time: r.timestamp }))));
      
      socket.on("existing_conversations", (data) => setContacts(data.map(c => ({ ...c, role: "connected" }))));
      
      socket.on("receive_request", (data) => setRequests(prev => {
          if (prev.some(r => r.email === data.email)) return prev;
          return [{...data, id: data._id || data.id}, ...prev];
      }));

      socket.on("request_accepted", (data) => updateContactToConnected(data));
      
      socket.on("chat_history", (history) => {
         const activeChat = activeChatRef.current;
         if (activeChat) {
             const roomId = generateRoomId(email, activeChat.email);
             setMessages(history.map(msg => ({ ...msg, message: SimpleCrypto.decrypt(msg.message, roomId) })));
         }
      });

      socket.on("receive_message", (data) => {
        const activeChat = activeChatRef.current;
        if (activeChat) {
           const roomId = generateRoomId(email, activeChat.email);
           
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

      return () => {
          socket.disconnect();
      };
    }
  }, [isLoggedIn, email, updateContactToConnected]); 

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendInvite = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      const targetEmail = inviteEmail.toLowerCase();
      if(targetEmail === email.toLowerCase()) return;
      if(contacts.some(c => c.email === targetEmail) || requests.some(r => r.email === targetEmail)) return;
      
      socketRef.current.emit("send_request", { to: targetEmail, requestData: { name: name, email: email, time: "Now" } });
      const pending = { id: "temp_" + Date.now(), name: targetEmail.split("@")[0], email: targetEmail, image: "", role: "pending", lastMessage: "Invite Sent", time: "Now" };
      setContacts(prev => [pending, ...prev]);
      setCurrentChat(pending);
      setInviteEmail("");
      setShowInviteForm(false);
    }
  };

  const acceptRequest = (req) => {
    socketRef.current.emit("accept_request", { requestId: req.id, acceptorName: name, acceptorEmail: email });
    const newContact = { 
        id: req.id, name: req.name, email: req.email, image: "", 
        role: "connected", lastMessage: "Conversation Started", time: "Now" 
    };
    setContacts(prev => [newContact, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setActiveTab("chats");
    joinChat(newContact);
  };

  const joinChat = (contact) => {
    setCurrentChat(contact);
    setMessages([]); 
    
    if(socketRef.current) {
        const roomId = generateRoomId(email, contact.email);
        socketRef.current.emit("join_room", roomId);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentChat && currentChat.role !== 'pending') {
      const roomId = generateRoomId(email, currentChat.email);
      const encrypted = SimpleCrypto.encrypt(newMessage, roomId);
      
      const payload = { 
          room: roomId, 
          author: name, 
          message: encrypted, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          participants: [email, currentChat.email] 
      };

      await socketRef.current.emit("send_message", payload);
      setNewMessage("");
    }
  };

  if (!isLoggedIn) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}><h2>Please log in.</h2></div>;

  const safeName = name || "User";

  return (
    <>
    <Navbar />
    <div className="messaging-page">
      <div className="messaging-container">
        
        <div className="msg-sidebar">
          <div className="msg-header">
            <div className="user-profile">
               <img 
                    src={getImgUrl(myImage)} 
                    alt="Me" 
                    className="avatar-img" 
                    onError={handleImgError}
                    style={{border:'2px solid var(--accent)'}} 
                />
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
                <img src={getImgUrl(c.image)} alt={c.name} className="avatar-img" onError={handleImgError} />
                <div className="contact-details">
                  <div className="contact-top">
                      <span className="contact-name">{c.name || c.email}</span>
                      {/* REMOVED TIME SPAN HERE */}
                  </div>
                  <p className="last-message">{c.role === 'pending' ? 'Pending Acceptance...' : c.lastMessage}</p>
                </div>
              </div>
            ))}
            {activeTab === 'requests' && requests.map(r => (
              <div key={r.id} className="request-item">
                <div style={{display:'flex',justifyContent:'space-between'}}><span>{r.name || r.email}</span><span>{r.time}</span></div>
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
                  <button type="submit" className="btn-accept">SEND</button>
                  <button type="button" className="btn-reject" onClick={() => setShowInviteForm(false)}>CANCEL</button>
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
                  <img src={getImgUrl(currentChat.image)} alt={currentChat.name} className="avatar-img" onError={handleImgError} />
                  <div>
                      <span className="contact-name">{currentChat.name || currentChat.email}</span> 
                      <span className="chat-role-badge">
                          {currentChat.role === 'pending' ? 'PENDING' : 'CONNECTED'}
                      </span>
                  </div>
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