import React, { useEffect, useState } from "react";

const Chat = ({ socket, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        message: currentMessage,
        sender: "user", // Adding sender property for messages sent by the user
      };
      
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, { ...data, sender: "other" }]); // Adding sender property for received messages
    });
  }, [socket]);

  return (
    <>
      <div className="charHeader bg-blue-500 py-4">
        <p className="text-white text-center">Live Chat</p>
      </div>
      <div className="chatBody p-4">
        {messageList.map((messageContent, index) => (
          <div
            key={index}
            className={
              messageContent.sender === "user" ? "mb-4 text-right" : "mb-4"
            } // Aligning user messages to the right
          >
            <p
              className={
                messageContent.sender === "user"
                  ? "bg-blue-500 text-white px-4 py-2 rounded-lg inline-block"
                  : "bg-green-500 px-4 py-2 rounded-lg inline-block"
              }
            >
              {messageContent.message}
            </p>
          </div>
        ))}
      </div>
      <div className="chatFooter p-4">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-blue-500"
          onChange={(event) => setCurrentMessage(event.target.value)}
        />
        <button
          className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </>
  );
};

export default Chat;
