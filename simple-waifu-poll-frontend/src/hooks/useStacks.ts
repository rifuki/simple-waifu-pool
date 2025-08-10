// FILE: src/hooks/useStacks.ts
import { useState, useEffect } from "react";
import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
} from "@stacks/connect";
import type { UserData } from "@stacks/connect";
import { createPollOptions, voteOptions } from "../lib/contract";

const appConfig = new AppConfig(["store_write"]);
export const userSession = new UserSession({ appConfig });
const appDetails = { name: "Stacks Polling App", icon: "/vite.svg" };

export const useStacks = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      if (userSession.isSignInPending()) {
        userSession.handlePendingSignIn().then(setUserData);
      } else if (userSession.isUserSignedIn()) {
        setUserData(userSession.loadUserData());
      }
    } catch (e) {
      console.error(e);
      userSession.signUserOut();
    }
  }, []);

  const connectWallet = () =>
    showConnect({
      appDetails,
      onFinish: () => window.location.reload(),
      userSession,
    });
  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  const handleCreatePoll = async (
    question: string,
    options: string[],
    duration: number,
    onSuccess: () => void,
  ) => {
    await openContractCall({
      ...createPollOptions(question, options, duration),
      appDetails,
      onFinish: (data) => {
        alert("Poll created! TXID: " + data.txId);
        onSuccess(); // Panggil callback untuk navigasi
      },
      onCancel: () => alert("Transaction cancelled."),
    });
  };

  const handleVote = async (pollId: number, choice: number) => {
    await openContractCall({
      ...voteOptions(pollId, choice),
      appDetails,
      onFinish: () => {
        alert("Vote submitted!");
        window.location.reload(); // Reload untuk melihat hasil terbaru
      },
      onCancel: () => alert("Vote cancelled."),
    });
  };

  return {
    userData,
    connectWallet,
    disconnectWallet,
    handleCreatePoll,
    handleVote,
  };
};
