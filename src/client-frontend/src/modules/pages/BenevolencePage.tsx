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

const OneTimePaymentComponent = ({
    donationAmountRef,
    setShowThankYouBanner,
    setSubmitError
  }: {
    donationAmount: string;
    donationAmountRef: React.MutableRefObject<string>;
    setShowThankYouBanner: React.Dispatch<React.SetStateAction<boolean>>;
    setSubmitError: React.Dispatch<React.SetStateAction<string>>;
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
            custom_id: 'Benevolence'
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

const SubscriptionPaymentComponent: React.FC<{
    donationAmount: string;
    donationAmountRef: React.MutableRefObject<string>;
    setShowThankYouBanner: React.Dispatch<React.SetStateAction<boolean>>;
    setSubmitError: React.Dispatch<React.SetStateAction<string>>;
  }> = ({ donationAmountRef, setShowThankYouBanner, setSubmitError }) => {
    const createSubscription: PayPalButtonsComponentProps["createSubscription"] = async () => {
      const endpoint = `${SERVER}/create-paypal-subscription`;
  
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
            custom_id: "Benevolence",
          }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
  
        const responseData = await response.json();
        if (!responseData.subscription_id) {
          throw new Error("Subscription ID is missing in the response.");
        }
  
        return responseData.subscription_id;
      } catch (error) {
        console.error("Error creating subscription:", error);
        setSubmitError(`${error}`);
        throw error;
      }
    };
  
    const handleOnApprove = async (
      data: { subscriptionID?: string | null },
      _actions: any
    ): Promise<void> => {
      try {
        if (data.subscriptionID) {
          setShowThankYouBanner(true);
        } else {
          throw new Error("Subscription ID is missing in the approval data.");
        }
      } catch (error) {
        console.error("Error during approval:", error);
        setSubmitError(`${error}`);
      }
    };

  return (
    <PayPalButtons
      style={{ layout: "vertical", color: "black" }}
      createSubscription={createSubscription}
      onApprove={(data, actions) => handleOnApprove(data, actions)}
      onError={(err) => {
        console.error("PayPal error:", err);
        setSubmitError(`${err}`);
      }}
    />
  );
};


const BenevolencePage = () => {
  const [donationAmount, setDonationAmount] = useState("0.00");
  const donationAmountRef = useRef(donationAmount);
  const [submitError, setSubmitError] = useState('')
  const [paymentType, setPaymentType] = useState<"one-time" | "subscription">(
    "one-time"
  );
  const paymentTypeRef = useRef(paymentType);
  const [showThankYouBanner, setShowThankYouBanner] = useState(false);

  const initialOptions = {
      clientId: "AfYXn-9V-9VfmWexdtRa8Q6ZYBQ4eU8cW8J01x4_BfCMuEuHN3kOc1eP9V-VYjYcqktNR06NuSr-UqT9",
      currency: "USD",
      intent: "capture",
      vault: true,
    };

    useEffect(() => {
        donationAmountRef.current = donationAmount;
        paymentTypeRef.current = paymentType;
      }, [donationAmount, paymentType]);

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
        <Typography variant="h5" align="center" my={3} width={'80%'} justifySelf={'center'}>Benevolence</Typography>

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

        {/* Payment Type Selection */}   
        <Box
        sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "3rem",
            marginTop: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            width: "300px",
            mx: "auto",
        }}
        >
        <Box
            sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                padding: "10px 0",
                backgroundColor: paymentType === "one-time" ? "#1e1e1f" : "",
                color: paymentType === "one-time" ? "white" : "#1e1e1f",
                borderRight: "1px solid #ccc",
                "&:hover": {
                    backgroundColor: "#ff3366",
                    color: "white",
                },
            }}
            onClick={() => setPaymentType("one-time")}
            >
            <Typography variant="h5">
                One-Time
            </Typography>
        </Box>
        <Box
            sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                padding: "10px 0",
                backgroundColor: paymentType === "subscription" ? "#1e1e1f" : "",
                color: paymentType === "subscription" ? "white" : "#1e1e1f",
                "&:hover": {
                    backgroundColor: "#ff3366",
                    color: "white",
                },
            }}
            onClick={() => setPaymentType("subscription")}
            >
            <Typography variant="h5">
                Subscription
            </Typography>
        </Box>
        </Box>
                {/* Error Message */}
                {submitError && (
                <FormFeedback error sx={{ mt: 2, mb: 2 }}>
                    {submitError}
                </FormFeedback>
                )}

                {/* PayPal Buttons */}
                {paymentType === "one-time" && (
                    <OneTimePaymentComponent
                    donationAmount={donationAmount}
                    donationAmountRef={donationAmountRef}
                    setShowThankYouBanner={setShowThankYouBanner}
                    setSubmitError={setSubmitError}
                    />
                )}
                {paymentType === "subscription" && (
                    <SubscriptionPaymentComponent
                    donationAmount={donationAmount}
                    donationAmountRef={donationAmountRef}
                    setShowThankYouBanner={setShowThankYouBanner}
                    setSubmitError={setSubmitError}
                    />
                )}
        </AppForm>
      <AppFooter />
    </PayPalScriptProvider>
  );
};

export default withRoot(BenevolencePage);