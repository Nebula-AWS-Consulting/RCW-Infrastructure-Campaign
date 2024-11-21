import React from 'react'
import AppAppBar from '../views/AppAppBar';
import AppForm from '../views/AppForm';
import { Box, Link, Typography } from '@mui/material';
import AppFooter from '../views/AppFooter';
import withRoot from '../withRoot';

function Location() {
    return (
        <React.Fragment>
          <AppAppBar />
          <AppForm>
            <React.Fragment>
              <Typography variant="h3" gutterBottom marked="center" align="center">
                Location
              </Typography>
              <Box>

              </Box>
            </React.Fragment>
          </AppForm>
          <AppFooter />
        </React.Fragment>
      );
}

export default withRoot(Location)