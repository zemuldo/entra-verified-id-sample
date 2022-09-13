
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AppBar, Toolbar } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import MLink from '@mui/material/Link';

export default function Header() {
    return (
        <AppBar position="relative">
            <Toolbar>
                <HomeIcon sx={{ mr: 2 }} />
                <Typography variant="h6" color="inherit" noWrap>
                    <MLink color='#fff' href='/'>
                        Issue/Verify VC
                    </MLink>
                   
                </Typography>
                
            </Toolbar>
        </AppBar>
    );
}
