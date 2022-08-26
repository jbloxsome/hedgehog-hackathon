// SPDX-License-Identifier: None

pragma solidity ^0.8.9;

interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract Hedgehog is IERC20 {

    string public constant name = "Hedgehog";
    string public constant symbol = "HH";
    uint8 public constant decimals = 18;

    mapping(address => bool) whitelist;

    // Initial token price needs to be set
    uint256 public constant tokenPrice = 1 ether; // 1 token for 1 ether

    // Tokens will be inactive until contract owner activates them
    bool public active = false;

    // Tokens will not be redeemable until the contract owner activates redemptions
    bool public redeemable = false;

    // We want a way to limit the number of tokens a given address can hold
    uint256 public maxHolding = 1 ether;

    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;

    uint256 totalSupply_ = 10 ether;

    constructor() {
        balances[msg.sender] = totalSupply_;
    }

    modifier onlyWhitelisted() {
        require(isWhitelisted(msg.sender), 'Address is not whitelisted.');
        _;
    }

    function add(address _address) public {
        whitelist[_address] = true;
    }

    function remove(address _address) public {
        whitelist[_address] = false;
    }

    function isWhitelisted(address _address) public view returns(bool) {
        return whitelist[_address];
    }

    // ERC20 standard functions
    // These are functions defined by the ERC20 standard for fungible tokens, we've modified
    // them slightly to only allow transfers if the tokens are marked as active.
    function totalSupply() public override view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public override  returns (bool) {
        // Tokens must be active
        require(active == true, "The tokens are not active yet.");

        // check sender has enough tokens
        require(numTokens <= balances[msg.sender], "Sender does not have enough tokens.");

        // check receiver wouldn't be taken over the max allowable holding
        require(balances[receiver]+numTokens >= maxHolding, "Receiver would exceed max holding.");

        // update the sender's balance
        balances[msg.sender] = balances[msg.sender]-numTokens;

        // update the receiver's balance
        balances[receiver] = balances[receiver]+numTokens;

        // emit a Transfer event
        emit Transfer(msg.sender, receiver, numTokens);

        // return true because the transaction was successful
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(active == true, "The tokens are not active yet.");
        require(balances[buyer]+numTokens <= maxHolding, "Receiver would exceed max holding.");
        require(numTokens <= balances[owner], "Sender doesn't have enough tokens.");
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner]-numTokens;
        allowed[owner][msg.sender] = allowed[owner][msg.sender]-numTokens;
        balances[buyer] = balances[buyer]+numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }

    // Custom funtions
    //
    // activate is a private function (only callable by the contract owner)
    // we use this to activate the tokens once the minumum amount have been
    // sold.
    function activate() public {
        active = true;
    }

    function allowRedemptions() public {
        redeemable = true;
    }

    function order(uint256 _amount) external payable onlyWhitelisted {
        // check the buyer is sending enough ether
        require(msg.value == _amount * tokenPrice, 'Need to send exact amount of ether');

        // check message sender won't go over maxHolding
        require(balances[msg.sender]+_amount <= maxHolding, 'You would go over your max holding');
        
        /*
         * sends the requested amount of tokens
         * from this contract address
         * to the buyer
         */
        transfer(msg.sender, _amount);
    }

    function redeem(uint256 _amount) external onlyWhitelisted {
        require(redeemable == true, "Tokens are not redeemable yet.");

        // check sender has enough tokens
        require(balances[msg.sender] <= _amount, "Attempted to redeem more tokens than are held.");

        // check the contract has enough ether to buy the tokens back
        require(address(this).balance >= _amount * tokenPrice, "Contract has insuffient ether to purchase the tokens.");

        // decrement the token balance of the seller
        balances[msg.sender] -= _amount;

        // increment the token balance of this contract
        balances[address(this)] += _amount;

        /*
         * don't forget to emit the transfer event
         * so that external apps can reflect the transfer
         */
        emit Transfer(msg.sender, address(this), _amount);
        
        // e.g. the user is selling 10 tokens, send them 10 ether
        payable(msg.sender).transfer(_amount * tokenPrice);
    }
}