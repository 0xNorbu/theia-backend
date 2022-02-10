import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ethers } from 'ethers';
import marketPlaceAbi from './marketplace.json';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('*/15 * * * * *')
  async handleCron() {
    const privateKey =
      '3a69ae02f0a4243c96aa51d59bb077eb78622e514c61db785b82775cb779e73e';

    const provider = new ethers.providers.JsonRpcProvider(
      'https://data-seed-prebsc-1-s1.binance.org:8545',
    );

    const walletWithProvider = new ethers.Wallet(privateKey, provider);
    const marketPlaceAddress = '0x00DC986ec13196f4b8e74AdeBF837489e8742c2B';
    const daiContract = new ethers.Contract(
      marketPlaceAddress,
      marketPlaceAbi,
      walletWithProvider,
    );

    const length = await daiContract.getRegisterAddressArrayLength();

    for (let i = 0; i < length; i++) {
      const address = await daiContract.registerAddressArray(i);
      const scenarioLock = await daiContract.scenario1Lock(address);
      if (scenarioLock) {
        const contractWithSigner = daiContract.connect(walletWithProvider);
        const tx = await contractWithSigner.updateToken2Qty(address, 1);
        console.log(tx);
      }
    }
  }
}
