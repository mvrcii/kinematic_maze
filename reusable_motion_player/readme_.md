# Prerequisites for Visualizing in the Motion Player

## File Format
- Ensure that your file is in CSV format and follows these column names to be read correctly:
  - `delta_time_ms`
  - `head_pos_x`
  - `head_pos_y`
  - `head_pos_z`
  - `head_rot_x`
  - `head_rot_y`
  - `head_rot_z`
  - `head_rot_w`
  - `left_hand_pos_x`
  - `left_hand_pos_y`
  - `left_hand_pos_z`
  - `left_hand_rot_x`
  - `left_hand_rot_y`
  - `left_hand_rot_z`
  - `left_hand_rot_w`
  - `right_hand_pos_x`
  - `right_hand_pos_y`
  - `right_hand_pos_z`
  - `right_hand_rot_x`
  - `right_hand_rot_y`
  - `right_hand_rot_z`
  - `right_hand_rot_w`
- You also need to make sure that the representation of the rotation is in quaternions. 

## Index.html
- To reference your file, you need to copy the file path into the `index.html` file.

# Starting a Local Server with Python

## Prerequisites
- Ensure you have Python installed on your system. You can download it from [python.org](https://www.python.org/).

## Instructions

### Open Terminal or Command Prompt
- **On Windows**: Press Win + R, type `cmd`, and press Enter.
- **On macOS/Linux**: Open the Terminal application.

### Navigate to Your Project Folder
Use the `cd` command to change the directory to the folder containing your `index.html` file.

```bash
cd path/to/your/folder
```
Replace `path/to/your/folder` with the actual path to your project folder.

### Start the Server
Run the following command to start the server:
```bash
python -m http.server 8081
```
If you have both Python 2 and Python 3 installed, and `python` command refers to Python 2.x, you might need to use `python3` instead:
```bash
python3 -m http.server 8081
```
### Access the Server
Open a web Browser and go to:
```bash
http://localhost:8081
```
The index.html should now be served on this port, and you can access your web content locally.