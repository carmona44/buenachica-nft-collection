import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {

    const [walletConnected, setWalletConnected] = useState(false);
    const [presaleStarted, setPresaleStarted] = useState(false);
    const [presaleEnded, setPresaleEnded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

    const web3ModalRef: any = useRef();

    const presaleMint = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            const tx = await nftContract.presaleMint({
                value: utils.parseEther("0.005"),
            });

            setLoading(true);
            await tx.wait();
            setLoading(false);

            window.alert("You successfully minted a BuenaChica!");
        } catch (err) {
            console.error(err);
        }
    };

    const publicMint = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            const tx = await nftContract.mint({
                value: utils.parseEther("0.005"),
            });

            setLoading(true);
            await tx.wait();
            setLoading(false);

            window.alert("You successfully minted a BuenaChica!");
        } catch (err) {
            console.error(err);
        }
    };

    const connectWallet = async () => {
        try {
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (err) {
            console.error(err);
        }
    };

    const startPresale = async () => {
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
            const tx = await nftContract.startPresale();

            setLoading(true);
            await tx.wait();
            setLoading(false);

            await checkIfPresaleStarted();
        } catch (err) {
            console.error(err);
        } setPresaleStarted
    };

    const checkIfPresaleStarted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _presaleStarted = await nftContract.presaleStarted();

            if (!_presaleStarted) {
                await getOwner();
            }
            setPresaleStarted(_presaleStarted);

            return _presaleStarted;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const checkIfPresaleEnded = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _presaleEnded = await nftContract.presaleEnded();
            const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));

            if (hasEnded) {
                setPresaleEnded(true);
            } else {
                setPresaleEnded(false);
            }

            return hasEnded;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const getOwner = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _owner = await nftContract.owner();
            const signer: any = await getProviderOrSigner(true);
            const address = await signer.getAddress();

            if (address.toLowerCase() === _owner.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (err: any) {
            console.error(err.message);
        }
    };

    const getTokenIdsMinted = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _tokenIds = await nftContract.tokenIds();

            setTokenIdsMinted(_tokenIds.toString());
        } catch (err) {
            console.error(err);
        }
    };

    const getProviderOrSigner = async (needSigner = false) => {

        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);
        const { chainId } = await web3Provider.getNetwork();

        if (chainId !== 5) {
            window.alert("Change the network to Goerli");
            throw new Error("Change network to Goerli");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }

        return web3Provider;
    };

    useEffect(() => {

        if (!walletConnected) {
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();

            const _presaleStarted = checkIfPresaleStarted();
            // @ts-ignore
            if (_presaleStarted) {
                checkIfPresaleEnded();
            }

            getTokenIdsMinted();

            const presaleEndedInterval = setInterval(async function () {
                const _presaleStarted = await checkIfPresaleStarted();
                if (_presaleStarted) {
                    const _presaleEnded = await checkIfPresaleEnded();
                    if (_presaleEnded) {
                        clearInterval(presaleEndedInterval);
                    }
                }
            }, 5 * 1000);

            setInterval(async function () {
                await getTokenIdsMinted();
            }, 5 * 1000);
        }
    }, [walletConnected]);

    const renderButton = () => {

        if (!walletConnected) {
            return (
                <button onClick={connectWallet} className={styles.button}>
                    Conecta tu wallet
                </button>
            );
        }

        if (loading) {
            return <button className={styles.button}>Cargando...</button>;
        }

        if (isOwner && !presaleStarted) {
            return (
                <button className={styles.button} onClick={startPresale}>
                    ¡Comenzar preventa!
                </button>
            );
        }

        if (!presaleStarted) {
            return (
                <div>
                    <div className={styles.description}>La preventa no ha comenzado</div>
                </div>
            );
        }

        if (presaleStarted && !presaleEnded) {
            return (
                <div>
                    <div className={styles.description}>
                        ¡¡¡La preventa ha comenzado!!! Si te apuntaste a la whitelist, mintea tu BuenaChica en la preventa 🥳
                    </div>
                    <button className={styles.button} onClick={presaleMint}>
                        Mintear 🚀
                    </button>
                </div>
            );
        }

        if (presaleStarted && presaleEnded) {
            return (
                <button className={styles.button} onClick={publicMint}>
                    Venta pública 🚀
                </button>
            );
        }
    };

    const renderMintedCount = () => {
        if (walletConnected && presaleStarted) {
            return (
                <div className={styles.description}>
                    {tokenIdsMinted}/4 han sido minteados.
                </div>
            );
        }
    }

    return (
        <div>
            <Head>
                <title>BuenaChica 🐶 Collection</title>
                <meta name="description" content="BuenaChica-Collection" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.main}>
                <div className={styles.content}>
                    <h1 className={styles.title}>¡Bienvenido a la colección NFT BuenaChica 🐶!</h1>
                    <div className={styles.description}>
                        Como ya comentamos en el lanzamiento de la Whitelist,
                        BuenaChica 🐶 es una colección de NFTs que hace referencia
                        a una gran mascota y que es símbolo de una gran amistad.
                        Los holders de estos NFTs podrán participar en nuestra próxima ICO
                        y en las votaciones de la DAO llamada voDkAO.
                        <br></br>
                        <br></br>
                        Por fin ha llegado el momento de CONSEGUIRLOS. Si te apuntaste a la Whitelist
                        participa en la preventa y si no... puedes participar en la ¡venta pública!
                    </div>
                    {renderMintedCount()}
                    {renderButton()}
                </div>
                <div className={styles.picture}>
                    <img className={styles.image} src="./buenaschicas/4.png" />
                </div>
            </div>

            <footer className={styles.footer}>
                Made with ❤️ by Carmona44
            </footer>
        </div >
    );
}