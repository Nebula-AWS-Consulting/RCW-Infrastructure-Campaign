import Home from "./modules/pages/Home"
import { Routes } from "react-router-dom"
import { Route } from "react-router"
import SignIn from "./modules/pages/SignIn"
import SignUp from "./modules/pages/SignUp"
import ForgotPassword from "./modules/pages/ForgotPassword"

function App() {
  return (
    <div>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>
    </div>
  )
}

export default App