import Auth from "../app/auth/login/page";

export default function Home() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <Auth />
        </div>
    );
}
