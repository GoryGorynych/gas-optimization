// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title OptimizedLottery - Optimized smart contract for lottery.
/// @author Vladimir Gorenkov
contract OptimizedLottery {
    string public name;
    address[] private participants;
    mapping (address paricipant => uint256 totalBets) private totalBets;
    uint256 private prizePool;
    uint256 public winnerPrize;

    address public winner;
    uint8 public winnerPercent;
    uint8 immutable public MIN_PARTICIPANTS;
    
    address immutable public OWNER;
    uint8 public constant MAX_PARTICIPANTS = 10;

    error WinnerAlreadyPicked(address winner);
    error NotEnoughParticipants(uint256 numberParticipants);
    error InvalidAccount(address account);

    constructor(string memory _name, uint8 _winnerPercent, uint8 _min_participants) payable  {
        require(_min_participants > 0, "Should be 1 participants minimum");

        name = _name;
        winnerPercent = _winnerPercent;
        MIN_PARTICIPANTS = _min_participants;
        OWNER = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == OWNER, "Caller is not the owner");
        _;
    }

    ///@dev Single entry lottery from sender
    ///@param bet Amount of bet
    function enterLottery(uint256 bet) external {
        applyBet(msg.sender, bet);
    }

    ///@dev Multiple entry lottery for passed accounts
    ///@param accounts Account addresses
    ///@param bets Amount of bets
    function multiEnterLottery(address[] calldata accounts, uint256[] calldata bets) external onlyOwner {
        require(accounts.length > 0, "There aren't accounts");
        require (accounts.length == bets.length, "Size of accounts dont equal bets" );

        uint256 size = accounts.length;
        for (uint256 i; i < size; ++i) {
            applyBet(accounts[i], bets[i]);
        }
    }

    ///@dev Picking of winner
    function pickWinner() external {
        uint256 numParticip = participants.length;
        if (numParticip < MIN_PARTICIPANTS) {
            revert NotEnoughParticipants(numParticip);
        }

        if (winner != address(0)) {
            revert WinnerAlreadyPicked(winner);
        }
        uint256 randomIndex = getWinnerIndexByLargestBet();
        winner = participants[randomIndex];
        winnerPrize = prizePool * winnerPercent / 100;
    }

    /// @dev Get the prize pool
    function getPrizePool() external view returns (uint256) {
        return prizePool;
    }

    /// @dev Get all participants of lottery
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    /// @dev Get winner index who made the largest bet
    function getWinnerIndexByLargestBet() private view returns (uint256) {
        uint256 maxValue = 0;
        uint256 maxValueIdx = 0;
        uint256 size = participants.length;
        for (uint256 i = 0; i < size; ++i) {
            uint256 totalBet = totalBets[participants[i]];
            if (totalBet > maxValue) {
                maxValue = totalBet;
                maxValueIdx = i;
            }
        }
        return maxValueIdx;
    }

    /// @dev Increase prize pool and add account to participants
    ///@param account Account address
    ///@param bet Amount of bet
    function applyBet(address account, uint256 bet) private {
        if (account == address(0)) {
            revert InvalidAccount(account);
        }
        
        uint256 numParticipants = participants.length;
        require(numParticipants < MAX_PARTICIPANTS, "Participant limit reached");
        require(bet > 0, "Bet must be greater than zero");
        require(bet < type(uint256).max, "Bet exceeds maximum value");
        
        for (uint256 i = 0; i < numParticipants; ++i) {
            require(participants[i] != account, "Participant already added");
        }

        participants.push(account);
        //overflow not possible
        unchecked {
            totalBets[account] += bet;
        }
        prizePool += bet;
    }
}