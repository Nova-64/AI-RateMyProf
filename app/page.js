'use client';
import { TextField, Button, Box, Stack, Typography, Container, Grid, Rating } from '@mui/material';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am NovaRMP, your Rate My Professor support assistant. How can I help you today?' },
  ]);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false); // new state variable to track whether the chatbot is open or not
  const [review, setReview] = useState({ professor: '', rating: 0, review: '' });
  const [professorReviews, setProfessorReviews] = useState({}); // new state variable to store professor reviews

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [...messages, {role: 'user', content: message}])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, {role: 'user', content: message}]),
      })

      const text = await response.text()
      setMessages((messages) => [...messages, {role: 'assistant', content: text}])
    } catch (error) {
      console.error(error)
    }
  }

  const toggleChatbot = () => {
    setOpen(!open);
  }

  const submitReview = async () => {
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      })

      const text = await response.text()
      console.log(text)
      setProfessorReviews((prevReviews) => ({ ...prevReviews, [review.professor]: [...(prevReviews[review.professor] || []), review] }));
    } catch (error) {
      console.error(error)
    }
  }

  const getProfessorReviews = async (professor) => {
    try {
      const response = await fetch(`/api/reviews/${professor}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const reviews = await response.json()
      setProfessorReviews((prevReviews) => ({ ...prevReviews, [professor]: reviews }));
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', bgcolor: '#FFFFFF' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Rate My Professor 
          </Typography>
          <Typography variant="body1" gutterBottom>
            Get help with your professor ratings and reviews.
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 20 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" component="h2" gutterBottom>
            What is NovaRMP?
          </Typography>
          <Typography variant="body1" gutterBottom>
            NovaRMP is a chatbot designed to assist you with your professor ratings and reviews.
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
            With NovaRMP, you can:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1">
                Ask questions about how to rate your professors
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Get tips on how to write effective reviews
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Learn about the rating process and how to rate your professors fairly and accurately
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                Get suggestions for how to improve your reviews and make them more helpful to others
              </Typography>
            </li>
            <Typography variant="body1">
                Rate Your  Professors with NovaRMP!
              </Typography>
          </ul>
        </Grid>
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          zIndex: 1,
          bgcolor: '#2E865F',
        }}
      >
        {open ? (
          <Stack
            direction="column"
            width={300}
            height={700}
            border="1px solid black"
            p={2}
            spacing={3}
          >
            <Stack
              direction="column"
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                >
                  <Box
                    bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                    color="white"
                    borderRadius={16}
                    p={3}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button variant="contained" onClick={sendMessage}>
               
                Send
              </Button>
              <Button variant="contained" onClick={toggleChatbot}>
                Close
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Button variant="contained" onClick={toggleChatbot}>
            Open Chatbot
          </Button>
        )}
      </Box>
      <Box sx={{ mt: 7 }}>
      <Typography variant="h5" component="h2" gutterBottom>
          Leave a Review
        </Typography>
        <Stack direction="column" spacing={2}>
          <TextField
            label="Professor"
            fullWidth
            value={review.professor}
            onChange={(e) => setReview({ ...review, professor: e.target.value })}
          />
          <Rating
            value={review.rating}
            onChange={(e, newValue) => setReview({ ...review, rating: newValue })}
          />
          <TextField
            label="Review"
            fullWidth
            multiline
            rows={4}
            value={review.review}
            onChange={(e) => setReview({ ...review, review: e.target.value })}
          />
          <Button variant="contained" onClick={submitReview}>
            Submit Review
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}