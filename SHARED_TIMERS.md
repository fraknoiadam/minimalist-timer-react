# Shared Timer Guide

This document explains how to use the shared timer feature in Durer Timer.

## Overview

The shared timer feature allows you to:

1. Share your timer setup with others
2. Load a timer that someone else has created

## How to Share Your Timer

There are two ways to share your timer:

### Method 1: Using the Share Button (Recommended)
1. On the timer setup screen, look for your previously saved timers
2. Click the share icon (📤) next to the timer you want to share
3. In the share dialog that appears, click "Share"
4. Once shared, copy the timer code that appears
5. Share this code with others

## How to Load a Shared Timer

To load a timer that someone has shared with you:

1. On the main screen, locate the "Load a shared timer" input field
2. Enter the timer ID that was shared with you
3. Click "Load"
4. The shared timer will load with all its settings (including links, timing configuration, etc.)

## Technical Details

- Timer IDs are unique UUIDs
- Shared timers include all settings: duration, links, display preferences
- No account is needed to share timers
- Timers are stored on the server using FastAPI and PostgreSQL
- Accessible to anyone with the ID
- You can also view the API documentation at http://localhost:5000/docs when the server is running

## Troubleshooting

If you have trouble loading a timer:

1. Make sure you entered the ID correctly
2. Check that the timer hasn't been deleted or expired
3. Ensure your internet connection is working
