# 180 Stereo Photo Viewer
A VR180 photo viewer that works on a web browser.

You can try it here. https://paturages.github.io/180-stereo-photo-viewer/

## Supported photo formats
- ~~VR180 photos (vr.jpg)~~ [Please refer to chiqden's original version for VR180 photos](https://github.com/chiqden/180-stereo-photo-viewer)
- 180 stereo side by side photos
- This fork allows more than just `image/jpeg` inputs

## Features
- Zenith correction (support Cardboard Camera VR Photo Format)
- Offline support (experimental)

## Notes
- You need “Motion & Orientation Access” permission to use with Safari on iOS 12.2.  
  `Settings` -> `Safari` -> `PRIVACY & SECURITY` -> `Motion & Orientation Access`

## Usage
- Specify a photo in HTML file  
  Set the path of the photo to `index.html` `<img id="stereoImage" 👉src="">`.  
- Select a photo in file picker  
  Double-click(tap) on the browser or drag and drop a file to select a photo.
- Recenter  
  Press the <kbd>Space</kbd> bar on the keyboard. (for PC)  
  Long-Press on the browser. (for Mobile)
- Zoom  
  Use the scroll wheel
- Rotate image up/down  
  Use the up/down arrow keys
- To disable file picker  
  Remove `file-picker` component from `index.html` `<a-scene 180-stereo-photo-viewer 👉file-picker …>`
- To disable offline support  
  1. Comment out `index.html` `<script src="scripts/offline-support.js"></script>`.
  2. Unregister the Service Worker.
  3. Delete the cache.

## Open source licenses
- A-Frame (https://github.com/aframevr/aframe)  
  Copyright © 2015-2017 A-Frame authors.  
  MIT License (https://github.com/aframevr/aframe/blob/master/LICENSE)
- Exif.js (https://github.com/exif-js/exif-js)  
  Copyright (c) 2008 Jacob Seidelin  
  MIT License (https://github.com/exif-js/exif-js/blob/master/LICENSE.md)
