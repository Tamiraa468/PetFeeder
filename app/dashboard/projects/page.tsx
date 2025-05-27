"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { auth, db } from "../../../lib/firebase";
import { Button, message, Card } from "antd";

import ControlButtons from "../../../components/ControlButton";
import ScheduleList from "../../../components/ScheduleList";
import ScheduleModal from "../../../components/ScheduleModal";
import { Schedule } from "../projects/schedule";

export default function ProjectsPage() {
  const [isOn, setIsOn] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  // Load schedules from Firebase Realtime Database
  useEffect(() => {
    const schedulesRef = ref(db, "Schedules/");
    onValue(schedulesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedSchedules = [];
      for (const key in data) {
        loadedSchedules.push({ id: key, ...data[key] });
      }
      setSchedules(loadedSchedules);
    });
  }, []);

  // Function to handle turning servo ON/OFF with delays
  async function activateServoWithDelay(
    schedule: Schedule,
    currentWeight: number
  ) {
    const newState = schedule.action === "ON";

    // Initial 10-second delay before activating servo
    await new Promise((resolve) => setTimeout(resolve, 10000));

    await set(ref(db, "Sensor/"), {
      weight: currentWeight,
      servo: newState,
    });
    message.success(`Device turned ${schedule.action} by schedule`);

    const scheduleRef = ref(db, `Schedules/${schedule.id}`);
    await set(scheduleRef, {
      ...schedule,
      executed: true,
    });
    setIsOn(newState);

    // Another 10-second delay before turning servo OFF automatically
    await new Promise((resolve) => setTimeout(resolve, 10000));

    await set(ref(db, "Sensor/"), {
      weight: currentWeight,
      servo: false,
    });
    setIsOn(false);
    message.info("Device turned OFF after delay");
  }

  // Periodically check schedules every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

      schedules.forEach((schedule) => {
        if (
          schedule.time === currentTime &&
          !schedule.executed &&
          !schedule.skipped
        ) {
          const sensorRef = ref(db, "Sensor/weight");

          onValue(
            sensorRef,
            (snapshot) => {
              const currentWeight = snapshot.val();

              if (currentWeight <= 50) {
                // Activate servo with delay and auto turn-off
                activateServoWithDelay(schedule, currentWeight);
              } else {
                message.warning("Feeding skipped: weight exceeds 50g");

                const scheduleRef = ref(db, `Schedules/${schedule.id}`);
                set(scheduleRef, {
                  ...schedule,
                  skipped: true,
                });
              }
            },
            { onlyOnce: true }
          );
        }
      });
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [schedules]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Projects Page</h1>

      {/* Inline Cards */}
      <div className="flex gap-4 mb-6 mx-auto">
        <Card
          className="w-1/2 h-52 flex items-center justify-center"
          title="Control Panel"
          bordered={true}
        >
          <ControlButtons isOn={isOn} setIsOn={setIsOn} />
        </Card>

        <Card
          className="w-1/2 h-52 flex items-center justify-center"
          title="Schedule New"
          bordered={true}
        >
          <Button type="dashed" onClick={() => setIsModalVisible(true)}>
            Add Schedule
          </Button>
        </Card>
      </div>

      {/* Schedule List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Scheduled Actions</h2>
        <ScheduleList schedules={schedules} />
      </div>

      {/* Modal */}
      <ScheduleModal visible={isModalVisible} setVisible={setIsModalVisible} />
    </div>
  );
}
