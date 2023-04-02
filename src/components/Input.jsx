import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

//fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

const Input = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [err, setErr] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const inputRef = useRef(null);

  const handleSend = async () => {
    if (image) {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, image);
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          setErr(true);
          console.log(error);
        },
        async () => {
          await getDownloadURL(uploadTask.snapshot.ref).then(
            async (downloadURL) => {
              await updateDoc(doc(db, "chats", data.chatId), {
                messages: arrayUnion({
                  id: uuid(),
                  text: text,
                  senderId: currentUser.uid,
                  date: Timestamp.now(),
                  image: downloadURL,
                }),
              });
              setImage(null);
            }
          );
        }
      );
    } else {
      if (!text.trim()) {
        return; // Si el texto está vacío o solo contiene espacios en blanco, no envía el mensaje.
      }
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          text: text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });
    }

    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text: text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text: text,
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setTimeout(() => {
        handleSend();
        setText("");
      }, 0);
    }
  };

  const handleImageChange = (file) => {
    console.log(file);
    if (file) {
      setImage(file);
    }
  };

  return (
    <div className="input">
      <input
        type="text"
        placeholder=" Type something"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        value={text}
        ref={inputRef}
      />
      <div className="send">
        {" "}
        <input
          type="file"
          id="file"
          name="file"
          style={{ display: "none" }}
          onChange={(e) => {
            handleImageChange(e.target.files[0]);
          }}
        />
        <label htmlFor="file">
          <FontAwesomeIcon icon={faImage} />
        </label>
        <button
          onClick={() => {
            handleSend();
            setText("");
            inputRef.current.focus();
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Input;
