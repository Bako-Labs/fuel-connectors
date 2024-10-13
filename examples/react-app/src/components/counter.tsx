import { useEffect, useState } from 'react';
import { useLogEvents } from '../hooks/use-log-events';
import { useWallet } from '../hooks/useWallet';
import { Counter } from '../types';

import type { CustomError } from '../utils/customError';

import { COUNTER_CONTRACT_ID, DEFAULT_AMOUNT } from '../config';
import { EXPLORER_URL } from '../config';
import Button from './button';
import ContractLink from './contract-link';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';
import {CHAIN_IDS} from "fuels";

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

const contract_id = {
  [CHAIN_IDS.fuel.testnet]: '0x32a71b9b4b8a3ea8ba5a551b494ef7df5ed2d238c25e5f8129d1343df1ee71f5',
  [CHAIN_IDS.fuel.mainnet]: '0x906549b37eaeedf722c78cabf251af5c39f59624d41305dae49c6c790baa8521',
}

export default function ContractCounter({ isSigning, setIsSigning }: Props) {
  const { balance, wallet, refetchBalance } = useWallet();

  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const [isLoading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  const hasBalance = balance?.gte(DEFAULT_AMOUNT);

  useLogEvents();

  useEffect(() => {
    if (wallet) {
      getCount();
    }
  }, [wallet]);

  return (
    <div>
      <Feature title="Counter Contract">
        <code>{counter}</code>
        <div className="space-x-2">
          <Button
            onClick={increment}
            disabled={isLoading || !hasBalance || isSigning}
            loading={isLoading}
            loadingText="Incrementing..."
          >
            Increment
          </Button>
          <Notification
            setOpen={() => setToast({ ...toast, open: false })}
            {...toast}
          />
        </div>
      </Feature>
      <ContractLink />
    </div>
  );

  async function increment() {
    if (wallet) {
      setLoading(true);
      setIsSigning(true);
      const contract = new Counter(contract_id[wallet.provider.getChainId()], wallet);
      try {
        const { waitForResult } = await contract.functions
          .increment_counter()
          .call();

        setToast({
          open: true,
          type: 'success',
          children: 'Transaction submitted!',
        });

        getCount();

        if (waitForResult) {
          async function checkResult() {
            const tx = await waitForResult();

            await getCount();
            setToast({
              open: true,
              type: 'success',
              children: (
                <p>
                  Counter incremented! View it on the{' '}
                  <a
                    href={`${EXPLORER_URL}/tx/${tx.transactionId}`}
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    block explorer
                  </a>
                </p>
              ),
            });

            refetchBalance();
            setLoading(false);
            setIsSigning(false);
          }

          checkResult();
        }
      } catch (err) {
        const error = err as CustomError;

        console.error('error sending transaction...', error.message);
        setToast({
          open: true,
          type: 'error',
          children: `The counter could not be incremented: ${error.message.substring(
            0,
            32,
          )}...`,
        });
        setLoading(false);
        setIsSigning(false);
      }
    }
  }

  async function getCount() {
    if (!wallet) return;

    const counterContract = new Counter(COUNTER_CONTRACT_ID, wallet);

    try {
      const { value } = await counterContract.functions
        .get_count()
        .txParams({ gasLimit: 100_000 })
        .get();
      setCounter(value.toNumber());
    } catch (error) {
      console.error(error);
    }
  }
}
