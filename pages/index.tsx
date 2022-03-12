import type { NextPage } from 'next'
import React from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { providers, utils } from "ethers";
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import Axios from "axios";
import { hashMessage, recoverAddress } from "../lib/eth_utils";
import { EthResponse, NonceResponse, Status } from '@gotrue/types';

const gotrueUrl = process.env.NEXT_PUBLIC_GOTRUE_URL;

const Home: NextPage = () => {
  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID,
        },
      },
    },
  });

  const [chainId, setChainId] = React.useState<number>(1);
  const [provider, setProvider] = React.useState<providers.Web3Provider>();
  const [address, setAddress] = React.useState<string>();
  const [account, setAccount] = React.useState<EthResponse>();
  const [status, setStatus] = React.useState<Status>();

  function reset() {
    console.log("reset");
    setProvider(undefined);
    setChainId(1);
    setAccount(undefined);
    setAddress(undefined);
    setStatus("UNKNOWN")
    web3Modal.clearCachedProvider();
  }

  async function connect() {
    if (!process.env.NEXT_PUBLIC_INFURA_ID) {
      throw new Error("Missing Infura Id");
    }
    try {
      const web3Provider = await web3Modal.connect();

      web3Provider.on("disconnect", (...params: any[]) => {
        console.log(params)
      });

      const accounts = (await web3Provider.enable()) as string[];
      setAddress(accounts[0]);
      setChainId(web3Provider.chainId);

      const provider = new providers.Web3Provider(web3Provider);
      setProvider(provider);
      setStatus("CONNECTED")
    } catch (e) {
      toast.error('Connection Aborted!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });

      reset();
    }
  }

  async function donate() {
    if (!provider) {
      throw new Error("Provider not connected");
    }
    const params = [{
      from: address,
      to: "0x31CcF01d1819bebD90072B7D8e5F2Bb6438eba88",
      value: utils.parseUnits('0.005', 'ether').toHexString()
    }];
    await provider.send('eth_sendTransaction', params)
  }

  async function login() {
    if (!process.env.NEXT_PUBLIC_GOTRUE_URL) {
      throw new Error("Missing GoTrue URL");
    }
    if (!provider) {
      toast.error('Please Connect Web3 First!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });

      reset();

      return;
    }
    try {
      const res = await Axios.post<NonceResponse>(`${gotrueUrl}/nonce`, {
        wallet_address: address,
        chain_id: chainId.toString(),
        url: window.location.href
      })
  
      if(!(res.status >= 200 && res.status < 300)) {
        toast.error('Failed to fetch nonce from Gotrue; please try again!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        });
        reset();
        return;
      }
  
      const sig = await provider.send("personal_sign", [res.data.nonce, address]);
      console.log("Signature", sig);
      const sigAddress = recoverAddress(sig, hashMessage(res.data.nonce))
      console.log("recoveredAddress", sigAddress)
      console.log("isValid", sigAddress === address);
  
      const ethRes = await Axios.post<EthResponse>(`${gotrueUrl}/eth`, {
        nonce_id: res.data.id,
        signature: sig
      });
  
      if(!(res.status >= 200 && res.status < 300)) {
        toast.error('Failed to authenticate with GoTrue; please try again!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
        });
        reset();
        return;
      }

      setAccount(ethRes.data)
      setStatus("AUTHENTICATED")
    } catch (e) {
      toast.error('Connection Aborted!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });

      reset();
    }
  }

  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <h1 className='text-xl mb-4'>{provider ? "Authenticated with Supabase & Authenticated with Web3Modal" : "Login with Supabase & Web3Modal"}</h1>
      {status == "AUTHENTICATED" && account && <div className='mb-4 flex justify-center items-center space-x-2'>
        <p>Supabase knows you as: </p>
        <code className='px-2 py-1 bg-gray-200 text-red-400 rounded hidden md:flex'>
          {account.user.id}
        </code>
      </div>}
      <div className='flex flex-row space-x-4'>
        <span className="relative z-0 inline-flex shadow-sm rounded-md space-x-2">
          <button
            onClick={connect}
            disabled={status == "CONNECTED" || status == "AUTHENTICATED"}
            type="button"
            className={status == "CONNECTED" || status == "AUTHENTICATED" ? 'relative inline-flex items-center px-6 py-4 rounded-md border border-gray-300 bg-gray-200 text-sm font-medium text-gray-700 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500' : "relative inline-flex items-center px-6 py-4 rounded-md border border-blue-300 bg-blue-200 text-sm font-medium text-blue-700 hover:bg-blue-300 hover:border-blue-400 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"}
          >
            Connect Wallet
          </button>
          <button
            onClick={login}
            disabled={status != "CONNECTED"}
            type="button"
            className={status != "CONNECTED" ? 'relative inline-flex items-center px-6 py-4 rounded-md border border-gray-300 bg-gray-200 text-sm font-medium text-gray-700 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500' : `relative inline-flex items-center px-6 py-4 rounded-md border border-green-300 bg-green-200 text-sm font-medium text-green-700 hover:bg-green-300 hover:border-green-400 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
          >
            Login
          </button>
        </span>
        {status == "AUTHENTICATED" && <div className='flex flex-row space-x-2'>
          <button
            onClick={reset}
            type="button"
            className={`relative inline-flex items-center px-6 py-4 rounded-md border border-red-300 bg-red-200 text-sm font-medium text-red-700 hover:bg-red-300 hover:border-red-400 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
          >
            Reset
          </button>
          <button
            onClick={donate}
            type="button"
            className="relative inline-flex items-center px-6 py-4 rounded-md border border-pink-300 bg-pink-200 text-sm font-medium text-pink-700 hover:bg-pink-300 hover:border-pink-400 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
            Donate 💖
          </button>
        </div>}
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(Home), {
  ssr: false
})
