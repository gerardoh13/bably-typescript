import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import UserContext from "../users/UserContext";
import type { UserContextType } from "../users/UserContext";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from '@mui/icons-material/Menu';
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

type NavigationProps = {
  logout: () => void;
};

function Navigation({ logout }: NavigationProps) {
  const context = useContext(UserContext) as UserContextType;
  const currUser = context?.currUser;
  const currChild = context?.currChild;
  const setChildId = context?.setChildId;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        {currUser && currChild && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/calendar">
                <ListItemText primary="Calendar" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/settings">
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/profile">
                <ListItemText primary={currChild.firstName + (currChild.firstName.endsWith("s") ? "'" : "'s") + " profile"} />
              </ListItemButton>
            </ListItem>
            <Divider />
          </>
        )}
        {currUser && currUser.infants.length > 1 && (
          <>
            {currUser.infants.map((c) => {
              if (c.id !== currChild?.id) return (
                <React.Fragment key={c.id}>
                  <ListItem disablePadding key={c.id}>
                    <ListItemButton onClick={() => setChildId(c.id)}>
                      <ListItemText primary={"Switch to " + c.firstName} />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              )
            }
            )}
          </>
        )}
      </List>
      {currUser && (
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/"
              onClick={logout}
            >
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#2a302b" }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component={Link} to="/" color="inherit" sx={{ textDecoration: "none", flexGrow: 1 }}>
            Bably
          </Typography>
          {currUser && (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        // slotProps={{
        //   paper: { sx: { backgroundColor: "#9da39b" } }
        // }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Navigation;
