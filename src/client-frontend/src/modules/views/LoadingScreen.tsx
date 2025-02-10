import withRoot from '../withRoot';
import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingScreen() {
  return (
    // The Box component is used here to create a full viewport container
    // with flex styling to center its children both vertically and horizontally.
    <Box
      sx={{
        height: '100vh',           // Full viewport height
        display: 'flex',           // Enable flexbox layout
        flexDirection: 'column',   // Arrange children in a column
        justifyContent: 'center',  // Center children vertically
        alignItems: 'center',      // Center children horizontally
        backgroundColor: '#f5f5f5'   // Optional: light background color for contrast
      }}
    >
      {/* CircularProgress is the Material UI spinner component */}
      <CircularProgress size={60} color="primary" />

      {/* Typography component displays the loading message */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Loading...
      </Typography>
    </Box>
  );
}

export default withRoot(LoadingScreen);
