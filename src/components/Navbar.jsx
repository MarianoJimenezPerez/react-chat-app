import React, { useContext } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);

  const handleLogout = async () => {
    await signOut(auth)
      .then(() => {
        console.log("Sign-out successful.");
      })
      .catch((error) => {
        console.error("An error happened:", error);
      });
  };

  return (
    <div className="navbar">
      <span className="logo">Chat App</span>
      <div className="user">
        <img src={currentUser.photoURL} alt={currentUser.displayName} />
        <span>{currentUser.displayName}</span>
        <button onClick={() => handleLogout()}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
