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
                location='Cornerstone Park'
                date='Sundays'
                time='5PM'
                size='large'
            />
            <EventCard 
                name='Campus Devo'
                location='UNLV'
                date='Fridays'
                time='7:30PM'
                size='large'
                description=''
            />
            <EventCard 
                name='Bible Talk'
                location='Contact Us'
                date='Fridays'
                time='7:30PM'
                size='large'
                description=''
            />
            <EventCard 
                name='Mid-Week'
                location='UNLV'
                date='Wednesdays'
                time='7:30PM'
                size='large'
                description='Alternates every other week so make sure to contact us for more info'
            />
          </Box>
        </React.Fragment>
      </AppForm>
      <AppFooter />
    </React.Fragment>
  );
}

export default withRoot(Location);
