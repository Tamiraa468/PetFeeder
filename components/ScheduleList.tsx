"use client";

import { List, Button, message } from "antd";
import { ref, remove } from "firebase/database";
import { db } from "../lib/firebase";

export default function ScheduleList({ schedules }) {
  const handleDeleteSchedule = (scheduleId) => {
    const scheduleRef = ref(db, `Schedules/${scheduleId}`);
    remove(scheduleRef)
      .then(() => message.success("Schedule deleted successfully"))
      .catch(() => message.error("Failed to delete schedule"));
  };

  const getStatusLabel = (item) => {
    if (item.skipped) return "🛑 Skipped (Enough food)";
    if (item.executed) return "✅ Executed";
    return "🕒 Pending";
  };

  return (
    <List
      bordered
      dataSource={schedules}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              type="link"
              danger
              onClick={() => handleDeleteSchedule(item.id)}
            >
              Delete
            </Button>,
          ]}
        >
          Turn {item.action} at {item.time} — {getStatusLabel(item)}
        </List.Item>
      )}
    />
  );
}
