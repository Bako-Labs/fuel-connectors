import { createConfig } from 'fuels';

export default createConfig({
  workspace: './contracts/',
  output: './src/types/',
  providerUrl: 'https://testnet.fuel.network/v1/graphql',
  privateKey: '0xde97d8624a438121b86a1956544bd72ed68cd69f2c99555b08b1e8c51ffd511c'
});
