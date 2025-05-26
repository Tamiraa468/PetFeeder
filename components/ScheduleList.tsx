"use client";

import { List, Button, message } from "antd";
import { ref, remove } from "firebase/database";
import { db } from "../lib/firebase";
import { Schedule } from "../app/dashboard/projects/schedule"; // adjust the path to your Schedule type

type ScheduleListProps = {
  schedules: Schedule[];
};

export default function ScheduleList({ schedules }: ScheduleListProps) {
  const handleDeleteSchedule = (scheduleId: string) => {
    const scheduleRef = ref(db, `Schedules/${scheduleId}`);
    remove(scheduleRef)
      .then(() => message.success("Schedule deleted successfully"))
      .catch(() => message.error("Failed to delete schedule"));
  };

  const getStatusLabel = (item: Schedule) => {
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
              key="delete"
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
