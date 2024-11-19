import Home from "./modules/pages/Home"
import { Routes } from "react-router-dom"
import { Route } from "react-router"
import SignIn from "./modules/pages/SignIn"
import SignUp from "./modules/pages/SignUp"
import ForgotPassword from "./modules/pages/ForgotPassword"
import Terms from "./modules/pages/Terms"
import Privacy from "./modules/pages/Privacy"
import ConfirmSignUp from "./modules/pages/ConfirmSignUp"

function App() {
  return (
    <div>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/confirm" element={<ConfirmSignUp />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
        </Routes>
    </div>
  )
}

export default App