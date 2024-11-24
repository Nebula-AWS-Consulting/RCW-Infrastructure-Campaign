import React from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import AppBar from '../components/AppBar';
import Toolbar from '../components/Toolbar';
import { useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectIsLoggedIn } from '../ducks/userSlice';

const rightLink = {
  fontSize: 16,
  color: 'common.white',
  ml: 3,
};

function AppAppBar() {
  const isSmallScreen = useMediaQuery('(max-width: 800px)');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isLoggedIn = useSelector((state: RootState) => selectIsLoggedIn(state));


  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Side */}
          <Box sx={{ flex: 1 }}>
            {isSmallScreen && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>

          {/* Center Logo */}
          <Link
            variant="h6"
            underline="none"
            color="inherit"
            sx={{ fontSize: 24 }}
            href="/"
          >
            {isSmallScreen ? 'RCW Las Vegas' : 'Restored Church Las Vegas'}
          </Link>

          {/* Right Side Links */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {isSmallScreen ? (
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                <Box
                  sx={{ width: '100%' }}
                  role="presentation"
                  onClick={toggleDrawer(false)}
                  onKeyDown={toggleDrawer(false)}
                >
                  <List>
                    {isLoggedIn ? (
                      <>
                        <ListItem>
                          <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem >
                          <ListItemText primary="Profile" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Logout" />
                        </ListItem>
                      </>
                    ) : (
                      <>
                        <ListItem component="a" href="/auth/signin">
                          <ListItemText primary="Sign In" />
                        </ListItem>
                        <ListItem component="a" href="/auth/signup">
                          <ListItemText primary="Sign Up" />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Box>
              </Drawer>
            ) : (
              <>
                {isLoggedIn ? (
                  <>
                    <Link
                      color="inherit"
                      variant="h6"
                      underline="none"
                      sx={rightLink}
                      href="/dashboard"
                    >
                      Dashboard
                    </Link>
                    <Link
                      variant="h6"
                      underline="none"
                      sx={{ ...rightLink, color: 'inherit' }}
                      href="/profile"
                    >
                      Profile
                    </Link>
                    <Link
                      variant="h6"
                      underline="none"
                      sx={{ ...rightLink, color: 'secondary.main' }}
                      href="/auth/signout"
                    >
                      Logout
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      color="inherit"
                      variant="h6"
                      underline="none"
                      sx={rightLink}
                      href="/auth/signin"
                    >
                      Sign In
                    </Link>
                    <Link
                      variant="h6"
                      underline="none"
                      sx={{ ...rightLink, color: 'secondary.main' }}
                      href="/auth/signup"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </div>
  );
}

export default AppAppBar;
