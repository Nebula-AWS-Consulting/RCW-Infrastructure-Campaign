import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import AppBar from '../components/AppBar';
import Toolbar from '../components/Toolbar';
import { useMediaQuery } from '@mui/material';


function AppAppBar() {
  const smallScreen = useMediaQuery('(min-width: 800px)')

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
          <Box />
          <Link
            variant="h6"
            underline="none"
            color="inherit"
            sx={{ fontSize: 24 }}
            href="/"
          >
            { smallScreen ? 'Restored Church Las Vegas' : "RCW Las Vegas" }
          </Link>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
}

export default AppAppBar;
