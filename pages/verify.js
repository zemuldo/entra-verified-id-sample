import React from 'react'
import Head from 'next/head'
import AppBar from '@mui/material/AppBar';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Container from "@mui/material/Container";
import Verify from '../components/Verify';
import Footer from '../components/Footer';

const theme = createTheme();

export default function Home() {
  return (
    < >
      <Head>
        <title>Verified ID sample - Verify</title>
        <meta name="description" content="Sample for getting srated" />
        <link rel="icon" type="image/png" href="/icon.webp" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="relative">
          <Toolbar>
            <CameraIcon sx={{ mr: 2 }} />
            <Typography variant="h6" color="inherit" noWrap>
              Issue/Verify VC
            </Typography>
          </Toolbar>
        </AppBar>
        <main style={{ minHeight: "85vh" }}>
          {/* Hero unit */}
          <Box
            sx={{
              bgcolor: "background.paper",
              pt: 8,
              pb: 6,
            }}
          >
            <Container maxWidth="sm">
              <Verify />
            </Container>
          </Box>
        </main>
        <Footer />
      </ThemeProvider>
    </>
  )
}
