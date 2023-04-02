import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message }) => {
  const [timeString, setTimeString] = useState("");
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  //actualiza altura del scroll 2 veces, una cuando se carga el componente y otra a los 2 seg
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });

    const timeoutId = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [message]);

  //actualiza el estado timeAgo, quien renderiza el horario en el que se envió el mensaje
  useEffect(() => {
    const messageTime = new Date(
      message.date.seconds * 1000 + message.date.nanoseconds / 1000000
    ); //formatea el timestamp de firebase a objeto Date
    const currentTime = new Date();

    const diffSeconds = Math.floor((currentTime - messageTime) / 1000);
    if (diffSeconds < 60) {
      setTimeString("just now");
    } else if (diffSeconds < 3600) {
      const diffMinutes = Math.floor(diffSeconds / 60);
      setTimeString(`${diffMinutes}m ago`);
    } else if (diffSeconds < 86400) {
      const hours = messageTime.getHours();
      const minutes = messageTime.getMinutes();
      setTimeString(`${hours}:${minutes}`);
    } else {
      const month = messageTime.toLocaleString("default", { month: "short" });
      const day = messageTime.getDate();
      const year = messageTime.getFullYear();
      setTimeString(`${month} ${day}, ${year}`);
    }

    const intervalId = setInterval(() => {
      const currentTime = new Date();
      const diffSeconds = Math.floor((currentTime - messageTime) / 1000);
      if (diffSeconds < 60) {
        setTimeString("just now");
      } else if (diffSeconds < 3600) {
        const diffMinutes = Math.floor(diffSeconds / 60);
        setTimeString(`${diffMinutes} min ago`);
      } else {
        const hours = messageTime.getHours();
        const minutes = messageTime.getMinutes();
        setTimeString(`${hours}:${minutes}`);
      }
    }, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [message]);
  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
    >
      <div className="message_info">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL
              : data.user?.photoURL
          }
          alt={
            message.senderId === currentUser.uid
              ? currentUser.displayName
              : data.user?.displayName
          }
        />
        <span>{timeString}</span>
      </div>
      <div className="message_content">
        {message.text !== "" && <p>{message.text}</p>}
        {message.image && <img src={message.image} alt={message.text} />}
      </div>
    </div>
  );
};

export default Message;
