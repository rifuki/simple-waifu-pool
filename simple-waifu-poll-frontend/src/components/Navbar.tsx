// FILE: src/components/Navbar.tsx
import { useStacks } from "../hooks/useStacks";

interface NavbarProps {
  navigateToHome: () => void;
  navigateToCreate: () => void;
}

const Navbar = ({ navigateToHome, navigateToCreate }: NavbarProps) => {
  const { userData, connectWallet, disconnectWallet } = useStacks();
  const stxAddress = userData?.profile.stxAddress.testnet;

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <button onClick={navigateToHome} className="text-xl font-bold">
          🗳️ Stacks Polls
        </button>
        <button
          onClick={navigateToCreate}
          className="text-gray-300 hover:text-white"
        >
          Create Poll
        </button>
      </div>
      <div>
        {userData ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-mono bg-gray-700 px-2 py-1 rounded">
              {stxAddress?.substring(0, 5)}...
            </span>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-500 px-3 py-1 rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
