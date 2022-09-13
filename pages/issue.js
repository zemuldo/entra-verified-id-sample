import React from 'react'
import Head from 'next/head'
import AppBar from '@mui/material/AppBar';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Checkbox, CssBaseline, FormControlLabel } from '@mui/material';
import Issuer from '../components/Issuer';
import Container from "@mui/material/Container";
import Footer from '../components/Footer';

const theme = createTheme();

export default function Home() {
  return (
    < >
      <Head>
        <title>Verified ID sample - Issue</title>
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
              <Issuer />
            </Container>
          </Box>
        </main>
        <Footer />
      </ThemeProvider>
    </>
  )
}
