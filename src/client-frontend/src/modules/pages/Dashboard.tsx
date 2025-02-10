import React from 'react';
import AppAppBar from '../views/AppAppBar';
import AppFooter from '../views/AppFooter';
import withRoot from '../withRoot';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';

function Dashboard() {
  // State to control the Bible Study Form dialog
  const [openBibleStudyForm, setOpenBibleStudyForm] = React.useState(false);

  // Handlers to open and close the Bible Study Form dialog
  const handleOpenBibleStudyForm = () => {
    setOpenBibleStudyForm(true);
  };

  const handleCloseBibleStudyForm = () => {
    setOpenBibleStudyForm(false);
  };

  return (
    <React.Fragment>
    <AppAppBar />
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, px: 2 }}>
      {/* Inner Box limits the max width of the dashboard content */}
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        {/* -------------------------------
            Bible Study Form Card
        --------------------------------- */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Bible Study Form
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Launch the Bible Study form to submit your study details.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpenBibleStudyForm}>
              Open Form
            </Button>
          </CardContent>
        </Card>

        {/* -------------------------------
            Church Goals Card
        --------------------------------- */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Church Goals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and update the church goals.
            </Typography>
            {/* Add more content or interactive elements as needed */}
          </CardContent>
        </Card>

        {/* -------------------------------
            Bible Study Chart Card
        --------------------------------- */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Bible Study Chart
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View your Bible study progress in this chart.
            </Typography>
            {/* Placeholder for the chart */}
            <Box
              sx={{
                height: 200,
                mt: 2,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography>Chart goes here</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* -------------------------------
            Admin App Card
        --------------------------------- */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Admin App
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Access the admin panel.
            </Typography>
            {/* The button acts as a link to the admin app */}
            <Button variant="contained" color="secondary" href="/admin">
              Go to Admin App
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* -------------------------------
          Bible Study Form Dialog
      --------------------------------- */}
      <Dialog open={openBibleStudyForm} onClose={handleCloseBibleStudyForm} fullWidth maxWidth="sm">
        <DialogTitle>Bible Study Form</DialogTitle>
        <DialogContent>
          {/* Replace the placeholder with your actual Bible Study form */}
          <Typography>This is a placeholder for the Bible Study form.</Typography>
        </DialogContent>
      </Dialog>
    </Box>
    <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(Dashboard);