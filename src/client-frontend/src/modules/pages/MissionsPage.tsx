import { useEffect, useRef, useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import { Box, TextField, InputAdornment } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AppAppBar from "../views/AppAppBar";
import AppFooter from "../views/AppFooter";
import withRoot from "../withRoot";
import AppForm from "../views/AppForm";
import Typography from "../components/Typography";
import { SERVER } from "../../App";
import FormFeedback from "../form/FormFeedback";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const OneTimePaymentComponent = ({
    donationAmountRef,
    setShowThankYouBanner,
    setSubmitError,
    user,
    token
  }: {
    donationAmount: string;
    donationAmountRef: React.MutableRefObject<string>;
    setShowThankYouBanner: React.Dispatch<React.SetStateAction<boolean>>;
    setSubmitError: React.Dispatch<React.SetStateAction<string>>;
    user: { user_name: string | null; email: string | null };
    token: {user_id: string | null; id_token: string | null; access_token: string | null; refresh_token: string | null;}
  }) => {
    const createOrder: PayPalButtonsComponentProps["createOrder"] = async () => {
      const endpoint = `${SERVER}/create-paypal-order`;
  
      try {
        const amount = parseFloat(donationAmountRef.current);
        if (isNaN(amount) || amount <= 0) {
          throw new Error("Invalid donation amount. Please enter a valid number greater than 0.");
        }
  
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amount,
            custom_id: 'Benevolence',
            user_id: token?.user_id || "guest",
            email: user?.email || "guest@example.com",
          }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
  
        const responseData = await response.json();
        if (!responseData.id) {
          throw new Error("Order ID is missing in the response.");
        }
        return responseData.id;
      } catch (error) {
        console.error("Error creating order:", error);
        setSubmitError(`${error}`);
        throw error;
      }
    };
  
    const handleOnApprove = async (_data: any, actions: any) => {
        try {
          if (actions?.order?.capture) {
            await actions.order.capture();
          } else {
            throw new Error("Capture action is unavailable.");
          }
          setShowThankYouBanner(true);
        } catch (error) {
          console.error("Error during approval:", error);
          setSubmitError(`${error}`);
        }
      };
  
    return (
      <PayPalButtons
        style={{ layout: "vertical", color: "black" }}
        createOrder={createOrder}
        onApprove={(data, actions) => handleOnApprove(data, actions)}
        onError={(err) => {
          console.error("PayPal error:", err);
          setSubmitError(`${err}`);
        }}
      />
    );
  };

const MissionsPage = () => {
  const [donationAmount, setDonationAmount] = useState("0.00");
  const donationAmountRef = useRef(donationAmount);
  const [submitError, setSubmitError] = useState('')
  const [showThankYouBanner, setShowThankYouBanner] = useState(false);
  const user = useSelector((state: RootState) => state.userAuthAndInfo.user ?? { user_name: null, email: null });
  const token = useSelector((state: RootState) => state.userAuthAndInfo.token ?? { user_id: null, id_token: null, access_token: null, refresh_token: null });

  const initialOptions = {
      clientId: "AfYXn-9V-9VfmWexdtRa8Q6ZYBQ4eU8cW8J01x4_BfCMuEuHN3kOc1eP9V-VYjYcqktNR06NuSr-UqT9",
      currency: "USD",
      intent: "capture",
      vault: true,
    };

    useEffect(() => {
        donationAmountRef.current = donationAmount;
      }, [donationAmount]);

  return (
    <PayPalScriptProvider options={initialOptions}>
      <AppAppBar />
        {/* Thank You Message */}
        {showThankYouBanner && (
        <FormFeedback isDefault sx={{ mb: '-2rem', mt: 4, textAlign: 'center', width: '60%', justifySelf: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="white">
            Thank you for donating!
            </Typography>
        </FormFeedback>
        )}
      <AppForm>
        <Typography variant="h5" align="center" mb={2} justifySelf={'center'}>Donate to</Typography>
        <Typography variant="h4" gutterBottom marked="center" align="center">Restored Church Las Vegas</Typography>
        <Typography variant="h5" align="center" my={3} width={'80%'} justifySelf={'center'}>Special Missions</Typography>

        {/* Donation Amount Input */}
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
        }}>
            <TextField
                label="Donation Amount"
                type="number"
                value={donationAmount}
                onChange={(e) => {
                    const value = e.target.value;
                    setDonationAmount(value);
                }}
                sx={{ margin: 2, justifySelf: 'center' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                        <AttachMoneyIcon />
                    </InputAdornment>
                    ),
                }}
                helperText={Number(donationAmount) <= 0 && "Please enter a valid amount."}
                error={Number(donationAmount) <= 0}
                />
        </Box>
                {/* Error Message */}
                {submitError && (
                <FormFeedback error sx={{ mt: 2, mb: 2 }}>
                    {submitError}
                </FormFeedback>
                )}

                {/* PayPal Buttons */}
                  <OneTimePaymentComponent
                  donationAmount={donationAmount}
                  donationAmountRef={donationAmountRef}
                  setShowThankYouBanner={setShowThankYouBanner}
                  setSubmitError={setSubmitError}
                  user={user}
                  token={token}
                  />
        </AppForm>
      <AppFooter />
    </PayPalScriptProvider>
  );
};

export default withRoot(MissionsPage);