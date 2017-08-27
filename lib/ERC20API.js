import Promise from 'bluebird'

import initWeb3 from './utils/initWeb3'
import submitContractTx from './utils/submitContractTx'
import getContractInstance from './utils/getContractInstance'
import estimateGasForContractMethod from './utils/estimateGasForContractMethod'
import { getPastContractEvents, subscribeToContractEvent } from './utils/eventUtils'

import { validate, ERC20Schemas } from './validationSchemas'

const contractInterface = 'ERC20'

/**
 * ERC20API 'calling' methods
 */

export async function totalSupply(props) {
  const validatedProps = await validate(props, ERC20Schemas.totalSupply)
  const { rpcaddr, rpcport, contractAddress } = validatedProps

  initWeb3(rpcaddr, rpcport)
  const contractInstance = getContractInstance(contractAddress, contractInterface)

  return Promise.promisify(contractInstance.totalSupply.call)()
}

export async function balanceOf(props) {
  const validatedProps = await validate(props, ERC20Schemas.balanceOf)
  const { rpcaddr, rpcport, contractAddress, owner } = validatedProps

  initWeb3(rpcaddr, rpcport)
  const contractInstance = getContractInstance(contractAddress, contractInterface)

  return Promise.promisify(contractInstance.balanceOf.call)(owner)
}

/**
 * ERC20API 'transaction' methods
 */

export async function transfer(props) {
  const validatedProps = await validate(props, ERC20Schemas.transfer)
  const { rpcaddr, rpcport, contractAddress, privateKey, gasLimit, to, value, options } = validatedProps

  initWeb3(rpcaddr, rpcport)
  const contractInstance = getContractInstance(contractAddress, contractInterface)

  return submitContractTx({
    privateKey,
    gasLimit,
    args: [to, value],
    method: contractInstance.transfer,
  })
}

/**
 * ERC20API events
 */

export async function allEvents(props) {
  const validatedProps = await validate(props, ERC20Schemas.allEvents)
  const { rpcaddr, rpcport, contractAddress, options, callback } = validatedProps

  initWeb3(rpcaddr, rpcport)
  const contractInstance = getContractInstance(contractAddress, contractInterface)

  return subscribeToContractEvent(contractInstance.allEvents, options, callback)
}

export async function getPastEvents(props) {
  const validatedProps = await validate(props, ERC20Schemas.getPastEvents)
  const { rpcaddr, rpcport, contractAddress, event, options } = validatedProps

  initWeb3(rpcaddr, rpcport)
  const contractInstance = getContractInstance(contractAddress, contractInterface)

  return getPastContractEvents(contractInstance[event], options)
}

export async function Transfer(props) {
  const validatedProps = await validate(props, ERC20Schemas.Transfer)
  const { rpcaddr, rpcport, contractAddress, options, callback } = validatedProps

  initWeb3(rpcaddr, rpcport)
  const contractInstance = getContractInstance(contractAddress, contractInterface)

  return subscribeToContractEvent(contractInstance.Transfer, options, callback)
}

/**
 * Estimate gas for specific method call
 */

export async function estimateGas(props) {
  const validatedProps = await validate(props, ERC20Schemas.estimateGas)

  return estimateGasForContractMethod(contractInterface, validatedProps)
}