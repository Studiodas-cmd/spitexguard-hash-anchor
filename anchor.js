const { ethers } = require('ethers');

module.exports = async (req, res) => {
  // Solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito. Usa POST.' });
  }

  try {
    const { hash } = req.body;

    if (!hash) {
      return res.status(400).json({ error: 'Campo "hash" mancante nel body.' });
    }

    // Verifica base: deve essere una stringa hex valida (es. 64 caratteri SHA-256)
    const hashClean = hash.startsWith('0x') ? hash : '0x' + hash;

    // Provider Polygon Amoy
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);

    // Wallet dalla chiave privata (variabile d'ambiente, NON nel codice)
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

    // Invio transazione: a se stesso, con l'hash come payload "data"
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0n,
      data: hashClean,
    });

    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      hash: hashClean,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
