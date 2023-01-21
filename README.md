# Grid Art (Project Chihuahua)

Create pixel art thorugh an uploaded csv file.

## Run

For windows: Start the app by downloading the release zip file for windows. Find and open the make > squirrel.windows > x64 > project_chihuahua setup executable

For mac: Clone this project, run `npm install`, then `npm run make`. Find the application and open it.

For developers: Clone this project, run `npm install`, then `npm run dev` to start electron and the vite dev server.

## Instructions

- Upload a CSV or use the template loaded automatically.
- The CSV should contain the strings "0" through "10", representing 11 colors.
- Edit the grid by selecting a color in the settings menu and clicking a grid square.
- Create lines by clicking and dragging from one square to another.
- Move a section by right-clicking and dragging down-right to make the selection, then left-clicking and dragging to move it. The moved area is replaced with the "0" value color.
- Undo/redo these operations with <code>ctrl+z</code>/<code>ctrl+shift+z</code>.
- Download/export your file with the <kbd>Save</kbd> button.

## Use your own template

This project was originally designed for the [Lego World Map](https://www.lego.com/en-us/product/world-map-31203) but it can be used with any CSV with the right data.

Take a look at the [public/templates](./public/templates) folder for same sample CSVs.
