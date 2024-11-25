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
      <Container sx={{ mt: 15, mb: 15, display: 'flex', position: 'relative' }}>
        <Box
          component="img"
          src="/appCurvyLines.png"
          alt="curvy lines"
          sx={{ pointerEvents: 'none', position: 'absolute', top: -180 }}
        />
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/icons/bible-icon.png"
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
              <Typography variant="h6" color='secondary' textAlign="center" href='' mt='1rem'>
                {'2 Timothy 3:16-17'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/icons/apply-icon.png"
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
              <Typography variant="h6" color='secondary' textAlign="center" href='' mt='1rem'>
                {'2 Peter 1:20-21'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={item}>
              <Box
                component="img"
                src="/icons/disciples-icon.png"
                alt="clock"
                sx={{ height: 95 }}
              />
              <Typography variant="h6" sx={{ my: 3 }}>
                WE MAKE DISCIPLES
              </Typography>
              <Typography variant="h5" textAlign="center">
                {'We believe in every member of the body of Christ being disciples of Jesus and in '}
                {'relationships that teach and mature us in the teachings of Christ'}
              </Typography>
              <Typography variant="h6" color='secondary' textAlign="center" href='' mt='1rem'>
                {'Matthew 28:18-20'}
              </Typography>
            </Box>
          </Grid>
          <Grid container item xs={12} justifyContent="center" spacing={5}>
            <Grid item xs={12} md={4}>
              <Box sx={item}>
                <Box
                  component="img"
                  src="/icons/missionaries-icon.png"
                  alt="clock"
                  sx={{ height: 105 }}
                />
                <Typography variant="h6" sx={{ my: 3 }}>
                  WE ARE MISSIONARIES
                </Typography>
                <Typography variant="h5" textAlign="center">
                  {'God’s will is for all people to be saved and to come to a knowledge of the truth. '}
                  {'We believe in evangelizing the nations in this generation as Jesus teaches.'}
                </Typography>
                <Typography variant="h6" color='secondary' textAlign="center" mt='1rem'>
                  {'1 Timothy 2:3-4'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={item}>
                <Box
                  component="img"
                  src="/icons/unity-icon.png"
                  alt="clock"
                  sx={{ height: 140 }}
                />
                <Typography variant="h6" sx={{ mb: 3, mt: -1 }}>
                  UNITY IN LEADERSHIP
                </Typography>
                <Typography variant="h5" textAlign="center">
                  {'God’s plan is for a central leadership of His people where there is unity, '}
                  {'just as it was throughout the Bible when God’s people were unified there was a central leader.'}
                </Typography>
                <Typography variant="h6" color='secondary' textAlign="center" href='' mt='1rem'>
                  {'1 Corinthians 4:14-17'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ChurchValues;
