import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

//fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { data, dispatch } = useContext(ChatContext);

  const handleSelect = (user) => {
    dispatch({
      type: "CHANGE_USER",
      payload: user,
    });
    setActiveChat(user.uid);
  };

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
        if (doc.data()) {
          const chatsData = Object.values(doc.data());
          const sortedChats = chatsData.sort((a, b) => b.date - a.date);
          const firstChat = sortedChats[0];
          if (firstChat === undefined) {
            dispatch({
              // elimina de estado cualquier usuario
              type: "CHANGE_USER",
              payload: {},
            });
          } else {
            dispatch({
              // establece el primer chat como activo por defecto
              type: "SET_ACTIVE_INDEX",
              payload: 0,
            });

            dispatch({
              // abre el primer chat obtenido
              type: "CHANGE_USER",
              payload: firstChat.userInfo,
            });

            setActiveChat(firstChat.userInfo.uid);
          }
        }
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  return (
    <div className="chats">
      {chats &&
        Object.entries(chats)
          ?.sort((a, b) => b[1].date - a[1].date)
          .map((chat, index) => (
            <div
              className={`user_chat ${
                activeChat === chat[1].userInfo.uid ? "active" : ""
              }`}
              key={chat[0]}
              onClick={() => {
                handleSelect(chat[1].userInfo);
                dispatch({
                  type: "SET_ACTIVE_INDEX",
                  payload: index,
                });
                setActiveChat(chat[1].userInfo.uid);
              }}
            >
              <img
                src={chat[1].userInfo.photoURL}
                alt={chat[1].userInfo.displayName}
              />
              <div className="user_chat_info">
                <span>{chat[1].userInfo.displayName}</span>
                {chat[1].lastMessage?.text !== "" ? (
                  <p>{chat[1].lastMessage?.text}</p>
                ) : (
                  <div>
                    <FontAwesomeIcon icon={faFile} />
                    <p>Upload</p>
                  </div>
                )}
              </div>
            </div>
          ))}
    </div>
  );
};

export default Chats;
