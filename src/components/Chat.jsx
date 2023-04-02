import React, { useContext, useState, useEffect } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

//fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import {
  faUserPlus,
  faEllipsisH,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

const Chat = () => {
  const { data, dispatch } = useContext(ChatContext);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState([]);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const getUsers = async () => {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      setUsers(querySnapshot.docs.map((doc) => doc.data()));
    };

    const unsubscribe = onSnapshot(collection(db, "users"), () => {
      getUsers();
    });

    return unsubscribe;
  }, []);

  const handleSelect = async (user) => {
    dispatch({
      type: "CHANGE_USER",
      payload: user,
    });
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (error) {
      setErr(true);
    }
  };

  return Object.keys(data.user).length === 0 ? (
    <div className="chat">
      <div className="chat_info" style={{ height: "100%" }}>
        <div className="chat_advice">
          <h2>Hi there! Welcome to Chat App</h2>
          <p>
            Looks like you first time here. Use the search bar on the left top
            to search your friends and start to chat or choose one in the table
            below
          </p>
          <table>
            <thead>
              <tr>
                <th>User name</th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map(
                  (user) =>
                    user.uid !== currentUser.uid && (
                      <tr onClick={() => handleSelect(user)} key={user.uid}>
                        <td className="">
                          <h5>{user.displayName}</h5>
                          <FontAwesomeIcon icon={faArrowUp} />
                        </td>
                      </tr>
                    )
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <div className="chat">
      <div className="chat_info">
        <div className="chat_user">
          <img src={data.user?.photoURL} alt={data.user?.displayName} />
          <span>{data.user?.displayName}</span>
        </div>
        <div className="chat_icons">
          <FontAwesomeIcon icon={faVideo} />
          <FontAwesomeIcon icon={faUserPlus} />
          <FontAwesomeIcon icon={faEllipsisH} />
        </div>
        <div className="chat_mobile_advice">
          <h3>Hi there! Looks like you are using a phone</h3>
          <p>For the moment, this app is only avaible for desktop or tablet.</p>
        </div>
      </div>
      <Messages />
      <Input />
    </div>
  );
};

export default Chat;
