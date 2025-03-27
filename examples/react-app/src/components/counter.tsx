import { useEffect, useState } from 'react';
import { useLogEvents } from '../hooks/use-log-events';
import { useWallet } from '../hooks/useWallet';
import { Counter } from '../types';

import type { CustomError } from '../utils/customError';

import { CHAIN_IDS } from 'fuels';
import { COUNTER_CONTRACT_ID, DEFAULT_AMOUNT } from '../config';
import { EXPLORER_URL } from '../config';
import Button from './button';
import ContractLink from './contract-link';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

const contract_id = {
  [CHAIN_IDS.fuel.testnet]:
    '0x7ba49998f7dd0a97e1be8d108f2d6a83765abfb107f84a35ab0fcf12382fa67b',
  [CHAIN_IDS.fuel.mainnet]:
    '0x111f1359fa87c260d1509ca7834091202d2f115e08141eecb5230fd3b47f37a0',
};

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
      const contract = new Counter(
        contract_id[await wallet.provider.getChainId()],
        wallet,
      );
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

    const counterContract = new Counter(
      contract_id[await wallet.provider.getChainId()],
      wallet,
    );

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
