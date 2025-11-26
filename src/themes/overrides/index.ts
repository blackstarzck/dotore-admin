// third-party
import { merge } from 'lodash-es';
import { Theme } from '@mui/material/styles';

// project imports
import Button from './Button';
import CardContent from './CardContent';
import Chip from './Chip';
import Dialog from './Dialog';
import IconButton from './IconButton';
import Tab from './Tab';
import TableBody from './TableBody';
import TableCell from './TableCell';
import TableHead from './TableHead';
import TableRow from './TableRow';
import Tabs from './Tabs';

// ==============================|| OVERRIDES - MAIN ||============================== //

export default function ComponentsOverrides(theme: Theme) {
  return merge(
    Button(theme),
    CardContent(),
    Chip(theme),
    Dialog(theme),
    IconButton(theme),
    Tab(theme),
    TableBody(theme),
    TableCell(theme),
    TableHead(theme),
    TableRow(),
    Tabs()
  );
}
