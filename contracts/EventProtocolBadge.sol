// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * EventProtocolBadge — insignia NFT tipo POAP.
 *
 * ERC-721 mínimo, autocontenido (sin dependencias externas para simplificar
 * el deploy). Solo la wallet `minter` (la del proyecto, que paga el gas)
 * puede acuñar — así el asistente recibe su insignia sin necesitar AVAX.
 *
 * Se acuña cuando el backend confirma una condición real: check-in por QR
 * validado, o canje de una frase secreta del evento (ver server-app.ts).
 */
contract EventProtocolBadge {
    string public constant name = "EventProtocol Badge";
    string public constant symbol = "EPBADGE";

    address public minter;
    uint256 public nextTokenId = 1;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => string) public eventIdOf;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event BadgeMinted(address indexed to, uint256 indexed tokenId, string eventId);
    event MinterChanged(address indexed oldMinter, address indexed newMinter);

    modifier onlyMinter() {
        require(msg.sender == minter, "EventProtocolBadge: caller is not the minter");
        _;
    }

    constructor(address _minter) {
        minter = _minter;
        emit MinterChanged(address(0), _minter);
    }

    function setMinter(address newMinter) external onlyMinter {
        require(newMinter != address(0), "EventProtocolBadge: zero address");
        emit MinterChanged(minter, newMinter);
        minter = newMinter;
    }

    /// @notice Acuña una insignia a `to`. Solo la wallet del proyecto (paga el gas).
    function mint(address to, string calldata eventId, string calldata uri) external onlyMinter returns (uint256) {
        require(to != address(0), "EventProtocolBadge: mint to zero address");
        uint256 tokenId = nextTokenId++;
        _owners[tokenId] = to;
        _balances[to] += 1;
        _tokenURIs[tokenId] = uri;
        eventIdOf[tokenId] = eventId;
        emit Transfer(address(0), to, tokenId);
        emit BadgeMinted(to, tokenId, eventId);
        return tokenId;
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "EventProtocolBadge: zero address");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "EventProtocolBadge: nonexistent token");
        return owner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "EventProtocolBadge: nonexistent token");
        return _tokenURIs[tokenId];
    }

    function approve(address to, uint256 tokenId) external {
        address owner = ownerOf(tokenId);
        require(to != owner, "EventProtocolBadge: approval to current owner");
        require(msg.sender == owner || _operatorApprovals[owner][msg.sender], "EventProtocolBadge: not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        require(_owners[tokenId] != address(0), "EventProtocolBadge: nonexistent token");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || _tokenApprovals[tokenId] == spender || _operatorApprovals[owner][spender]);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "EventProtocolBadge: not authorized");
        require(ownerOf(tokenId) == from, "EventProtocolBadge: from is not owner");
        require(to != address(0), "EventProtocolBadge: transfer to zero address");

        delete _tokenApprovals[tokenId];
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        transferFrom(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        // ERC165 + ERC721 + ERC721Metadata
        return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd || interfaceId == 0x5b5e139f;
    }
}
