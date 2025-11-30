import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Connect to backend
const socket = io.connect("http://localhost:5000");

function Chat({ username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
    }
  };

  // Join the room automatically on load
  useEffect(() => {
    joinRoom();
  }, [room]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    // Listen for incoming messages
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    // Cleanup listener to prevent duplicates
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto border border-gray-300 rounded-lg shadow-lg bg-white">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-bold">Live Chat</h3>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messageList.map((messageContent, index) => {
          const isMyMessage = username === messageContent.author;
          return (
            <div
              key={index}
              className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  isMyMessage
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{messageContent.message}</p>
                <div className="flex justify-between items-center mt-1 space-x-2">
                  <span className={`text-xs ${isMyMessage ? "text-blue-100" : "text-gray-500"}`}>
                    {messageContent.time}
                  </span>
                  <span className={`text-xs font-bold ${isMyMessage ? "text-blue-100" : "text-gray-600"}`}>
                    {messageContent.author}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Footer */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={currentMessage}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(event) => setCurrentMessage(event.target.value)}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            &#9658;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;