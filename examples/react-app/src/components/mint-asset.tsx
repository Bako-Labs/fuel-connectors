import {bn, CHAIN_IDS} from 'fuels';
import { useState } from 'react';
import { useLogEvents } from '../hooks/use-log-events';
import { useWallet } from '../hooks/useWallet';
import { NativeAssetContract } from '../types';
import type { CustomError } from '../utils/customError';
import Button from './button';
import ContractLink from './contract-link';
import Feature from './feature';
import Notification, { type Props as NotificationProps } from './notification';

export const DEFAULT_AMOUNT = bn.parseUnits('0.0001');

interface Props {
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

const BAKO_TOKEN_SUB_ID =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
const UNKNOWN_TOKEN_SUB_ID =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

const contract_id = {
  [CHAIN_IDS.fuel.testnet]: '0x22384bcb3aab09efc946f3c2cf6344e6342f32ee12fbf7eed4e52444b50b1198',
  [CHAIN_IDS.fuel.mainnet]: '0xf1dd0c137edf17cb46db73e6a5674a50e94623c546de677f209aa33e4316e48e',
}

export default function MinterCounter({ isSigning, setIsSigning }: Props) {
  const { balance, wallet } = useWallet();

  const [toast, setToast] = useState<Omit<NotificationProps, 'setOpen'>>({
    open: false,
  });

  const [isLoading, setLoading] = useState(false);

  const hasBalance = balance?.gte(DEFAULT_AMOUNT);

  useLogEvents();

  async function increment(subId: string) {
    if (wallet) {
      setLoading(true);
      setIsSigning(true);
      try {
        const contract = new  NativeAssetContract(
          contract_id[wallet.provider.getChainId()],
          wallet,
        );

        const { waitForResult } = await contract.functions
          .mint({ Address: { bits: wallet.address.toB256() } }, subId, bn(1))
          .call();

        if (waitForResult) {
          async function checkResult() {
            const tx = await waitForResult();

            setToast({
              open: true,
              type: 'success',
              children: (
                <p>
                  Counter incremented! View it on the{' '}
                  <a
                    href={`https://app.fuel.network/tx/${tx.transactionId}`}
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    block explorer
                  </a>
                </p>
              ),
            });
          }

          checkResult();
        }
        setToast({
          open: true,
          type: 'success',
          children: 'Minted Token',
        });
      } catch (err) {
        const error = err as CustomError;
        console.log('error', error);

        console.error('error sending transaction...', error.message);
        setToast({
          open: true,
          type: 'error',
          children: `The minting progress gone wrong: ${error.message.substring(
            0,
            32,
          )}...`,
        });
      } finally {
        setLoading(false);
        setIsSigning(false);
      }
    }
  }

  return (
    <div>
      <Feature title="Mint Token">
        <div className="space-x-2 my-4">
          <Button
            onClick={() => increment(BAKO_TOKEN_SUB_ID)}
            disabled={isLoading || !hasBalance || isSigning}
            loading={isLoading}
            loadingText="Minting..."
          >
            Mint Bako Token
          </Button>
          <Button
            onClick={() => increment(UNKNOWN_TOKEN_SUB_ID)}
            disabled={isLoading || !hasBalance || isSigning}
            loading={isLoading}
            loadingText="Minting..."
          >
            Mint Unknown Token
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
}
