import {
  CreditIssued,
  CreditRetired,
  TransferSingle,
  TransferBatch,
  MetadataUpdated,
  RoleGranted
} from "../generated/CarbonCredit/CarbonCredit"
import {
  CarbonCreditToken,
  TransferEvent,
  RetirementEvent,
  TokenBalance,
  Issuer,
  DailyStats,
  GlobalStats
} from "../generated/schema"
import { BigInt, Bytes, crypto, ByteArray } from "@graphprotocol/graph-ts"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ISSUER_ROLE = crypto.keccak256(ByteArray.fromUTF8("ISSUER_ROLE"))

export function handleCreditIssued(event: CreditIssued): void {
  let token = new CarbonCreditToken(event.params.tokenId.toString())
  
  token.tokenId = event.params.tokenId
  token.projectId = event.params.projectId
  token.vintage = event.params.vintage
  token.serialNumber = ""
  token.registry = ""
  token.metadataURI = ""
  token.issuer = event.params.issuer
  token.issuanceDate = event.block.timestamp
  token.totalSupply = event.params.quantity
  token.isRetired = false
  token.createdAt = event.block.timestamp
  token.updatedAt = event.block.timestamp
  
  token.save()

  // Create transfer event for issuance
  let transferId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let transfer = new TransferEvent(transferId)
  
  transfer.token = token.id
  transfer.from = Bytes.fromHexString(ZERO_ADDRESS)
  transfer.to = event.params.recipient
  transfer.quantity = event.params.quantity
  transfer.operator = event.params.issuer
  transfer.transactionHash = event.transaction.hash
  transfer.blockNumber = event.block.number
  transfer.blockTimestamp = event.block.timestamp
  transfer.logIndex = event.logIndex
  
  transfer.save()

  // Update recipient balance
  updateTokenBalance(event.params.tokenId, event.params.recipient, event.params.quantity, event.block.timestamp)

  // Update issuer stats
  updateIssuerStats(event.params.issuer, event.params.quantity, event.block.timestamp)

  // Update daily and global stats
  updateDailyStats(event.block.timestamp, event.params.quantity, BigInt.fromI32(0), BigInt.fromI32(1))
  updateGlobalStats(event.params.quantity, BigInt.fromI32(0), BigInt.fromI32(1))
}

export function handleCreditRetired(event: CreditRetired): void {
  let token = CarbonCreditToken.load(event.params.tokenId.toString())
  if (!token) return

  // Create retirement event
  let retirementId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let retirement = new RetirementEvent(retirementId)
  
  retirement.token = token.id
  retirement.retiree = event.params.retiree
  retirement.quantity = event.params.quantity
  retirement.reason = event.params.reason
  retirement.transactionHash = event.transaction.hash
  retirement.blockNumber = event.block.number
  retirement.blockTimestamp = event.block.timestamp
  retirement.logIndex = event.logIndex
  
  retirement.save()

  // Update token supply
  token.totalSupply = token.totalSupply.minus(event.params.quantity)
  token.updatedAt = event.block.timestamp
  
  if (token.totalSupply.equals(BigInt.fromI32(0))) {
    token.isRetired = true
  }
  
  token.save()

  // Update balance
  updateTokenBalance(event.params.tokenId, event.params.retiree, event.params.quantity.neg(), event.block.timestamp)

  // Update daily and global stats
  updateDailyStats(event.block.timestamp, BigInt.fromI32(0), event.params.quantity, BigInt.fromI32(0))
  updateGlobalStats(BigInt.fromI32(0), event.params.quantity, BigInt.fromI32(0))
}

export function handleTransferSingle(event: TransferSingle): void {
  // Skip minting and burning (handled by other events)
  if (event.params.from.toHex() == ZERO_ADDRESS || event.params.to.toHex() == ZERO_ADDRESS) {
    return
  }

  let transferId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let transfer = new TransferEvent(transferId)
  
  transfer.token = event.params.id.toString()
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.quantity = event.params.value
  transfer.operator = event.params.operator
  transfer.transactionHash = event.transaction.hash
  transfer.blockNumber = event.block.number
  transfer.blockTimestamp = event.block.timestamp
  transfer.logIndex = event.logIndex
  
  transfer.save()

  // Update balances
  updateTokenBalance(event.params.id, event.params.from, event.params.value.neg(), event.block.timestamp)
  updateTokenBalance(event.params.id, event.params.to, event.params.value, event.block.timestamp)

  // Update daily and global stats
  updateDailyStats(event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0))
  updateGlobalStats(BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0))
}

