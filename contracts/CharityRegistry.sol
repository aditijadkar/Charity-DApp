// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CharityRegistry {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    struct Charity {
        address wallet;
        string name;
        bool verified;
        bool exists;
    }

    struct Cause {
        uint256 id;
        address charity;
        string title;
        string description;
        uint256 totalDonations;
        uint256 totalReleased;
        bool donationsClosed;
        bool exists;
    }

    struct Milestone {
        uint256 id;
        uint256 causeId;
        string description;
        uint256 amount;
        bool approved;
        bool released;
    }

    mapping(address => Charity) public charities;
    address[] private charityList;

    uint256 public causeCount;
    mapping(uint256 => Cause) public causes;
    mapping(uint256 => Milestone[]) private milestonesByCause;
    mapping(address => uint256) public pendingWithdrawals;

    event CharityRegistered(address indexed charity, string name);
    event CharityVerified(address indexed charity);
    event CauseCreated(uint256 indexed causeId, address indexed charity, string title);
    event MilestoneCreated(uint256 indexed causeId, uint256 indexed milestoneId, string description, uint256 amount);
    event DonationMade(address indexed donor, uint256 indexed causeId, uint256 amount, string note);
    event MilestoneApproved(uint256 indexed causeId, uint256 indexed milestoneId);
    event MilestoneReleased(uint256 indexed causeId, uint256 indexed milestoneId, uint256 amount, address indexed charity);
    event FundsWithdrawn(address indexed charity, uint256 amount);

    modifier onlyCauseCharity(uint256 causeId) {
        require(causes[causeId].exists, "Cause !exists");
        require(msg.sender == causes[causeId].charity, "Not cause charity");
        _;
    }

    function registerCharity(string calldata name) external {
        Charity storage c = charities[msg.sender];
        require(!c.exists, "Already registered");
        charities[msg.sender] = Charity({
            wallet: msg.sender,
            name: name,
            verified: false,
            exists: true
        });
        charityList.push(msg.sender);
        emit CharityRegistered(msg.sender, name);
    }

    function verifyCharity(address charityWallet) external onlyOwner {
        Charity storage c = charities[charityWallet];
        require(c.exists, "Charity !exists");
        require(!c.verified, "Already verified");
        c.verified = true;
        emit CharityVerified(charityWallet);
    }

    function createCause(string calldata title, string calldata description) external {
        Charity storage c = charities[msg.sender];
        require(c.exists && c.verified, "Charity not verified");
        uint256 newId = ++causeCount;
        causes[newId] = Cause({
            id: newId,
            charity: msg.sender,
            title: title,
            description: description,
            totalDonations: 0,
            totalReleased: 0,
            donationsClosed: false,
            exists: true
        });
        emit CauseCreated(newId, msg.sender, title);
    }

    function createMilestone(
        uint256 causeId,
        string calldata description,
        uint256 amountWei
    ) external onlyCauseCharity(causeId) {
        require(amountWei > 0, "Amount = 0");
        Milestone[] storage listRef = milestonesByCause[causeId];
        uint256 milestoneId = listRef.length;
        listRef.push(
            Milestone({
                id: milestoneId,
                causeId: causeId,
                description: description,
                amount: amountWei,
                approved: false,
                released: false
            })
        );
        emit MilestoneCreated(causeId, milestoneId, description, amountWei);
    }

    function donate(uint256 causeId, string calldata note) external payable {
        require(causes[causeId].exists, "Cause !exists");
        Cause storage causeRef = causes[causeId];
        require(!causeRef.donationsClosed, "Donations closed");
        address charityWallet = causeRef.charity;
        require(charities[charityWallet].verified, "Charity not verified");
        require(msg.value > 0, "No ETH");
        causeRef.totalDonations += msg.value;
        emit DonationMade(msg.sender, causeId, msg.value, note);
    }

    function approveMilestone(uint256 causeId, uint256 milestoneId) external onlyOwner {
        require(causes[causeId].exists, "Cause !exists");
        Milestone storage m = _getMilestone(causeId, milestoneId);
        require(!m.approved, "Already approved");
        m.approved = true;
        emit MilestoneApproved(causeId, milestoneId);
    }

    function releaseMilestone(uint256 causeId, uint256 milestoneId) external onlyOwner {
    require(causes[causeId].exists, "Cause !exists");
    Milestone storage m = _getMilestone(causeId, milestoneId);
    require(m.approved, "Not approved");
    require(!m.released, "Already released");

    Cause storage causeRef = causes[causeId];
    require(
        causeRef.totalReleased + m.amount <= causeRef.totalDonations,
        "Insufficient donated"
    );

    // Mark released and account bookkeeping
    m.released = true;
    causeRef.totalReleased += m.amount;

    // Close donations once any milestone released (optional business rule)
    causeRef.donationsClosed = true;

    // Transfer ETH directly to the charity wallet (interaction last)
    (bool success, ) = payable(causeRef.charity).call{ value: m.amount }("");
    require(success, "Transfer failed");

    emit MilestoneReleased(causeId, milestoneId, m.amount, causeRef.charity);
}


/// ✅ Verified charities withdraw funds to their wallet
function withdraw(uint256 amountWei) external {
    require(amountWei > 0, "Amount = 0");
    Charity storage c = charities[msg.sender];
    require(c.exists && c.verified, "Not a verified charity");

    uint256 pending = pendingWithdrawals[msg.sender];
    require(amountWei <= pending, "Insufficient pending");

    // Effects
    pendingWithdrawals[msg.sender] = pending - amountWei;

    // Interaction — send ETH to charity wallet
    (bool success, ) = payable(msg.sender).call{value: amountWei}("");
    require(success, "ETH transfer failed");

    emit FundsWithdrawn(msg.sender, amountWei);
}


    // --- View Functions ---
    function getCharities() external view returns (Charity[] memory) {
        Charity[] memory arr = new Charity[](charityList.length);
        for (uint256 i = 0; i < charityList.length; i++) {
            arr[i] = charities[charityList[i]];
        }
        return arr;
    }

    function getCauses() external view returns (Cause[] memory) {
        Cause[] memory arr = new Cause[](causeCount);
        for (uint256 i = 1; i <= causeCount; i++) {
            arr[i - 1] = causes[i];
        }
        return arr;
    }

    function getMilestoneCount(uint256 causeId) external view returns (uint256) {
        return milestonesByCause[causeId].length;
    }

    function getMilestone(uint256 causeId, uint256 milestoneId)
        external
        view
        returns (
            uint256 id,
            string memory description,
            uint256 amount,
            bool approved,
            bool released
        )
    {
        Milestone storage m = _getMilestone(causeId, milestoneId);
        return (m.id, m.description, m.amount, m.approved, m.released);
    }

    function _getMilestone(uint256 causeId, uint256 milestoneId)
        internal
        view
        returns (Milestone storage)
    {
        Milestone[] storage listRef = milestonesByCause[causeId];
        require(milestoneId < listRef.length, "Milestone !exists");
        return listRef[milestoneId];
    }

    receive() external payable {}
}
