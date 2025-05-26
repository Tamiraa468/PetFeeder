"use client";

import { useState } from "react";
import { Modal, Input, message } from "antd";
import { push, ref } from "firebase/database";
import { db } from "../lib/firebase";

type ScheduleModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

export default function ScheduleModal({
  visible,
  setVisible,
}: ScheduleModalProps) {
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [scheduleAction, setScheduleAction] = useState<"ON" | "OFF">("ON");

  const handleAddSchedule = () => {
    if (!scheduleTime) {
      message.error("Please enter a valid time");
      return;
    }

    const newSchedule = {
      time: scheduleTime,
      action: scheduleAction,
      timestamp: new Date().toISOString(),
      executed: false,
    };

    const schedulesRef = ref(db, "Schedules/");
    push(schedulesRef, newSchedule)
      .then(() => {
        message.success("Schedule added successfully");
        setScheduleTime("");
        setVisible(false);
      })
      .catch(() => message.error("Failed to add schedule"));
  };

  return (
    <Modal
      title="Add New Schedule"
      open={visible}
      onOk={handleAddSchedule}
      onCancel={() => setVisible(false)}
      okText="Add"
    >
      <div className="flex flex-col gap-4">
        <Input
          type="time"
          value={scheduleTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setScheduleTime(e.target.value)
          }
          placeholder="Select time"
        />
        <select
          value={scheduleAction}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setScheduleAction(e.target.value as "ON" | "OFF")
          }
          className="p-2 border rounded"
        >
          <option value="ON">Turn ON</option>
          <option value="OFF">Turn OFF</option>
        </select>
      </div>
    </Modal>
  );
}
