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

export default function ProjectsPage() {
  const [isOn, setIsOn] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

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

              if (currentWeight <= 200) {
                const newState = schedule.action === "ON";
                set(ref(db, "Sensor/"), {
                  weight: currentWeight,
                  servo: newState,
                }).then(() => {
                  message.success(
                    `Device turned ${schedule.action} by schedule`
                  );

                  const scheduleRef = ref(db, `Schedules/${schedule.id}`);
                  set(scheduleRef, {
                    ...schedule,
                    executed: true,
                  });
                  setIsOn(newState);
                });
              } else {
                message.warning("Feeding skipped: weight exceeds 200g");

                // Skipped хийгдсэн байдалтай хадгална
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
