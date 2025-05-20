"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import { ref, set, onValue, push, remove } from "firebase/database";
import { Button, message, Input, List, Modal } from "antd";

export default function ProjectsPage() {
    const [isOn, setIsOn] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [scheduleAction, setScheduleAction] = useState("ON");
    const [schedules, setSchedules] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const router = useRouter();

    // Load schedules from Firebase
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

    // Auto-run scheduled actions every minute
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

            schedules.forEach((schedule) => {
                if (schedule.time === currentTime && !schedule.executed) {
                    const newState = schedule.action === "ON" ? 1 : 0;

                    set(ref(db, "Sensor/"), {
                        time: { value: newState },
                        "product 1": newState,
                    })
                        .then(() => {
                            message.success(
                                `Device turned ${schedule.action} by schedule`
                            );

                            // Mark as executed
                            const scheduleRef = ref(
                                db,
                                `Schedules/${schedule.id}`
                            );
                            set(scheduleRef, {
                                ...schedule,
                                executed: true,
                            });
                            setIsOn(schedule.action === "ON");
                        })
                        .catch((error) => {
                            console.error("Scheduled execution failed:", error);
                            message.error("Failed to execute scheduled action");
                        });
                }
            });
        }, 60 * 1000); // every minute

        return () => clearInterval(interval);
    }, [schedules]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    const handleTurnOn = () => {
        set(ref(db, "Sensor/"), {
            time: { value: 1 },
            "product 1": 1,
        })
            .then(() => {
                setIsOn(true);
                message.success("Device turned ON");
            })
            .catch((error) => {
                console.error("Error turning on device:", error);
                message.error("Failed to turn on device");
            });
    };

    const handleTurnOff = () => {
        set(ref(db, "Sensor/"), {
            time: { value: 0 },
            "product 1": 0,
        })
            .then(() => {
                setIsOn(false);
                message.success("Device turned OFF");
            })
            .catch((error) => {
                console.error("Error turning off device:", error);
                message.error("Failed to turn off device");
            });
    };

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
                setIsModalVisible(false);
            })
            .catch((error) => {
                console.error("Error adding schedule:", error);
                message.error("Failed to add schedule");
            });
    };

    const handleDeleteSchedule = (scheduleId) => {
        const scheduleRef = ref(db, `Schedules/${scheduleId}`);
        remove(scheduleRef)
            .then(() => {
                message.success("Schedule deleted successfully");
            })
            .catch((error) => {
                console.error("Error deleting schedule:", error);
                message.error("Failed to delete schedule");
            });
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setScheduleTime("");
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Projects Page</h1>

            <div className="flex gap-6 mt-4">
                <Button type="primary" onClick={handleTurnOn} disabled={isOn}>
                    Turn ON
                </Button>
                <Button type="default" onClick={handleTurnOff} disabled={!isOn}>
                    Turn OFF
                </Button>
                <Button type="dashed" onClick={showModal}>
                    Add Schedule
                </Button>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">
                    Scheduled Actions
                </h2>
                <List
                    bordered
                    dataSource={schedules}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    danger
                                    onClick={() =>
                                        handleDeleteSchedule(item.id)
                                    }
                                >
                                    Delete
                                </Button>,
                            ]}
                        >
                            Turn {item.action} at {item.time} —{" "}
                            {item.executed ? "✅ Executed" : "🕒 Pending"}
                        </List.Item>
                    )}
                />
            </div>

            <Modal
                title="Add New Schedule"
                open={isModalVisible}
                onOk={handleAddSchedule}
                onCancel={handleCancel}
                okText="Add"
            >
                <div className="flex flex-col gap-4">
                    <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        placeholder="Select time"
                    />
                    <select
                        value={scheduleAction}
                        onChange={(e) => setScheduleAction(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="ON">Turn ON</option>
                        <option value="OFF">Turn OFF</option>
                    </select>
                </div>
            </Modal>
        </div>
    );
}
