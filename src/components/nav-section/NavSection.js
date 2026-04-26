import PropTypes from 'prop-types';
import { useState } from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
// @mui
import {
  Box, List, ListItemText, Collapse, ListItemButton, ListItemIcon,
} from '@mui/material';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { StyledNavItem, StyledNavItemIcon } from './styles';

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) =>
          item.children ? (
            <NavGroup key={item.title} item={item} />
          ) : (
            <NavItem key={item.title} item={item} />
          )
        )}
      </List>
    </Box>
  );
}

// ── Grupo colapsable ──────────────────────────────────────────────────────────

NavGroup.propTypes = { item: PropTypes.object };

function NavGroup({ item }) {
  const { pathname } = useLocation();
  const isActive = item.children?.some((c) => pathname.startsWith(c.path));
  const [open, setOpen] = useState(isActive);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen((p) => !p)}
        sx={{
          height: 48,
          borderRadius: 1,
          textTransform: 'capitalize',
          color: isActive ? 'text.primary' : 'text.secondary',
          bgcolor: isActive ? 'action.selected' : 'transparent',
          fontWeight: isActive ? 'fontWeightBold' : 'fontWeightMedium',
          typography: 'body2',
          '&:hover': { bgcolor: 'action.hover' },
          px: 1,
        }}
      >
        <StyledNavItemIcon>{item.icon}</StyledNavItemIcon>
        <ListItemText disableTypography primary={item.title} sx={{ flexGrow: 1 }} />
        <ListItemIcon sx={{ minWidth: 0 }}>
          {open
            ? <ChevronDownIcon style={{ width: 16, height: 16 }} />
            : <ChevronRightIcon style={{ width: 16, height: 16 }} />}
        </ListItemIcon>
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding sx={{ pl: 2 }}>
          {item.children.map((child) => (
            <NavItem key={child.title} item={child} isChild />
          ))}
        </List>
      </Collapse>
    </>
  );
}

// ── Ítem hoja ─────────────────────────────────────────────────────────────────

NavItem.propTypes = {
  item: PropTypes.object,
  isChild: PropTypes.bool,
};

function NavItem({ item, isChild = false }) {
  const { title, path, icon, info } = item;

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        height: isChild ? 40 : 48,
        pl: isChild ? 1 : undefined,
        '&.active': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
        },
      }}
    >
      <StyledNavItemIcon sx={{ width: isChild ? 18 : 22, height: isChild ? 18 : 22 }}>
        {icon}
      </StyledNavItemIcon>
      <ListItemText disableTypography primary={title} />
      {info && info}
    </StyledNavItem>
  );
}
