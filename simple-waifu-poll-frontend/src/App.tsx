// FILE: src/App.tsx
import { useState } from "react";
import Home from "./pages/Home";
import CreatePoll from "./pages/CreatePoll";
import ViewPoll from "./pages/ViewPoll";
import Layout from "./components/Layout";

// Tipe untuk mengelola tampilan
type View =
  | { page: "home" }
  | { page: "create" }
  | { page: "poll"; pollId: number };

function App() {
  const [view, setView] = useState<View>({ page: "home" });

  // Fungsi untuk merender konten berdasarkan state 'view'
  const renderContent = () => {
    switch (view.page) {
      case "create":
        // Kirim fungsi untuk kembali ke 'home' setelah berhasil
        return <CreatePoll navigateToHome={() => setView({ page: "home" })} />;
      case "poll":
        return <ViewPoll pollId={view.pollId} />;
      case "home":
      default:
        // Kirim fungsi untuk navigasi ke halaman lain
        return (
          <Home
            navigateToCreate={() => setView({ page: "create" })}
            navigateToPoll={(id) => setView({ page: "poll", pollId: id })}
          />
        );
    }
  };

  return (
    <Layout
      navigateToHome={() => setView({ page: "home" })}
      navigateToCreate={() => setView({ page: "create" })}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
