import { createConfig } from 'fuels';

export default createConfig({
  workspace: './contracts/',
  output: './src/types/',
  providerUrl: 'https://testnet.fuel.network/v1/graphql',
  privateKey:
    // Development wallet private key
    '0x718df4c72a8fab9265f805d65b9784f1d09388f9a92c093f15540637d34255ac',
});
