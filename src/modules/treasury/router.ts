export interface Vendor {
  id: string;
  name: string;
  serviceType: string;
  payoutMethod: "fiat_card" | "crypto_card" | "wallet";
  payoutAddress: string; // Bank account/Card alias if fiat, otherwise wallet address
  isVerified: boolean;
}

export interface Deposit {
  runnerId: string;
  amount: number; // in USDT or micro-GOAT
  status: "held" | "returned" | "forfeited";
}

// Mock Community Treasury State
export let treasuryBalance = 0;
export const heldDeposits: Deposit[] = [];

/**
 * Executes a vendor payout by reading preferred payout method.
 * x402 Direct on GOAT -> Vendor (if 'wallet')
 * x402 Direct on GOAT -> Bridge (if 'fiat_card' or 'crypto_card')
 */
export async function routeVendorPayment(vendor: Vendor, amount: number): Promise<{ txHash: string; status: string; destination: string }> {
  console.log(`[Agent Treasury] Routing ${amount} USDT to ${vendor.name} (${vendor.serviceType})...`);

  if (vendor.payoutMethod === "wallet") {
    // Standard x402 transaction on GOAT L2
    return executeX402Transfer(vendor.payoutAddress, amount);
  } else if (vendor.payoutMethod === "fiat_card") {
    // Send to Transak/Moonpay fiat off-ramp bridge
    return bridgeCryptoToFiatCard(vendor.payoutAddress, amount, "INR");
  } else {
    // Send to Crypto Card provider (e.g., Coinbase Card proxy address)
    return executeX402Transfer(vendor.payoutAddress, amount); // Behaves like wallet functionally
  }
}

/**
 * Handle Runner Deposit Return on verifiable check-in (via GPS hash)
 */
export async function returnRunnerDeposit(deposit: Deposit): Promise<string> {
  if (deposit.status !== "held") throw new Error("Deposit not held or already processed");
  
  deposit.status = "returned";
  console.log(`[Agent] Verifiable check-in complete. x402 deposit returned to runner ${deposit.runnerId}`);
  
  return `0x_mock_deposit_return_tx_${Math.random().toString(16).slice(2)}`;
}

/**
 * Handle no-show deposit forfeiture
 */
export async function forfeitNoShowDeposit(deposit: Deposit): Promise<void> {
  if (deposit.status !== "held") return;
  
  deposit.status = "forfeited";
  treasuryBalance += deposit.amount;
  console.log(`[Agent] Runner ${deposit.runnerId} marked as no-show. ${deposit.amount} USDT swept to treasury. Treasury balance: ${treasuryBalance} USDT.`);
}

// Private mocks
async function executeX402Transfer(destination: string, amount: number) {
  return {
    txHash: `0x_x402_GOAT_${Math.random().toString(16).slice(2)}`,
    status: "CONFIRMED_ON_CHAIN",
    destination: `Wallet: ${destination.substring(0, 8)}...`
  };
}

async function bridgeCryptoToFiatCard(bankAlias: string, amountCrypto: number, currency: string) {
  // Mock conversion rate: 1 USDT = ~83 INR
  const amountFiat = amountCrypto * 83.5;
  return {
    txHash: `tx_fiat_bridge_${Math.random().toString(16).slice(2)}`,
    status: "PROCESSING_TO_BANK",
    destination: `Fiat Card: ${bankAlias} (${amountFiat.toFixed(2)} ${currency})`
  };
}
