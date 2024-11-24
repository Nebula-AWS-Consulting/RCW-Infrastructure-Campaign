import React from "react";
import AppAppBar from "../views/AppAppBar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import FormButton from "../form/FormButton";
import { Box } from "@mui/material";
import withRoot from "../withRoot";
import { useNavigate } from "react-router-dom";
import { setLogin } from "../ducks/userSlice";

function ConfirmSignUp() {
    const user = useSelector((state: RootState) => state.userAuthAndInfo.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        if (user && user.email && user.password) {
            await confirmUser(user.email);

            await loginUser(user.email, user.password);

            navigate('/')
        } else {
            console.error("User or user details are missing!");
        }
    };

    const confirmUser = async (email: string) => {
        const response = await fetch(
            `https://c8b5tz2a1a.execute-api.us-west-1.amazonaws.com/prod/confirm`,
            {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: email
              })
              }
        )

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

    };

    const loginUser = async (email: string, password: string) => {
        const response = await fetch(
          `https://c8b5tz2a1a.execute-api.us-west-1.amazonaws.com/prod/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password
          })
          }
        );
    
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
    
        const data = await response.json();

        const userData = {
          user_name: user?.user_name,
          password: null,
          email: email
        };
      
        const tokenData = {
          id_token: data.id_token,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        };
      
        // Store data in local storage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userToken', JSON.stringify(tokenData));
      
        // Dispatch to Redux store
        dispatch(
          setLogin({
            user: userData,
            token: tokenData,
          })
        )
      };
      
  return (
    <React.Fragment>
        <AppAppBar />
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
        }}>
            <h1>Confirm Sign Up</h1>
            <p>Is this info correct</p>
            <p>{user?.email}</p>
          <FormButton
          sx={{ mt: 3, mb: 2, paddingX: 10 }}
          color="secondary"
          onClick={handleSubmit}
          >
          {'Confirm'}
          </FormButton>
        </Box>
    </React.Fragment>
  )
}

export default withRoot(ConfirmSignUp)