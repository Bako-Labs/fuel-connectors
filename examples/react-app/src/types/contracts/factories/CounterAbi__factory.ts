/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.93.0
  Forc version: 0.62.0
  Fuel-Core version: 0.31.0
*/

import { Interface, Contract, ContractFactory } from "fuels";
import type { Provider, Account, AbstractAddress, BytesLike, DeployContractOptions, StorageSlot, DeployContractResult } from "fuels";
import type { CounterAbi, CounterAbiInterface } from "../CounterAbi";

const _abi = {
  "encoding": "1",
  "types": [
    {
      "typeId": 0,
      "type": "u64",
      "components": null,
      "typeParameters": null
    }
  ],
  "functions": [
    {
      "inputs": [],
      "name": "get_count",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read"
          ]
        }
      ]
    },
    {
      "inputs": [],
      "name": "increment_counter",
      "output": {
        "name": "",
        "type": 0,
        "typeArguments": null
      },
      "attributes": [
        {
          "name": "storage",
          "arguments": [
            "read",
            "write"
          ]
        }
      ]
    }
  ],
  "loggedTypes": [],
  "messagesTypes": [],
  "configurables": []
};

const _storageSlots: StorageSlot[] = [
  {
    "key": "6e3c7b4f69bbff7132c3c3a62883a6868f47b0bc2a7f21605f29038cd9a5e05f",
    "value": "0000000000000000000000000000000000000000000000000000000000000000"
  }
];

export const CounterAbi__factory = {
  abi: _abi,

  storageSlots: _storageSlots,

  createInterface(): CounterAbiInterface {
    return new Interface(_abi) as unknown as CounterAbiInterface
  },

  connect(
    id: string | AbstractAddress,
    accountOrProvider: Account | Provider
  ): CounterAbi {
    return new Contract(id, _abi, accountOrProvider) as unknown as CounterAbi
  },

  async deployContract(
    bytecode: BytesLike,
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<DeployContractResult<CounterAbi>> {
    const factory = new ContractFactory(bytecode, _abi, wallet);

    return factory.deployContract<CounterAbi>({
      storageSlots: _storageSlots,
      ...options,
    });
  },
}