export function handleTransferBatch(event: TransferBatch): void {
  // Handle batch transfers
  for (let i = 0; i < event.params.ids.length; i++) {
    let tokenId = event.params.ids[i]
    let value = event.params.values[i]
    
    // Skip minting and burning
    if (event.params.from.toHex() == ZERO_ADDRESS || event.params.to.toHex() == ZERO_ADDRESS) {
      continue
    }

    let transferId = event.transaction.hash.toHex() + "-" + event.logIndex.toString() + "-" + i.toString()
    let transfer = new TransferEvent(transferId)
    
    transfer.token = tokenId.toString()
    transfer.from = event.params.from
    transfer.to = event.params.to
    transfer.quantity = value
    transfer.operator = event.params.operator
    transfer.transactionHash = event.transaction.hash
    transfer.blockNumber = event.block.number
    transfer.blockTimestamp = event.block.timestamp
    transfer.logIndex = event.logIndex
    
    transfer.save()

    // Update balances
    updateTokenBalance(tokenId, event.params.from, value.neg(), event.block.timestamp)
    updateTokenBalance(tokenId, event.params.to, value, event.block.timestamp)
  }
}

export function handleMetadataUpdated(event: MetadataUpdated): void {
  let token = CarbonCreditToken.load(event.params.tokenId.toString())
  if (!token) return

  token.metadataURI = event.params.newMetadataURI
  token.updatedAt = event.block.timestamp
  
  token.save()
}

export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(ISSUER_ROLE)) {
    let issuer = new Issuer(event.params.account.toHex())
    
    issuer.address = event.params.account
    issuer.isActive = true
    issuer.totalIssued = BigInt.fromI32(0)
    issuer.grantedAt = event.block.timestamp
    
    issuer.save()
  }
}

function updateTokenBalance(tokenId: BigInt, owner: Bytes, change: BigInt, timestamp: BigInt): void {
  let balanceId = tokenId.toString() + "-" + owner.toHex()
  let balance = TokenBalance.load(balanceId)
  
  if (!balance) {
    balance = new TokenBalance(balanceId)
    balance.token = tokenId.toString()
    balance.owner = owner
    balance.balance = BigInt.fromI32(0)
  }
  
  balance.balance = balance.balance.plus(change)
  balance.lastUpdated = timestamp
  
  balance.save()
}

function updateIssuerStats(issuer: Bytes, quantity: BigInt, timestamp: BigInt): void {
  let issuerEntity = Issuer.load(issuer.toHex())
  if (!issuerEntity) {
    issuerEntity = new Issuer(issuer.toHex())
    issuerEntity.address = issuer
    issuerEntity.isActive = true
    issuerEntity.totalIssued = BigInt.fromI32(0)
    issuerEntity.grantedAt = timestamp
  }
  
  issuerEntity.totalIssued = issuerEntity.totalIssued.plus(quantity)
  issuerEntity.save()
}

function updateDailyStats(timestamp: BigInt, issuance: BigInt, retirements: BigInt, transfers: BigInt): void {
  let dayId = timestamp.div(BigInt.fromI32(86400)).toString()
  let stats = DailyStats.load(dayId)
  
  if (!stats) {
    stats = new DailyStats(dayId)
    stats.date = dayId
    stats.totalIssuance = BigInt.fromI32(0)
    stats.totalRetirements = BigInt.fromI32(0)
    stats.totalTransfers = BigInt.fromI32(0)
    stats.activeTokens = BigInt.fromI32(0)
    stats.uniqueHolders = BigInt.fromI32(0)
  }
  
  stats.totalIssuance = stats.totalIssuance.plus(issuance)
  stats.totalRetirements = stats.totalRetirements.plus(retirements)
  stats.totalTransfers = stats.totalTransfers.plus(transfers)
  
  stats.save()
}

function updateGlobalStats(issuance: BigInt, retirements: BigInt, transfers: BigInt): void {
  let stats = GlobalStats.load("global")
  
  if (!stats) {
    stats = new GlobalStats("global")
    stats.totalTokensIssued = BigInt.fromI32(0)
    stats.totalSupply = BigInt.fromI32(0)
    stats.totalRetired = BigInt.fromI32(0)
    stats.totalTransfers = BigInt.fromI32(0)
    stats.uniqueHolders = BigInt.fromI32(0)
    stats.activeIssuers = BigInt.fromI32(0)
  }
  
  stats.totalTokensIssued = stats.totalTokensIssued.plus(issuance)
  stats.totalSupply = stats.totalSupply.plus(issuance).minus(retirements)
  stats.totalRetired = stats.totalRetired.plus(retirements)
  stats.totalTransfers = stats.totalTransfers.plus(transfers)
  stats.lastUpdated = BigInt.fromI32(0) // Will be set by the indexer
  
  stats.save()
}