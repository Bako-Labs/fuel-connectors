import { useNetwork, useSelectNetwork } from '@fuels/react';
import { useMemo } from 'react';
import Button from './button.tsx';

export const Network = () => {
  const { network, isLoading } = useNetwork();
  const { selectNetwork, isPending } = useSelectNetwork();

  const name = useMemo(() => {
    if (network?.chainId === 9889) return 'Mainnet';
    return 'Testnet';
  }, [network]);

  return (
    <div className="w-full flex justify-between items-center space-y-6">
      {isLoading ? (
        <div className="w-[120px] h-[40px] animate-pulse bg-gray-800" />
      ) : (
        <>
          <span className="block bg-green-900/50 text-green-400/60 font-semibold py-1 px-2 rounded-md">
            {name}
          </span>
          <Button
            onClick={() => {
              selectNetwork({
                chainId: network?.chainId === 9889 ? 0 : 9889,
                url:
                  network?.chainId === 9889
                    ? 'https://testnet.fuel.network/v1/graphql'
                    : 'https://mainnet.fuel.network/v1/graphql',
              });
            }}
            className="mt-0"
            disabled={isLoading || isPending}
          >
            Switch
          </Button>
        </>
      )}
    </div>
  );
};
