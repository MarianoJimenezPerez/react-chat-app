import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

//fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setLoading(true);
        const storageRef = ref(storage, "avatars/" + displayName);

        const uploadUser = uploadBytesResumable(storageRef, file);

        uploadUser.on(
          "state_changed",
          null,
          (error) => {
            setErr(true);
            console.log(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadUser.snapshot.ref);

            updateProfile(auth.currentUser, {
              displayName: displayName,
              photoURL: downloadURL,
            }).then(() => {
              setDoc(doc(db, "users", auth.currentUser.uid), {
                uid: auth.currentUser.uid,
                displayName: displayName,
                displayNameLwc: displayName.toLowerCase(),
                email: email,
                photoURL: downloadURL,
              })
                .then(() => {
                  setDoc(doc(db, "userChats", auth.currentUser.uid), {});
                })
                .then(() => {
                  setLoading(false);
                  navigate("/");
                })
                .catch((error) => {
                  setErr(true);
                  console.log(error);
                });
            });
          }
        );
      })
      .catch((error) => {
        setErr(true);
        console.log(error);
      });
  };
  return (
    <div className="register">
      <div className="form_container">
        <div className="form_wrapper">
          <h1 className="logo"> Chat App</h1>
          <span className="title">Register</span>
          <form onSubmit={(e) => handleSubmit(e)}>
            <input type="text" placeholder="Type your name" />
            <input type="email" placeholder="Type your email" />
            <input type="password" placeholder="Type your password" />
            <input type="file" id="file" style={{ display: "none" }} />
            <label htmlFor="file">
              <FontAwesomeIcon icon={faUserPlus} />
              &nbsp; Add your avatar
            </label>
            <button>
              Sign up <span className={`loading ${loading && "active"}`}></span>
            </button>
            {err && (
              <span style={{ color: "#ff0000", margin: "10px 0" }}>
                Something went wrong! Try again in a few seconds
              </span>
            )}
          </form>
          <p>
            Do you have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
      <div className="bk_image"></div>
    </div>
  );
};

export default Register;
