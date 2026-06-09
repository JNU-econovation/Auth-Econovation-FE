import { Routes, Route } from "react-router";
import LoginPage from "@app/LoginPage";
import SignUpPage from "@app/SignUpPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/sign-in" element={<SignUpPage />} />
    </Routes>
  );
}

export default App;
