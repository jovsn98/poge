import * as crypto from 'crypto';

class Transaction {
    constructor(
        public amount: number,
        public payer: string,
        public payee: string 
    ) {}

    toString() {
        return JSON.stringify(this);
    }
}

class Block {

    public numOnlyUsedOnce = Math.round(Math.random() * 999999999);

    constructor(
        public prevHash: string,
        public transaction: Transaction,
        public ts = Date.now()
    ) {}

    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex')
    }
}

class Chain {

    // Singleton instance as we only want 1 chain
    public static instance = new Chain();

    // The chain is a series of linked blocks
    chain: Block[];

    // Create genesis block
    constructor() {
        this.chain = [new Block('', new Transaction(100, 'genesis', 'godwin'))];
    }

    // Return the last block in the chain
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    mine(nonce: number) {
        let solution = 1;
        console.log('You are mining your transaction...');

        while(true) {
            const hash = crypto.createHash('MD5');
            hash.update((nonce + solution).toString()).end();

            const attempt = hash.digest('hex');

            if (attempt.substr(0, 4) === '0000') {
                console.log(`---> Solved transaction with solution: ${solution}. Block is confirmed!\n`);

                return solution;
            }


            solution +=1;
        }
        
    }

    addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer) {

        console.log("Sending Poge...")

        const verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());

        const isValid = verifier.verify(senderPublicKey, signature);

        if (isValid) {
            console.log("Transaction is valid!")

            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.numOnlyUsedOnce);
            this.chain.push(newBlock);
        }
    }
}
class Wallet {

    public publicKey: string;
    public privateKey: string;

    // Generate key pair when a new wallet is created
    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }

    // Send money from users wallet to another
    sendMoney(amount: number, payeePublicKey: string) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();

        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}

const agp = new Wallet();
const jz = new Wallet();
const jb = new Wallet();

agp.sendMoney(50, jz.publicKey);
jz.sendMoney(23, jb.publicKey);
jb.sendMoney(5, jz.publicKey);

console.log(Chain.instance)