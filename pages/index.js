import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import AppBar from '@mui/material/AppBar';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Checkbox, CssBaseline, FormControlLabel } from '@mui/material';
import Container from "@mui/material/Container";
import Footer from '../components/Footer';
import Header from '../components/Header';

const theme = createTheme();

export default function Home() {
  return (
    <>
       <Head>
        <title>Verified ID sample</title>
        <meta name="description" content="Sample for getting srated" />
        <link rel="icon" type="image/png" href="/icon.webp" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header/>
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
              <div style={{ display: "flex", marginTop: 3 }}>
                <div style={{ flex: 2, textAlign: "left" }}>
                  <Link href='/issue'>
                    <h2 style={{ cursor: 'pointer' }}>Get Credential</h2>
                  </Link>
                </div>
                <div style={{ flex: 2, textAlign: "center" }}>
                  <Link href='verify'>
                    <h2 style={{ cursor: 'pointer' }}>Verify Credential</h2>
                  </Link>
                </div>
              </div>
            </Container>
          </Box>
        </main>
        <Footer />
      </ThemeProvider>
    </>
   
  )
}
