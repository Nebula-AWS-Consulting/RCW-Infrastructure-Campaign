import * as React from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import { Card as MuiCard, CardProps, CardContent, Typography } from '@mui/material';

// Styled Card component
const CardRoot = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[3],
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',

  justifyContent: 'center',
  color: theme.palette.text.primary,
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[6],
  },
  variants: [
    {
      props: { size: 'small' },
      style: {
        padding: theme.spacing(1),
        fontSize: theme.typography.pxToRem(12),
      },
    },
    {
      props: { size: 'large' },
      style: {
        padding: theme.spacing(3),
        fontSize: theme.typography.pxToRem(16),
      },
    },
  ],
}));

// Event Card Component
function EventCard<C extends React.ElementType>(
  props: CardProps<C, { component?: C }> & {
    name: string;
    location: string;
    date: string;
    time: string;
    size?: 'small' | 'medium' | 'large';
    description?: string;
  }
) {
  const { name, location, date, time, size = 'medium', description = '', ...rest } = props;

  return (
    <CardRoot size={size} {...rest}>
      <CardContent>
        <Typography variant="h4" component="div">
          {name}
        </Typography>
        <Typography variant="h6" component="div">
          {location}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {date}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {time}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={'1rem'}>
          {description}
        </Typography>
      </CardContent>
    </CardRoot>
  );
}

export default EventCard;
