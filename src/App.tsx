import { Routes, Route } from "react-router";
import LoginPage from "@pages/LoginPage";
import SignUpPage from "@pages/SignUpPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/sign-in" element={<SignUpPage />} />
    </Routes>
  );
}

export default App;
