import * as React from 'react';
import { Theme, styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const ChurchHeroLayoutRoot = styled('section')(({ theme }) => ({
  color: theme.palette.common.white,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    height: '80vh',
    minHeight: 500,
    maxHeight: 1300,
  },
}));

const Background = styled('div')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  zIndex: -2,
});

interface ChurchHeroLayoutProps {
  sxBackground: SxProps<Theme>;
}

export default function ProductHeroLayout(
  props: React.HTMLAttributes<HTMLDivElement> & ChurchHeroLayoutProps,
) {
  const { sxBackground, children } = props;

  return (
    <ChurchHeroLayoutRoot>
      <Container
        sx={{
          mt: 3,
          mb: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'common.black',
            opacity: 0.5,
            zIndex: -1,
          }}
        />
        <Background sx={sxBackground} />
        <KeyboardArrowDownIcon sx={{fontSize: '5rem', mt: '2rem'}} />
      </Container>
    </ChurchHeroLayoutRoot>
  );
}
