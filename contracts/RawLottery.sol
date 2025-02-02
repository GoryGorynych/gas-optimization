// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title RawLottery - Raw, not optimized smart contract for lottery.
/// @author Vladimir Gorenkov
contract RawLottery {
    string public name;
    address[] private participants;
    mapping (address paricipant => uint256 totalBets) private totalBets;
    uint256 private prizePool;
    uint256 public winnerPrize;
    address public winner;
    uint256 public winnerPercent;
    uint256 public min_participants;
    address public owner;
    uint256 public constant MAX_PARTICIPANTS = 10;
    string public foo;

    error WinnerAlreadyPicked(address winner);

    constructor(string memory _name, uint256 _winnerPercent, uint256 _min_participants) {
        require(_min_participants > 0, "Should be 1 participants minimum");

        name = _name;
        winnerPercent = _winnerPercent;
        min_participants = _min_participants;
        owner = msg.sender;
        foo = "foo";
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function enterLottery(uint256 bet) external {
        applyBet(msg.sender, bet);
    }

    function multiEnterLottery(address[] memory accounts, uint256[] memory bets) external onlyOwner{
        require(accounts.length > 0, "There aren't accounts");
        require (accounts.length == bets.length, "Number of accounts must be equal number of bets" );

        for (uint256 i; i < accounts.length; i++) {
            applyBet(accounts[i], bets[i]);
        }
    }

    function pickWinner() external {
        require(participants.length >= min_participants, "No participants");

        if (winner != address(0)) {
            revert WinnerAlreadyPicked(winner);
        }
        //TODO: добавить второй механизм определения победителя, например по размеру ставки
        uint256 randomIndex = getWinnerIndexByLargestBet();
        winner = participants[randomIndex];
        winnerPrize = prizePool * winnerPercent / 100;
    }

    function getPrizePool() external view returns (uint256) {
        return prizePool;
    }

    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    function getWinnerIndexByLargestBet() private view returns (uint256) {
        uint256 maxValue = 0;
        uint256 maxValueIdx = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            if (totalBets[participants[i]] > maxValue) {
                maxValue = totalBets[participants[i]];
                maxValueIdx = i;
            }
        }
        return maxValueIdx;
    }

    function applyBet(address account, uint256 bet) private {
        require(account != address(0), "Invalid account address");
        require(participants.length < MAX_PARTICIPANTS, "Participant limit reached");
        require(bet > 0, "Bet must be greater than zero");
        require(bet < type(uint256).max, "Bet exceeds maximum value");

        for (uint256 i = 0; i < participants.length; i++) {
            require(participants[i] != account, "Participant already added");
        }

        participants.push(account);
        totalBets[account] += bet;
        prizePool += bet;
    }
}