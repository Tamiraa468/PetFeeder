"use client";

import { message, Switch } from "antd";
import { set, ref } from "firebase/database";
import { db } from "../lib/firebase";

type ControlButtonsProps = {
  isOn: boolean;
  setIsOn: (value: boolean) => void;
};

export default function ControlButtons({ isOn, setIsOn }: ControlButtonsProps) {
  const toggleDevice = (checked: boolean) => {
    set(ref(db, "Sensor/"), {
      time: { value: checked },
      servo: checked,
    })
      .then(() => {
        setIsOn(checked);
        message.success(`Device turned ${checked ? "ON" : "OFF"}`);
      })
      .catch(() => {
        message.error("Failed to toggle device");
      });
  };

  return (
    <div className="mt-4">
      <Switch
        checked={isOn}
        onChange={toggleDevice}
        checkedChildren="ON"
        unCheckedChildren="OFF"
      />
    </div>
  );
}
