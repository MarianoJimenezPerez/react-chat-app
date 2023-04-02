import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setErr(true);
    }
  };
  return (
    <div className="login">
      <div className="form_container">
        <div className="form_wrapper">
          <h1 className="logo"> Chat App</h1>
          <span className="title">Login</span>
          <form onSubmit={(e) => handleSubmit(e)}>
            <input type="email" placeholder="Type your email" />
            <input type="password" placeholder="Type your password" />
            <button>
              Sign in <span className={`loading ${loading && "active"}`}></span>
            </button>
          </form>
          {err && (
            <span style={{ color: "#ff0000", margin: "10px 0" }}>
              Something went wrong! Try again in a few seconds
            </span>
          )}
          <p>
            You don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
      <div className="bk_image"></div>
    </div>
  );
};

export default Login;
