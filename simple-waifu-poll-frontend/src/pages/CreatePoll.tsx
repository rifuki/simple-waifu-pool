// FILE: src/pages/CreatePoll.tsx
import { useState } from "react";
import { useStacks } from "../hooks/useStacks";

interface CreatePollProps {
  navigateToHome: () => void;
}

const CreatePoll = ({ navigateToHome }: CreatePollProps) => {
  const { userData, connectWallet, handleCreatePoll } = useStacks();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddOption = () =>
    options.length < 5 && setOptions([...options, ""]);
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) {
      connectWallet();
      return;
    }
    if (question.trim() === "" || options.some((opt) => opt.trim() === "")) {
      alert("Question and all options must be filled.");
      return;
    }
    setIsLoading(true);
    try {
      // Kirim callback navigateToHome ke handleCreatePoll
      await handleCreatePoll(question, options, duration, navigateToHome);
    } catch (error) {
      alert("Failed to create poll.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Poll</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-800 p-6 rounded-lg"
      >
        <div>
          <label className="block mb-1">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border-gray-600 border"
            maxLength={80}
            required
          />
        </div>
        {options.map((option, index) => (
          <div key={index}>
            <label className="block mb-1">Option {index + 1}</label>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border-gray-600 border"
              maxLength={40}
              required
            />
          </div>
        ))}
        {options.length < 5 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="text-blue-400 hover:underline"
          >
            + Add Option
          </button>
        )}
        <div>
          <label className="block mb-1">
            Duration (in blocks, ~10 mins per 1 block)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full p-2 rounded bg-gray-700 border-gray-600 border"
            min="1"
            max="10000"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700 disabled:bg-gray-500 font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
};
export default CreatePoll;
