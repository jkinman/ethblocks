import { ethers } from "ethers";

class EthersDataSource {
  private provider: ethers.Provider;
  protected eth: Array<ethers.Block> = [];
  constructor() {
    this.provider = new ethers.InfuraProvider(
      process.env.INFURA_NETWORK,
      process.env.INFURA_SECRET
    );
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getBlock(blockNumber: number | string): Promise<ethers.Block | null> {
    return await this.provider.getBlock(blockNumber);
  }

  async getBlockTransactions(
    block: ethers.Block | null
  ): Promise<Promise<ethers.TransactionResponse | null>[]> {
    const filledTransations: Array<Promise<ethers.TransactionResponse | null>> =
      [];

    block?.transactions.forEach((transaction: string) =>
      filledTransations.push(this.provider.getTransaction(transaction))
    );
    await Promise.all(filledTransations);
    return filledTransations;
  }
}

export default EthersDataSource;
