import React from 'react';
import AppAppBar from '../views/AppAppBar';
import AppForm from '../views/AppForm';
import { Box } from '@mui/material';
import AppFooter from '../views/AppFooter';
import withRoot from '../withRoot';
import EventCard from '../components/Event';
import Typography from '../components/Typography';

function Location() {
  return (
    <React.Fragment>
      <AppAppBar />
      <AppForm>
        <React.Fragment>
          <Typography variant="h3" gutterBottom marked='center' align="center">
            Locations
          </Typography>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            mt: '4rem',
            gap: '20px'
          }}>
            <EventCard 
                name='Sunday Service'
                location={import.meta.env.VITE_SUNDAY_CARD_LOCATION}
                date='Sundays'
                time={import.meta.env.VITE_SUNDAY_CARD_TIME}
                size='large'
                description={import.meta.env.VITE_SUNDAY_CARD_DESCRIPTION}
            />
            <EventCard 
                name='Campus Devo'
                location={import.meta.env.VITE_DEVO_CARD_LOCATION}
                date='Fridays'
                time={import.meta.env.VITE_DEVO_CARD_TIME}
                size='large'
                description={import.meta.env.VITE_DEVO_CARD_DESCRIPTION}
            />
            <EventCard 
                name='Bible Talk'
                location={import.meta.env.VITE_BT_CARD_LOCATION}
                date='Fridays'
                time={import.meta.env.VITE_BT_CARD_TIME}
                size='large'
                description={import.meta.env.VITE_BT_CARD_DESCRIPTION}
            />
            <EventCard 
                name='Mid-Week'
                location={import.meta.env.VITE_MIDWEEK_CARD_LOCATION}
                date='Wednesdays'
                time={import.meta.env.VITE_MIDWEEK_CARD_TIME}
                size='large'
                description={import.meta.env.VITE_MIDWEEK_CARD_DESCRIPTION}
            />
          </Box>
        </React.Fragment>
      </AppForm>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(Location);
