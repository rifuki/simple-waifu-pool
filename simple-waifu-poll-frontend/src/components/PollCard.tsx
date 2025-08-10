// FILE: src/components/PollCard.tsx
interface PollCardProps {
  id: number;
  question: string;
  creator: string;
  status: number;
  navigateToPoll: (id: number) => void;
}

const PollCard = ({
  id,
  question,
  creator,
  status,
  navigateToPoll,
}: PollCardProps) => (
  <button
    onClick={() => navigateToPoll(id)}
    className="w-full text-left block border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition"
  >
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">{question}</h3>
      <span
        className={`px-2 py-0.5 text-xs font-bold rounded-full ${status === 0 ? "bg-green-500 text-green-950" : "bg-gray-500 text-gray-950"}`}
      >
        {status === 0 ? "Open" : "Closed"}
      </span>
    </div>
    <p className="text-sm text-gray-400 mt-2">
      Creator: <span className="font-mono">{creator.substring(0, 10)}...</span>
    </p>
  </button>
);
export default PollCard;
