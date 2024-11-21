import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import AppBar from '../components/AppBar';
import Toolbar from '../components/Toolbar';
import { useMediaQuery } from '@mui/material';

const rightLink = {
  fontSize: 16,
  color: 'common.white',
  ml: 3,
};

function AppAppBar() {
  const smallScreen = useMediaQuery('(min-width: 800px)')

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }} />
          <Link
            variant="h6"
            underline="none"
            color="inherit"
            sx={{ fontSize: 24 }}
            href="/"
          >
            { smallScreen ? 'Restored Church Las Vegas' : "RCW Las Vegas" }
          </Link>
          { smallScreen ?
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              color="inherit"
              variant="h6"
              underline="none"
              sx={rightLink}
              href="/auth/signin"
            >
              {'Sign In'}
            </Link>
            <Link
              variant="h6"
              underline="none"
              sx={{ ...rightLink, color: 'secondary.main' }}
              href="/auth/signup"
            >
              {'Sign Up'}
            </Link>
          </Box>
          : <Box>
            
          </Box> 
          }
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
}

export default AppAppBar;
