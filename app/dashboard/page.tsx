"use client";

import {
    LaptopOutlined,
    NotificationOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, message, Input, List, Modal } from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { ref, set, onValue, push, remove } from "firebase/database";
import RequireAuth from "../../components/RequireAuth";
import NotificationsPage from "./notifications/page";
import ProjectsPage from "./projects/page";

const { Header, Content, Sider } = Layout;

export default function DashboardPage() {
    const [selectedKey, setSelectedKey] = useState("1");
    const router = useRouter();

    const handleMenuClick = (e) => {
        if (e.key === "3") {
            handleLogout();
        } else {
            setSelectedKey(e.key);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/auth/login");
    };

    return (
        <RequireAuth>
            <Layout style={{ minHeight: "100vh" }}>
                <Sider width={200} className="bg-white">
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        style={{ height: "100%", borderRight: 0 }}
                        onClick={handleMenuClick}
                        items={[
                            {
                                key: "1",
                                icon: <LaptopOutlined />,
                                label: "Projects",
                            },
                            {
                                key: "2",
                                icon: <NotificationOutlined />,
                                label: "Notifications",
                            },
                            {
                                key: "3",
                                icon: <UserOutlined />,
                                label: "Logout",
                            },
                        ]}
                    />
                </Sider>

                <Layout style={{ padding: "24px" }}>
                    <Content>
                        {selectedKey === "1" && <ProjectsPage />}
                        {selectedKey === "2" && <NotificationsPage />}
                    </Content>
                </Layout>
            </Layout>
        </RequireAuth>
    );
}
