import { Square } from '../src/Square.js';
import { Field, Mina, PrivateKey, AccountUpdate } from 'snarkyjs';

console.log('SnarkyJS loaded');

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

// Create a private&publick key pair. Public key will be the zk app address
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// Create an instance of Square contract, deploy to zk app address
const zkAppInstance = new Square(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});

await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// Get the initial state of the contract
const num0 = zkAppInstance.num.get();
console.log('State after Init: ', num0.toString());

console.log('Shutting Down');
