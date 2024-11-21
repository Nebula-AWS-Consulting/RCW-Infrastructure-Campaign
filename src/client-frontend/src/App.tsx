import Home from "./modules/pages/Home"
import { Routes } from "react-router-dom"
import { Route } from "react-router"
import SignIn from "./modules/pages/SignIn"
import SignUp from "./modules/pages/SignUp"
import ForgotPassword from "./modules/pages/ForgotPassword"
import Terms from "./modules/pages/Terms"
import Privacy from "./modules/pages/Privacy"
import ConfirmSignUp from "./modules/pages/ConfirmSignUp"
import Location from "./modules/pages/Location"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "./store"
import { setLogin } from "./modules/ducks/userSlice"

function App() {
  const isLoggedIn = Boolean(useSelector((state: RootState) => state.userAuthAndInfo.token))
  const user = useSelector((state: RootState) => state.userAuthAndInfo);
  const dispatch = useDispatch();

  const userCookies = localStorage.getItem('user')
  const userToken = localStorage.getItem('userToken')

  if (userCookies && userToken) {
    dispatch(
      setLogin({
        user: userCookies,
        token: userToken
    }))
  }

console.log(user)

  return (
    <div>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/location" element={<Location />} />
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