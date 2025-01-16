import Home from "./modules/pages/Home"
import { Routes } from "react-router-dom"
import { Route } from "react-router"
import SignIn from "./modules/pages/SignIn"
import SignUp from "./modules/pages/SignUp"
import ForgotPassword from "./modules/pages/ForgotPassword"
import Terms from "./modules/pages/Terms"
import Privacy from "./modules/pages/Privacy"
import Location from "./modules/pages/Location"
import { useDispatch } from "react-redux"
import { setLogin } from "./modules/ducks/userSlice"
import { useEffect } from "react"
import SignOut from "./modules/pages/SignOut"
import AccountCreated from "./modules/pages/AccountCreated"
import Dashboard from "./modules/pages/Dashboard"
import Profile from "./modules/pages/Profile"
import ContactUs from "./modules/pages/ContactUs"
import ConfirmNewPassword from "./modules/pages/ConfirmNewPassword"
import VerifyEmail from "./modules/pages/VerifyEmail"
import ControPage from "./modules/pages/ControPage"
import BenevolencePage from "./modules/pages/BenevolencePage"
import MissionsPage from "./modules/pages/MissionsPage"

export const SERVER = import.meta.env.VITE_API_LINK

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('userToken');

    if (user && token) {
      dispatch(
        setLogin({
          user: JSON.parse(user),
          token: JSON.parse(token),
        })
      );
    }
  }, [dispatch]);

  return (
    <div>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/location" element={<Location />} />
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/verify" element={<VerifyEmail />} />
            <Route path="/auth/signout" element={<SignOut />} />
            <Route path="/auth/created" element={<AccountCreated />} />
            <Route path="/auth/forgotpassword" element={<ForgotPassword />} />
            <Route path="/auth/confirmpassword" element={<ConfirmNewPassword />} />
            <Route path="/contribution" element={<ControPage />} />
            <Route path="/benevolence" element={<BenevolencePage />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
        </Routes>
    </div>
  )
}

export default App