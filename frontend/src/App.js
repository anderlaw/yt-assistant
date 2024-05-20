import "./App.css";

import Nav from "./compos/Nav";
import Header from "./compos/Header";
import Login from "./compos/login";
import { useEffect, useState } from "react";
import { loginSignup } from "./api/index";
function App() {
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    const hasAuth = JSON.parse(localStorage.getItem("yt-assistant-auth"));
    if (hasAuth) {
      setAuthState(hasAuth);
    }
  }, []);
  return (
    <div className="App">
      {authState ? (
        <>
          <Header authState={authState} />
          <Nav />
          <div
            style={{
              marginLeft: "200px",
              marginTop: "60px",
              background: "pink",
            }}
            className="main"
          >
            fafafafafaafaf
          </div>
        </>
      ) : (
        <Login
          onLogin={(email) => {
            const authData = {
              email: email,
            };
            loginSignup(email).then((res) => {
              if (res.data.status === true) {
                localStorage.setItem(
                  "yt-assistant-auth",
                  JSON.stringify(authData)
                );
                setAuthState(authData);
              }
            });
          }}
        />
      )}
    </div>
  );
}

export default App;
