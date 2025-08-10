// FILE: src/pages/ViewPoll.tsx
import { useState, useEffect } from "react";
import { useStacks } from "../hooks/useStacks";
import { fetchPollDetails } from "../lib/contract";

interface ViewPollProps {
  pollId: number;
}

const ViewPoll = ({ pollId }: ViewPollProps) => {
  const { userData, connectWallet, handleVote } = useStacks();
  const [poll, setPoll] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (pollId) {
        try {
          const details = await fetchPollDetails(parseInt(pollId));
          setPoll(details);
        } catch (error) {
          console.error("Failed to fetch poll details:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadDetails();
  }, [pollId]);

  const onVote = async () => {
    if (selectedOption === null || !pollId) return;
    if (!userData) {
      connectWallet();
      return;
    }
    setIsVoting(true);
    try {
      await handleVote(parseInt(pollId), selectedOption);
    } catch (error) {
      alert("Vote failed.");
      console.error(error);
    } finally {
      setIsVoting(false);
    }
  };

  if (loading)
    return <div className="text-center p-10">Loading poll details...</div>;
  if (!poll) return <div className="text-center p-10">Poll not found.</div>;

  const totalVotes = poll.options.reduce(
    (sum: number, opt: any) => sum + opt.votes,
    0,
  );
  const isPollOpen = poll.status === 0;
  const hasVoted = poll.userVote !== null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{poll.question}</h1>
      <p className="text-sm text-gray-400 mb-6">
        Created by: <span className="font-mono">{poll.creator}</span>
      </p>
      <div className="space-y-3">
        {poll.options.map((option: any, index: number) => {
          const percentage =
            totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <div
              key={index}
              className={`border rounded-lg p-3 transition-all ${selectedOption === index ? "border-blue-500" : "border-gray-700"}`}
            >
              <div className="flex justify-between items-center mb-1">
                <label
                  className={`font-semibold flex items-center ${isPollOpen && !hasVoted ? "cursor-pointer" : ""}`}
                >
                  {isPollOpen && !hasVoted && (
                    <input
                      type="radio"
                      name="poll-option"
                      className="mr-3"
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                    />
                  )}
                  {option.text}
                </label>
                <span className="text-gray-300 font-mono">
                  {option.votes} votes
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                <div
                  className={`h-2.5 rounded-full ${hasVoted && poll.userVote === index ? "bg-yellow-400" : "bg-blue-500"}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      {isPollOpen ? (
        hasVoted ? (
          <div className="mt-6 p-3 bg-green-900 border border-green-700 rounded-lg text-center">
            ✅ You voted for: "{poll.options[poll.userVote].text}"
          </div>
        ) : (
          <button
            onClick={onVote}
            disabled={selectedOption === null || isVoting}
            className="w-full mt-6 bg-green-600 p-2 rounded hover:bg-green-700 disabled:bg-gray-500 font-bold"
          >
            {" "}
            {isVoting ? "Submitting Vote..." : "Submit Vote"}{" "}
          </button>
        )
      ) : (
        <div className="mt-6 p-3 bg-gray-800 border border-gray-600 rounded-lg text-center">
          This poll is closed.
        </div>
      )}
    </div>
  );
};
export default ViewPoll;
