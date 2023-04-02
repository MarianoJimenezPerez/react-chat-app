import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleSearch = async (user) => {
    //clean error if the input es empty
    if (user === "") {
      setErr(false);
    }
    const q = query(
      collection(db, "users"),
      where("displayNameLwc", "==", user)
    );
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setErr(false);
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
        });
      } else {
        setErr(true);
        setUser(null);
      }
    } catch (err) {
      setErr(true);
    }
  };

  const handleSelect = async () => {
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (!res.exists()) {
        console.log("entra if");
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

    setUser(null);
    setUsername("");
  };
  return (
    <div className="search">
      <div className="search_form">
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          onInput={(e) => handleSearch(e.target.value.toLowerCase())}
          placeholder="Type your friend name..."
          value={username}
        />
      </div>
      {err && (
        <span style={{ textAlign: "center", display: "inherit" }}>
          User not found
        </span>
      )}
      {user && (
        <div className="user_chat" onClick={handleSelect}>
          <img src={user.photoURL} alt={user.displayName} />
          <div className="user_chat_info">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
