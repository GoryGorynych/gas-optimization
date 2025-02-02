const { ethers, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");
const { ZeroAddress, MaxUint256 } = require("ethers");

const contracts = ["RawLottery", "OptimizedLottery"];
// const contracts = ["OptimizedLottery"]

contracts.forEach((contract) => {
    describe(contract, function() {
        let signers;
        let deployer;
        let contractInstance;
        const name = "Dummy lottery";
        const winnerPercent = 60;
        const minParticipants = 2;
        const MAX_PARTICIPANTS = 10;


        this.beforeEach(async function (){
            //Accounts
            signers = await ethers.getSigners();
            ({deployer} = await getNamedAccounts());

            //Contract
            const factory = await ethers.getContractFactory(contract);
            contractInstance = await factory.deploy(name, winnerPercent, minParticipants);
            await contractInstance.waitForDeployment();
        });

        context("Initialization", async function () {
            it ("correctly constructs", async () => {
                expect(await contractInstance.name()).to.equal(name);
                expect(await contractInstance.winnerPercent()).to.equal(winnerPercent);
                if (contract === "OptimizedLottery") {
                    expect(await contractInstance.MIN_PARTICIPANTS()).to.equal(minParticipants);
                    expect(await contractInstance.OWNER()).to.equal(deployer);
                } else {
                    expect(await contractInstance.min_participants()).to.equal(minParticipants);
                    expect(await contractInstance.owner()).to.equal(deployer);
                }
            });
            
            it("should revert if minimum participants is 0", async function () {
                const MyContract = await ethers.getContractFactory(contract);
        
                await expect(MyContract.deploy("TestName", 1, 0))
                    .to.be.revertedWith("Should be 1 participants minimum");
            });
        });

        context("Single enter lottery", async function () {
            it("should correctly apply bet from owner", async () => {
                const bet = 200;
                await contractInstance.enterLottery(bet);
                expect(await contractInstance.getPrizePool()).to.equal(bet);
                expect(await contractInstance.getParticipants()).to.include(deployer);
            });

            it("should correctly apply bet from other user", async () => {
                const bet = 300;
                const otherUser = signers[1];
                await contractInstance.connect(otherUser).enterLottery(bet);
                expect(await contractInstance.getPrizePool()).to.equal(bet);
                expect(await contractInstance.getParticipants()).to.include(otherUser.address);
            });

            it("should revert if bet equals 0", async () => {
                const bet = 0;
                await expect(contractInstance.enterLottery(bet)).to.be.reverted;
            });


            it("should throw a error with INVALID_ARGUMENT code", async () => {
                const bet = -10;
                try {
                    await contractInstance.enterLottery(bet);
                } catch (error) {
                    expect(error.code).to.equal("INVALID_ARGUMENT");
                }
            });

            it("should revert if bet equals maximum uint256 value", async function () {
                await expect(contractInstance.enterLottery(MaxUint256))
                    .to.be.revertedWith("Bet exceeds maximum value");
            });

            it("should revert if re-entry same participant", async function () {
                await contractInstance.enterLottery(100);
                await expect(contractInstance.enterLottery(211)).to.be.reverted;
            });

        });

        context("Multiple enter lottery", async function () {
            it("should correctly multiple apply bet", async () => {
                const accounts = signers.slice(0, 3).map(signer => signer.address);
                const bets = [1233, 373, 22990];
                const expectTotal = bets.reduce((sum, current) => sum + current, 0);
                
                await contractInstance.multiEnterLottery(accounts, bets);

                expect(await contractInstance.getPrizePool()).to.equal(expectTotal);
                expect(await contractInstance.getParticipants()).to.have.lengthOf(3);
            });

            it("should revert if different number of accounts and bets", async () => {
                const accounts = signers.slice(0, 3).map(signer => signer.address);
                const bets = [122, 433];
        
                await expect(contractInstance.multiEnterLottery(accounts, bets)).to.be.reverted;
            });

            it("should revert if multi apply is not owner ", async () => {
                const accounts = signers.slice(0, 3).map(signer => signer.address);
                const bets = [1288, 433, 388200];
                const otherUser = signers[1];
        
                await expect(contractInstance.connect(otherUser).multiEnterLottery(accounts, bets)).to.be.revertedWith("Caller is not the owner");
            });

            it("should revert if empty accounts", async () => {
                const accounts = [];
                const bets = [];
                
                await expect(contractInstance.multiEnterLottery(accounts, bets)).to.be.reverted;
            });

            it("should revert if zero account", async () => {
                const accounts = [ZeroAddress];
                const bets = [100];
                
                await expect(contractInstance.multiEnterLottery(accounts, bets)).to.be.reverted;
            });

            it("should revert Participant limit reached", async () => {
                const accounts = signers.slice(0, MAX_PARTICIPANTS + 1).map(signer => signer.address);
                const bets = [];
                for (let i = 1; i <= MAX_PARTICIPANTS + 1; i++) {
                    bets.push(i);
                }
                
                await expect(contractInstance.multiEnterLottery(accounts, bets)).to.be.revertedWith("Participant limit reached");
            });
        });

        context("Pick winner", async function () {
            it("should correctly calculate prize", async () => {
                const addresses = signers.slice(1, 5).map(signer => signer.address);
                const bets = [10, 5, 5, 20];
                const winnerAddress = addresses[addresses.length - 1];

                const expectTotal = bets.reduce((sum, current) => sum + current, 0);
                const expectWinPrize = expectTotal * winnerPercent / 100;

                await contractInstance.multiEnterLottery(addresses, bets);
                await contractInstance.pickWinner();

                expect(await contractInstance.winner()).to.equal(winnerAddress);
                expect(await contractInstance.winnerPrize()).to.equal(expectWinPrize);
            });

            it("should revert if participants less than lower bound", async () => {
                if (minParticipants > 0) {
                    await expect(contractInstance.pickWinner()).to.be.reverted;
                }
            });

            it("should revert with custom error if winner already picked", async () => {
                const accounts = signers.slice(1, 3).map(signer => signer.address);
                const bets = [1, 1];

                await contractInstance.multiEnterLottery(accounts, bets);
                await contractInstance.pickWinner();
                await expect(contractInstance.pickWinner()).to.be.revertedWithCustomError(contractInstance, "WinnerAlreadyPicked");
            });
        });
    });

});