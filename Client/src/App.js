import "./App.css";
import io from "socket.io-client";
import React, { useState, useEffect } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

const socket = io.connect("http://localhost:3001");

function App() {
  //App variables
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    const data = {
      username: username,
      room: room
    };
    if (username !== "" && room !== "") {
      socket.emit("join_room", data);
      setShowChat(true);
    }
  };

  const leaveRoom = () => {
    const data = {
      username: username,
      room: room
    };
    if (username !== "" && room !== "") {
      socket.emit("leave_room", data);
      setShowChat(false);
      setMessageList([]);
    }
  };

  //Chatroom variables
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [userList, setUserList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        id: socket.id,
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
      };

      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((previousMessage) => [...previousMessage, data]);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("get_users_room", (users) => {
      setUserList(users);
    });
  }, [socket]);
  

  return (
    <div className="App">
      {showChat === false ? (//show if no room
        <div className="joinChatContainer">
          <h3>Join Chat</h3>;
          <input type="text"
            placeholder="Username..."
            onChange={(event) => { setUsername(event.target.value); }} />
          <input type="text"
            placeholder="Room ID..."
            onChange={(event) => { setRoom(event.target.value); }} />
          <button onClick={joinRoom}> Join a Room </button>
        </div>
      ) : (//show if room
        <div className="chat-window">
          <div className="chat-header">
            <button onClick={leaveRoom}>&#9668;</button>
            <p>{room}</p>
          </div>
          <div className="users-window">
            <p>Users Online:</p>
            {userList.map((names) => {
              return(<p>{names.username}</p>)
            })}
          </div>
          <div className="chat-body">
            
            <ScrollToBottom className="message-container">
              {messageList.map((messageContent) => {
                return (
                  <div className="message"
                    id={username === messageContent.author ? "you" : "other"}>
                    <div>
                      <div className="message-content">
                        <p>{messageContent.message}</p>
                      </div>
                      <div className="message-meta"> 
                        <p id="time">{messageContent.time}</p>
                        <p id="author">{messageContent.author}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </ScrollToBottom>
          </div>
          <div className="chat-footer">
            <input type="text"
              value={currentMessage}
              placeholder="Enter Message Here"
              onChange={(event) => { setCurrentMessage(event.target.value); }}
              onKeyDown={(event) => { event.key === "Enter" && sendMessage(); }}
            />
            <button onClick={sendMessage}>&#9658;</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
