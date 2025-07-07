// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CleanupLogger {
    event CleanupRecorded(
        string eventId,
        string volunteerId,
        uint256 wasteCollectedKg,
        string location,
        uint256 timestamp
    );

    function recordCleanup(
        string calldata eventId,
        string calldata volunteerId,
        uint256 wasteCollectedKg,
        string calldata location
    ) external {
        emit CleanupRecorded(eventId, volunteerId, wasteCollectedKg, location, block.timestamp);
    }
}
