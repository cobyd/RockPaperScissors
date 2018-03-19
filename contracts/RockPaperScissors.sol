pragma solidity ^0.4.19;

contract RockPaperScissors {
    struct Player {
        address addr;
        bytes32 entry;
        uint8 choice;
        bool committed;
        bool revealed;
    }
    Player public player1;
    Player public player2;
    uint public  stakes;
    uint8 public state;

    event LogEntry(address indexed player, bytes32 entry);
    event LogReveal(address indexed player, uint8 choice);
    event LogTie();
    event LogWin(address winner);
    
    function RockPaperScissors(uint _stakes, address _player1) public {
        stakes = _stakes;
        player1.addr = _player1;
    }
    
    function joinGame() public {
        require(state == 0);
        player2.addr = msg.sender;
        state = 1;
    }
    
    function commit(bytes32 _hash) public payable onlyPlayers {
        require(msg.value == stakes);
        if (msg.sender == player1.addr) {
            player1.entry = _hash;
            player1.committed = true;
            LogEntry(player1.addr, _hash);
        } else {
            player2.entry = _hash;
            player2.committed = true;
            LogEntry(player2.addr, _hash);
        }
    }

    function breakTie(bytes32 _hash) public onlyPlayers {
        if (msg.sender == player1.addr) {
            player1.entry = _hash;
            player1.committed = true;
            LogEntry(player1.addr, _hash);
        } else {
            player2.entry = _hash;
            player2.committed = true;
            LogEntry(player2.addr, _hash);
        }
    }
    
    function reveal(uint8 _throwChoice, string _salt) public onlyPlayers {
        require(player1.committed && player2.committed);
        bytes32 _hash = keccakHash(_throwChoice, _salt);
        if (msg.sender == player1.addr) {
            require(_hash == player1.entry);
            player1.choice = _throwChoice;
            player1.revealed = true;
            LogReveal(player1.addr, _throwChoice);
        } else {
            require(_hash == player2.entry);
            player2.choice = _throwChoice;
            player2.revealed = true;
            LogReveal(player2.addr, _throwChoice);
        }
    }
    
    function evaluateGame() public {
        require(player1.revealed && player2.revealed);
        if (player1.choice == player2.choice) {
            LogTie();
            // how to incentivize calling this if it's a tie?  Waste of gas.
            resetGame();
        } else if (player1.choice - player2.choice == 1 || 
                   player2.choice - player1.choice == 2) { // player 1 wins!
            LogWin(player1.addr);
            resetGame();
            player1.addr.transfer(address(this).balance);
        } else { // player 2 wins!
            LogWin(player2.addr);
            resetGame();
            player2.addr.transfer(address(this).balance);
        }
    }
    
    function resetGame() private {
        player1.entry = bytes32(0);
        player1.choice = 0;
        player1.committed = false; 
        player1.revealed = false;
        player2.entry = bytes32(0);
        player2.choice = 0;
        player2.committed = false; 
        player2.revealed = false;
    }
    
    function keccakHash(uint _throwChoice, string _salt) public pure returns(bytes32) {
        require(_throwChoice == 1 || _throwChoice == 2 || _throwChoice == 3); // 1 = rock; 2 = paper; 3 = scissors;
        return keccak256(_throwChoice, _salt);
    }
    
    modifier onlyPlayers {
        // penalize non players from interfering by wasting their gas
        assert(msg.sender == player1.addr || msg.sender == player2.addr);
        _;
    }
    
}