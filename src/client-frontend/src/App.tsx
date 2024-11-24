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
import { useEffect } from "react"

function App() {
  const user = useSelector((state: RootState) => state.userAuthAndInfo);
  const dispatch = useDispatch();

  const isLoggedIn = useSelector(
    (state: RootState) => Boolean(state.userAuthAndInfo.token)
  );

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

console.log(user)
console.log(isLoggedIn)

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