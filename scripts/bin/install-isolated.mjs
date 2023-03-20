#!/usr/bin/env node
import {$} from 'execa';

if (!['install', 'ci'].includes(process.env.npm_command)) {
  throw `Unexpected npm_command environment variable (value was "${process.env.npm_command}"). This script should only be run from a preinstall or postinstall script.`;
}

await $({stdio: 'inherit'})`npm ${process.env.npm_command}`;
