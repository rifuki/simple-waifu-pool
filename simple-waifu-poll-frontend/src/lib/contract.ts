// src/lib/contract.ts
import { STACKS_TESTNET } from "@stacks/network";
import {
  cvToValue,
  fetchCallReadOnlyFunction,
  uintCV,
  stringAsciiCV,
  someCV,
  noneCV,
} from "@stacks/transactions";
import type { OptionalCV, StringAsciiCV, UIntCV } from "@stacks/transactions";
import { CONTRACT_ADDRESS, CONTRACT_NAME } from "./constants";

const network = STACKS_TESTNET;

/**
 * Mendapatkan ID polling berikutnya (total polling yang dibuat).
 * Anda perlu menambahkan fungsi (define-read-only (get-next-poll-id) (var-get next-poll-id)) di contract.
 */
export const fetchNextPollId = async (): Promise<number> => {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-next-poll-id", // Pastikan fungsi ini ada di contract Anda
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  return cvToValue(result);
};

/**
 * Mendapatkan detail lengkap dari satu polling
 */
export const fetchPollDetails = async (pollId: number) => {
  // 1. Ambil data utama polling
  const pollDataCV = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-poll",
    functionArgs: [uintCV(pollId)],
    senderAddress: CONTRACT_ADDRESS,
    network,
  });
  const pollData = cvToValue(pollDataCV);
  if (!pollData) return null;

  // 2. Ambil semua opsi dan jumlah suaranya
  const options = [];
  for (let i = 0; i < pollData["option-count"]; i++) {
    const optionCV = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-option",
      functionArgs: [uintCV(pollId), uintCV(i)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });
    const countCV = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-vote-count",
      functionArgs: [uintCV(pollId), uintCV(i)],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });
    options.push({
      text: cvToValue(optionCV).text,
      votes: cvToValue(countCV).value, // get-vote-count returns (ok uint)
    });
  }

  return { ...pollData, options };
};

/**
 * Menyiapkan options untuk transaksi `create-poll`
 */
export const createPollOptions = (
  question: string,
  options: string[],
  duration: number,
) => {
  const functionArgs: (StringAsciiCV | OptionalCV<StringAsciiCV> | UIntCV)[] = [
    stringAsciiCV(question),
  ];

  // Opsi wajib (minimal 2)
  options.slice(0, 2).forEach((opt) => functionArgs.push(stringAsciiCV(opt)));

  // Opsi opsional (hingga 5)
  for (let i = 2; i < 5; i++) {
    functionArgs.push(
      options[i] ? someCV(stringAsciiCV(options[i])) : noneCV(),
    );
  }

  functionArgs.push(uintCV(duration));

  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-poll",
    functionArgs,
  };
};

/**
 * Menyiapkan options untuk transaksi `vote`
 */
export const voteOptions = (pollId: number, choice: number) => {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "vote",
    functionArgs: [uintCV(pollId), uintCV(choice)],
  };
};
