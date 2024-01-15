import os

import pandas
import pandas as pd
from scipy.spatial.transform import Rotation as R
from who_is_alyx.convert import JOINTS


def _quat_swap_z_and_w(df):
    df = df.copy()
    columns_to_swap = [f"{x}_rot" for x in JOINTS]
    for col in columns_to_swap:
        df[col + '_z'], df[col + '_w'] = df[col + '_w'], df[col + '_z']
    return df


def negative_coordinate_system(df):
    df = df.copy()

    for c in df.columns:
        if c.endswith("_z") or c.endswith("_w"):
            df[c] *= -1

    return df


def transform_quat_to_euler(df):
    df = df.copy()
    for joint in JOINTS:
        quat_columns = [f"{joint}_rot_{xyzw}" for xyzw in "xyzw"]
        euler_columns = [f"{joint}_rot_{xyz}" for xyz in "xyz"]
        df[euler_columns] = R.from_quat(df[quat_columns]).as_euler("xyz", degrees=True)

    for col in [quat_col for quat_col in df.columns if "_w" in quat_col]:
        del df[col]

    return df


def negative_coordinate_mapping(df):
    df = df.copy()
    for joint in JOINTS:
        quat_columns = [f"{joint}_rot_{xyz}" for xyz in "xyzw"]
        euler_columns = [f"{joint}_rot_{xyz}" for xyz in "xyz"]
        df[quat_columns] = R.from_euler("zyx", df[euler_columns], degrees=True).as_quat()
    return df


def negative_rotations(df):
    df = df.copy()
    for joint in JOINTS:
        quat_columns = [f"{joint}_rot_{xyz}" for xyz in "xyzw"]
        euler_columns = [f"{joint}_rot_{xyz}" for xyz in "xyz"]
        df[quat_columns] = R.from_euler("XYZ", df[euler_columns], degrees=True).as_quat()
    return df


def negative_time(df):
    df = df.copy()
    df['delta_time_ms'] /= 3
    return df


def negative_units(df):
    df = df.copy()
    for c in df.columns:
        if c.endswith("pos_x") or c.endswith("pos_y") or c.endswith("pos_z"):
            df[c] *= 3
    return df


if __name__ == '__main__':
    negative_vars = [
        ("negative_coordinate_system", [negative_coordinate_system, transform_quat_to_euler, negative_coordinate_mapping,
                                        transform_quat_to_euler, negative_rotations]),
        # ("negative_coordinate_mapping", [transform_quat_to_euler, negative_coordinate_mapping]),
        # ("negative_rotations", [transform_quat_to_euler, negative_rotations]),
        # ("negative_time", [negative_time]),
        # ("negative_units", [negative_units]),
        # ("custom", [negative_coordinate_system, transform_quat_to_euler, negative_coordinate_mapping,
        #             transform_quat_to_euler, negative_rotations]),
    ]
    csv_path = "public/samples/boxrr_beatsaber23"
    fixed_csv_name = "fixed.csv"
    csv_file_path = os.path.join(csv_path, fixed_csv_name)

    for variation, fns in negative_vars:
        print(csv_file_path)
        recording = pd.read_csv(csv_file_path)

        for fn in fns:
            recording = recording.pipe(fn)

        out_path = csv_file_path.replace(fixed_csv_name, f"{variation}.csv")
        recording.to_csv(out_path, index=False)
