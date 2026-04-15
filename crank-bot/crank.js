/**
 * Taphit Crank Bot
 * Watches for expired orders and settles them automatically.
 * Deploy on Railway/Render.
 */
require("dotenv").config();
const { Connection, Keypair, Transaction, PublicKey } = require("@solana/web3.js");

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "Taphit1111111111111111111111111111111111111");
// In production, load from service role key or env
const CRANK_KEYPAIR = Keypair.generate(); // Replace with actual key

const connection = new Connection(RPC_URL, "confirmed");

async function crank() {
  // In production: query Supabase for orders where status='pending' AND expiry_timestamp < NOW()
  // For now, this is a skeleton

  const expired = [];

  for (const order of expired) {
    try {
      // Build settle transaction
      // const tx = new Transaction();
      // tx.add(new TransactionInstruction({...}));
      // const sig = await connection.sendTransaction(tx, [CRANK_KEYPAIR]);
      // await connection.confirmTransaction(sig);
      console.log(`[CRANK] Settled order ${order.id}`);
    } catch (err) {
      console.error(`[CRANK] Failed to settle order ${order.id}:`, err.message);
      // Retry up to 3 times with exponential backoff
    }
  }
}

// Run every 1 second
setInterval(crank, 1000);
console.log("🤖 Taphit Crank Bot started");
