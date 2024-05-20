import { useEffect, useState } from "react";
export default ({ onLogin }) => {
  const [email, setEmail] = useState("");
  return (
    <div align="center">
      <h3>Login</h3>
      <form>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "0px 12px",
            height: "30px",
            boxSizing: "border-box",
            fontSize: "16px",
          }}
          placeholder="请输入邮箱"
          name="email"
          type="text"
        />
        <br />
        <button
          onClick={(e) => {
            e.preventDefault();
            onLogin(email);
          }}
          style={{ height: "30px" }}
        >
          确认
        </button>
      </form>
    </div>
  );
};
