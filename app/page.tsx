'use client'
import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import "./globals.css";
import RPC from "./ethersRPC";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import {
  WalletConnectV2Adapter,
  getWalletConnectV2Settings,
} from "@web3auth/wallet-connect-v2-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { TorusWalletAdapter } from "@web3auth/torus-evm-adapter";
import { Flex, useColorModeValue, Spacer, Heading, Button, Container, Box, Text } from '@chakra-ui/react'
import loader from "./reggae-loader.svg";
import {nftAddress, nftAbi} from "./config";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_KEY || '';
const mainnetRpcEndpoint = process.env.NEXT_PUBLIC_ETHEREUM_RPC_ENPOINT_URL || '';
const goerliRpcEndpoint = process.env.NEXT_PUBLIC_GOERLI_RPC_ENPOINT_URL || '';

function App() {
  
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [torusPlugin, setTorusPlugin] = useState<TorusWalletConnectorPlugin | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEthBal, setUserEthBal] = useState<Number | null>(8.88888);
  const [currentNetworkName, setCurrentNetworkName] = useState<String | null>("Fakenet");
  const [loading, setLoading] = useState<Boolean>(false);
  
  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x1",
            rpcTarget: mainnetRpcEndpoint,
          },
          uiConfig: {
            appName: "Sugar",
            appLogo: "https://bafybeihplbv34hybwkmjzv4zrm3sfdjqvxoknoplldaav23cdbekrlats4.ipfs.w3s.link/w3hc-logo-circle.png",
            theme: "dark",
            loginMethodsOrder: ["apple", "google", "twitter"],
            defaultLanguage: "en",
            loginGridCol: 3,
            primaryButton: "externalLogin",
          },
          web3AuthNetwork: "testnet",
        });

        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "optional",
          },
          adapterSettings: {
            uxMode: "popup",
            whiteLabel: {
              name: "Sugar",
              logoLight: "https://bafybeihplbv34hybwkmjzv4zrm3sfdjqvxoknoplldaav23cdbekrlats4.ipfs.w3s.link/w3hc-logo-circle.png",
              logoDark: "https://bafybeihplbv34hybwkmjzv4zrm3sfdjqvxoknoplldaav23cdbekrlats4.ipfs.w3s.link/w3hc-logo-circle.png",
              defaultLanguage: "en",
              dark: true, 
            },
            mfaSettings: {
              deviceShareFactor: {
                enable: true,
                priority: 1,
                mandatory: true,
              },
              backUpShareFactor: {
                enable: true,
                priority: 2,
                mandatory: false,
              },
              socialBackupFactor: {
                enable: true,
                priority: 3,
                mandatory: false,
              },
              passwordFactor: {
                enable: true,
                priority: 4,
                mandatory: false,
              },
            },
          },
        });

        web3auth.configureAdapter(openloginAdapter);

        // const torusPlugin = new TorusWalletConnectorPlugin({
        //   torusWalletOpts: {},
        //   walletInitOptions: {
        //     whiteLabel: {
        //       theme: { isDark: true, colors: { primary: "#000000" } },
        //       logoDark: "https://bafybeihplbv34hybwkmjzv4zrm3sfdjqvxoknoplldaav23cdbekrlats4.ipfs.w3s.link/w3hc-logo-circle.png",
        //       logoLight: "https://bafybeihplbv34hybwkmjzv4zrm3sfdjqvxoknoplldaav23cdbekrlats4.ipfs.w3s.link/w3hc-logo-circle.png",
        //     },
        //     useWalletConnect: true,
        //     enableLogging: true,
        //   },
        // });
        // setTorusPlugin(torusPlugin);
        // await web3auth.addPlugin(torusPlugin);

        // // adding wallet connect v2 adapter
        // const defaultWcSettings = await getWalletConnectV2Settings(
        //   "eip155",
        //   [1, 137, 5],
        //   "04309ed1007e77d1f119b85205bb779d"
        // );
        // const walletConnectV2Adapter = new WalletConnectV2Adapter({
        //   adapterSettings: { ...defaultWcSettings.adapterSettings },
        //   loginSettings: { ...defaultWcSettings.loginSettings },
        // });

        // web3auth.configureAdapter(walletConnectV2Adapter);

        // // adding metamask adapter
        // const metamaskAdapter = new MetamaskAdapter({
        //   clientId,
        //   sessionTime: 3600, // 1 hour in seconds
        //   web3AuthNetwork: "testnet",
        //   chainConfig: {
        //     chainNamespace: CHAIN_NAMESPACES.EIP155,
        //     chainId: "0x1",
        //     rpcTarget: mainnetRpcEndpoint,
        //   },
        // });
        // // we can change the above settings using this function
        // metamaskAdapter.setAdapterSettings({
        //   sessionTime: 86400, // 1 day in seconds
        //   chainConfig: {
        //     chainNamespace: CHAIN_NAMESPACES.EIP155,
        //     chainId: "0x1",
        //     rpcTarget: mainnetRpcEndpoint,
        //   },
        //   web3AuthNetwork: "testnet",
        // });

        // // it will add/update  the metamask adapter in to web3auth class
        // web3auth.configureAdapter(metamaskAdapter);

        // const torusWalletAdapter = new TorusWalletAdapter({
        //   clientId,
        // });

        // // it will add/update  the torus-evm adapter in to web3auth class
        // web3auth.configureAdapter(torusWalletAdapter);

        setWeb3auth(web3auth);

        await web3auth.initModal();

        setProvider(web3auth.provider);
        
        if (web3auth.connected) {
          setLoggedIn(true);
        }

      } catch (error) {
        console.error(error);
      }
    };
   
    init();
    
  }, []);

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    // uiConsole(balance);
    setUserEthBal(Number(balance))
    return balance
  };

  const update = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const newChain = {
      chainId: "0x5",
      displayName: "Goerli",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      tickerName: "Goerli",
      ticker: "ETH",
      decimals: 18,
      rpcTarget: "https://rpc.ankr.com/eth_goerli",
      blockExplorer: "https://goerli.etherscan.io",
    };
    await web3auth?.addChain(newChain);
    await web3auth?.switchChain({ chainId: "0x5" });
    const bal = await getBalance()
    setUserEthBal(Number(bal));
    await getChainName()    


    uiConsole("Up to date");
  }

  useEffect(() => {
    try {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      update()
      // faucetCall()
    } catch(e) {
      console.log(e)
    }
  }, [provider]);

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    setLoggedIn(true);
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user.email);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  const showWCM = async () => {
    if (!torusPlugin) {
      uiConsole("torus plugin not initialized yet");
      return;
    }
    torusPlugin.showWalletConnectScanner();
  };

  const initiateTopUp = async () => {
    if (!torusPlugin) {
      uiConsole("torus plugin not initialized yet");
      return;
    }
    torusPlugin.initiateTopup("moonpay", {
      selectedAddress: "0x8cFa648eBfD5736127BbaBd1d3cAe221B45AB9AF",
      selectedCurrency: "USD",
      fiatValue: 100,
      selectedCryptoCurrency: "ETH",
      chainNetwork: "mainnet",
    });
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    console.log('chainId:', chainId)
    uiConsole(chainId);
  };

  const getChainName = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainName = await rpc.getChainName();
    setCurrentNetworkName(chainName)
    uiConsole(chainName);
  };

  // const addChain = async () => {
  //   if (!provider) {
  //     uiConsole("provider not initialized yet");
  //     return;
  //   }
  //   const newChain = {
  //     chainId: "0x5",
  //     displayName: "Goerli",
  //     chainNamespace: CHAIN_NAMESPACES.EIP155,
  //     tickerName: "Goerli",
  //     ticker: "ETH",
  //     decimals: 18,
  //     rpcTarget: "https://rpc.ankr.com/eth_goerli",
  //     blockExplorer: "https://goerli.etherscan.io",
  //   };
  //   await web3auth?.addChain(newChain);
  //   uiConsole("New Chain Added");
  // };

  // console.log('web3auth:', web3auth)

  const switchChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const newChain = {
      chainId: "0x5",
      displayName: "Goerli",
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      tickerName: "Goerli",
      ticker: "ETH",
      decimals: 18,
      rpcTarget: "https://rpc.ankr.com/eth_goerli",
      blockExplorer: "https://goerli.etherscan.io",
    };
    await web3auth?.addChain(newChain);
    await web3auth?.switchChain({ chainId: "0x5" });
    const bal = await getBalance()
    setUserEthBal(Number(bal));
    await getChainName()    
    console.log('switched to Goerli')
    // uiConsole("Switched to Goerli");
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    uiConsole(address);
  };

  const sendTransaction = async () => {
    setLoading(true)
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    uiConsole("Sending ETH...");
    const receipt = await rpc.sendTransaction();
    console.log("transfer:", receipt)
    uiConsole('tx hash: '+ receipt.hash);
    getBalance()
    setLoading(false)
  };

  const mint = async () => {
    setLoading(true)
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    uiConsole("Minting...");
    const mint = await rpc.mint(nftAddress, nftAbi);
    console.log("mint:", mint)
    uiConsole('mint tx hash: '+ mint.hash);
    getBalance()
    setLoading(false)
  };

  const faucetCall = async () => {
    setLoading(true)
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    uiConsole("Sending ETH...");
    const faucetCall = await rpc.faucetCall();
    console.log("faucetCall:", faucetCall)
    uiConsole('faucet tx hash: '+ faucetCall.hash);
    getBalance()
    setLoading(false)
  };
  

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <Text fontSize='18px' color='white'>You&apos;re connected to {currentNetworkName} and your balance is {userEthBal?.toFixed(5)} ETH.</Text>
          <br />
          <Button mt = {3} onClick={getUserInfo} colorScheme="blue" variant="outline" size='xs'>
            Get User Info
          </Button>
        {/* <div>
          <Button mt = {3} onClick={authenticateUser} colorScheme="blue" variant="outline" size='xs'>
            Get ID Token
          </Button>
        </div> */}
        {/* <div>
          <Button mt = {3} onClick={getChainId} colorScheme="blue" variant="outline" size='xs'>
            Get Chain ID
          </Button>
        </div> */}
        <div>
          <Button mt = {3} onClick={getChainName} colorScheme="blue" variant="outline" size='xs'>
            Get network name
          </Button>
        </div>
        
        {/* <div>
          <Button mt = {3} onClick={addChain} colorScheme="blue" variant="outline" size='xs'>
            Add Chain
          </Button>
        </div> */}
        <div>
          <Button mt = {3} onClick={switchChain} colorScheme="blue" variant="outline" size='xs'>
            Switch to Goerli
          </Button>
        </div>
        <div>
          <Button mt = {3} onClick={getAccounts} colorScheme="blue" variant="outline" size='xs'>
            Show my wallet address
          </Button>
        </div>
        {/* <div>
          <Button mt = {3} onClick={getBalance} colorScheme="blue" variant="outline" size='xs'>
            Get Balance
          </Button>
        </div> */}
        {/* <div>
          <Button mt = {3} onClick={signMessage} colorScheme="blue" variant="outline" size='xs'>
            Sign Message
          </Button>
        </div> */}
        <div>
          <Button mt = {3} onClick={sendTransaction} colorScheme="blue" variant="outline" size='xs'>
            Send Transaction
          </Button>
        </div>
        {/* <div>
          <Button mt = {3} onClick={getPrivateKey} colorScheme="blue" variant="outline" size='xs'>
            Get Private Key
          </Button>
        </div> */}
        <div>
          <Button mt = {3} onClick={faucetCall} colorScheme="pink" variant="solid" size='xs'>
            Get some ETH
          </Button>
        </div>
        <div>
          <Button mt = {5} onClick={mint} colorScheme="green" variant="outline" size='md'>
            Mint
          </Button>
        </div>
        <br />
      </div>
        
      <div id="console" style={{ whiteSpace: "pre-line" }}>

        <Text style={{ whiteSpace: "pre-line" }} fontSize='18px' color='white'></Text>
     
      </div>
      {loading && 
      <Image priority alt="loader" src={loader}/>}
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      <Text fontSize='18px' color='white'>Hello, please login.</Text>
    </button>
  );

  return (
    <>
    <Flex as="header" bg={useColorModeValue('blackAlpha.100', 'blackAlpha.100')} px={4} py={5} mb={8} alignItems="center">
      <Spacer />
      <Flex alignItems="center" gap={4}>
        {loggedIn ? 
          <Button colorScheme="purple" variant="ghost" onClick={logout} size='sm'>
            Logout
          </Button> :
          <Button colorScheme="purple" variant="ghost" onClick={login} size='sm'>
            Login
          </Button>}
      </Flex>
    </Flex>
   
    <Container maxW='5xl' bg='black' centerContent>
      <Box padding='4' bg='black' color='black' w='80%'>
      {loggedIn ? loggedInView : unloggedInView}
      </Box> 
    </Container></>
  );
}

export default App;