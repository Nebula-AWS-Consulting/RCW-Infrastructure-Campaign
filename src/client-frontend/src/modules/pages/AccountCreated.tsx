import React from 'react';
import Box from '@mui/material/Box';
import Typography from '../components/Typography';
import AppAppBar from '../views/AppAppBar';
import FormButton from '../form/FormButton';
import { useNavigate } from 'react-router-dom';
import AppFooter from '../views/AppFooter';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import withRoot from '../withRoot';

function AccountCreated() {
  const user = useSelector((state: RootState) => state.userAuthAndInfo.user);
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <React.Fragment>
      <AppAppBar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: 2,
        }}
      >
        <Typography variant="h3" gutterBottom marked="center" align="center">
          Account Created!
        </Typography>
        <Typography variant="h4" align="center" mt={'4rem'}>
          Username: {user?.user_name}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2, mt: '4rem' }}>
          Your account has been successfully created. You can now return to Home.
        </Typography>
        <FormButton
          sx={{ mt: 3, mb: 2, paddingX: 10 }}
          color="secondary"
          onClick={handleContinue}
        >
          Return to Home
        </FormButton>
      </Box>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(AccountCreated);
