![CLI Preview](/src/assets/console-one.png)

### Console CLI
Console CLI lets you control Figma using commands. You can list fonts, styles, and components, create shapes, get details about selected elements, check file analytics, and view user info.

### Commands
- `help` : See available commands
- `ls` : Lists data related to fonts, styles, or components
    - `ls fonts` : List all fonts used in the file
    - `ls styles` : List all styles used in file file
    - `ls components` : List all components in the file
- `shape` : Create a new shapes based on the specified type
    - `shape rect <width> <height> [x] [y]` : Create rectangle
    - `shape circle <diameter> [x] [y]` : Create circle
    - `shape ellipse <width> <height> [x] [y]` : Create ellipse
    - `shape polygon <sides> <radius> [x] [y]` : Create polygon
    - `shape star <points> <outer-radius> <inner-radius> [x] [y]` : Create star
- `selection` : Info about the currently selected nodes
    - `selection --verbose`  : Additional details about the selection
- `analytics` : Retrieve file analytics
- `whoami` : Retrieves info about the current user
- `clear` : Clear the console
- `exit` : Close the plugin
