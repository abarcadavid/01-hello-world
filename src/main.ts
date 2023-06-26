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

// Update zkApp with a transaction
const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.update(Field(9));
});
await txn1.prove();
await txn1.sign([senderKey]).send();

// Check the state of 'num' in the Square contract
const num1 = zkAppInstance.num.get();
console.log('Value should be 9: ', num1.toString());

// ---------------------------------
try {
  const txn2 = await Mina.transaction(senderAccount, () => {
    // We should update contract for 'num' to be 81. This will fail.
    zkAppInstance.update(Field(75));
  });
  await txn2.prove();
  await txn2.sign([senderKey]).send();
} catch (error: any) {
  console.log(`Error Message: ${error.message}`);
}
console.log('Shutting Down');
