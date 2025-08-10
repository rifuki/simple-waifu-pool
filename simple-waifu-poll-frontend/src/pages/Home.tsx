// FILE: src/pages/Home.tsx
import { useState, useEffect } from "react";
import PollCard from "../components/PollCard";
import { fetchNextPollId, fetchPollDetails } from "../lib/contract";

interface HomeProps {
  navigateToCreate: () => void;
  navigateToPoll: (id: number) => void;
}

const Home = ({ navigateToPoll }: HomeProps) => {
  // ... (logika fetch data sama seperti sebelumnya) ...
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadPolls = async () => {
      try {
        const nextId = await fetchNextPollId();
        const pollPromises = Array.from({ length: nextId }, (_, i) =>
          fetchPollDetails(i),
        );
        const pollsData = (await Promise.all(pollPromises))
          .filter((p) => p)
          .reverse();
        setPolls(pollsData);
      } catch (error) {
        console.error("Failed to fetch polls:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPolls();
  }, []);

  if (loading) return <div className="text-center p-10">Loading polls...</div>;
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Polls</h1>
      <div className="space-y-4">
        {polls.length > 0 ? (
          polls.map((p) => (
            <PollCard key={p.id} {...p} navigateToPoll={navigateToPoll} />
          ))
        ) : (
          <p>No polls found. Be the first to create one!</p>
        )}
      </div>
    </div>
  );
};
export default Home;
