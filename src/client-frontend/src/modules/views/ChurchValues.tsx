import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '../components/Typography';

const item: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  px: 5,
};

function ChurchValues() {
  return (
    <Box
      component="section"
      sx={{ display: 'flex', overflow: 'hidden', bgcolor: 'secondary.light' }}
    >
      <Container sx={{ mt: 15, mb: 30, display: 'flex', position: 'relative' }}>
        <Box
          component="img"
          src="/public/appCurvyLines.png"
          alt="curvy lines"
          sx={{ pointerEvents: 'none', position: 'absolute', top: -180 }}
        />
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/public/icons/bible-icon.png"
                alt="suitcase"
                sx={{ height: 95 }}
              />
              <Typography variant="h6" sx={{ my: 3 }}>
                WE ARE A BIBLE CHURCH
              </Typography>
              <Typography variant="h5" textAlign="center">
                {
                  'We are a Bible Church, not just a New Testament Church. '
                }
                {
                  'All scripture is God-breathed and is useful and is to be applied to our lives.'
                }
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/public/icons/apply-icon.png"
                alt="graph"
                sx={{ height: 95 }}
              />
              <Typography variant="h6" sx={{ my: 3 }}>
                WE APPLY THE BIBLE
              </Typography>
              <Typography variant="h5" textAlign="center">
                {
                  'Speak where the Bible is silent and be silent where the Bible speaks.'
                }
                {' We are free to practice and name anything as long as it does not conflict with scripture. '}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/static/themes/onepirate/productValues3.svg"
                alt="clock"
                sx={{ height: 55 }}
              />
              <Typography variant="h6" sx={{ my: 5 }}>
                Exclusive rates
              </Typography>
              <Typography variant="h5">
                {'By registering, you will access specially negotiated rates '}
                {'that you will not find anywhere else.'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ChurchValues;
