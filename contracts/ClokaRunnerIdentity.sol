// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClokaRunnerIdentity is ERC721, Ownable {
    uint256 public nextRunnerId;

    struct RunnerData {
        string stravaId;
        uint256 totalRuns;
        uint256 noShows;
        uint256 distanceLast30Days;
        uint256 commitmentScore;
    }

    mapping(uint256 => RunnerData) public runners;
    mapping(uint256 => bytes32[]) public runHashes; // Hashed GPS traces

    event RunnerRegistered(uint256 indexed runnerId, string stravaId);
    event RunVerified(uint256 indexed runnerId, bytes32 gpsHash, uint256 newScore);
    event PenaltyApplied(uint256 indexed runnerId, uint256 newScore);

    constructor() ERC721("ClokaRunnerIdentity", "RUNNER") Ownable(msg.sender) {}

    function mintIdentity(address _to, string memory _stravaId) external onlyOwner returns (uint256) {
        uint256 runnerId = nextRunnerId++;
        _mint(_to, runnerId);
        
        runners[runnerId] = RunnerData({
            stravaId: _stravaId,
            totalRuns: 0,
            noShows: 0,
            distanceLast30Days: 0,
            commitmentScore: 50 // Base score
        });

        emit RunnerRegistered(runnerId, _stravaId);
        return runnerId;
    }

    function verifyRun(uint256 _runnerId, bytes32 _gpsHash, uint256 _distance) external onlyOwner {
        require(_ownerOf(_runnerId) != address(0), "Identity does not exist");
        
        runHashes[_runnerId].push(_gpsHash);
        
        RunnerData storage data = runners[_runnerId];
        data.totalRuns += 1;
        data.distanceLast30Days += _distance;
        
        // Simple recalculate based on total runs - no shows
        data.commitmentScore = 50 + (data.totalRuns * 5) - (data.noShows * 15);
        
        emit RunVerified(_runnerId, _gpsHash, data.commitmentScore);
    }
    
    function recordNoShow(uint256 _runnerId) external onlyOwner {
        require(_ownerOf(_runnerId) != address(0), "Identity does not exist");
        
        RunnerData storage data = runners[_runnerId];
        data.noShows += 1;
        
        // Ensure score doesn't underflow
        if (data.commitmentScore > 15) {
            data.commitmentScore -= 15;
        } else {
            data.commitmentScore = 0;
        }
        
        emit PenaltyApplied(_runnerId, data.commitmentScore);
    }

    function getRunnerScore(uint256 _runnerId) external view returns (uint256) {
        return runners[_runnerId].commitmentScore;
    }
}
