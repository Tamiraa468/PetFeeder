"use client";

import { Layout, Menu, Button } from "antd";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

const { Header } = Layout;

export default function Navbar({ user }) {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <Header className="flex justify-between items-center bg-red-700 text-white px-6 py-3 shadow-md">
            <div className="text-xl font-bold">LightSystem</div>
            <div className="flex items-center space-x-6">
                <Menu
                    mode="horizontal"
                    selectable={false}
                    className="flex space-x-4"
                >
                    <Menu.Item key="dashboard">
                        <Button
                            type="link"
                            className="text-white hover:underline"
                            onClick={() => router.push("/dashboard")}
                        >
                            Dashboard
                        </Button>
                    </Menu.Item>
                </Menu>
                {user ? (
                    <div className="flex items-center space-x-4">
                        <span className="text-sm">{user.email}</span>
                        <Button
                            type="link"
                            onClick={handleLogout}
                            className="text-white hover:bg-red-600 transition-colors"
                        >
                            Гарах
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="link"
                        onClick={() => router.push("/login")}
                        className="text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Нэвтрэх
                    </Button>
                )}
            </div>
        </Header>
    );
}
