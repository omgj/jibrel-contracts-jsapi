/**
 * @file Manages helper functions for sending of transactions
 * @author Ivan Violentov <ivan.violentov@jibrel.network>
 */

import Promise from 'bluebird'
import Tx from 'ethereumjs-tx'

import add0x from '../utils/add0x'

import config from '../config'

/**
 * @function signTx
 *
 * @description Signs raw transaction data with the specified private key
 *
 * @param {object} rawTx - Transaction data
 * @param {string} privateKey - Private key (64 hex symbols, without '0x' prefix)
 *
 * @returns {string} Serialized string of signed transaction
 */
export function signTx(rawTx, privateKey) {
  const tx = new Tx(rawTx)
  tx.sign(new Buffer(privateKey, 'hex'))
  const signedTx = tx.serialize().toString('hex')

  return add0x(signedTx)
}

/**
 * @async
 * @function getRawTx
 *
 * @description Gets raw transaction data
 *
 * @param {object} props - Properties
 * @param {string} props.address - Address of the transaction sender
 * @param {string} props.to - Address of the transaction receiver
 * @param {BigNumber} props.value - Transaction value
 * @param {BigNumber} [props.gasLimit] - Gas limit for the transaction
 * @param {string} [props.data] - Transaction data
 *
 * @returns Promise that will be resolved with raw transaction data
 */
export async function getRawTx(props) {
  const { address, to, gasLimit, data } = props
  const value = web3.toHex(props.value)

  const [txGasPrice, txNonce, txGasLimit] = await Promise.all([
    getGasPrice(),
    getNonce(address),
    gasLimit || getGasLimit({ data, to, value }),
  ])

  return {
    to,
    data,
    value,
    nonce: web3.toHex(txNonce),
    gasPrice: web3.toHex(txGasPrice),
    gasLimit: web3.toHex(txGasLimit),
  }
}

/**
 * @async
 * @function getContractRawTx
 *
 * @description Gets raw contract transaction data
 *
 * @param {object} payload - Payload object
 * @param {object} payload.props - API function properties
 * @param {object} payload.props.contractAddress - Contract address
 * @param {object} [payload.props.gasLimit] - Gas limit for the contract transaction
 * @param {string} payload.address - Address of the transaction sender
 * @param {function} payload.contractMethod - Contract method that used to send transaction
 * @param {array} payload.args - Contract method arguments
 *
 * @returns Promise that will be resolved with raw contract transaction data
 */
export async function getContractRawTx(payload) {
  const { props, address, contractMethod, args } = payload
  const { contractAddress, gasLimit } = props

  const [txData, txGasPrice, txNonce, txGasLimit] = await Promise.all([
    contractMethod.getData(...args),
    getGasPrice(),
    getNonce(address),
    gasLimit || getContractGasLimit(contractMethod, args),
  ])

  return {
    data: txData,
    to: contractAddress,
    nonce: web3.toHex(txNonce),
    gasPrice: web3.toHex(txGasPrice),
    gasLimit: web3.toHex(txGasLimit),
  }
}

/**
 * @async
 * @function getGasLimit
 *
 * @description Gets gas limit for the transaction
 *
 * @param {object} props - Properties of the web3.eth.estimateGas function
 *
 * @returns Promise that will be resolved with estimate gas for sending of the transaction
 */
export function getGasLimit(props) {
  return Promise
    .promisify(web3.eth.estimateGas)(props)
    .timeout(config.promiseTimeout, new Error('Can not get estimate gas'))
}

/**
 * @async
 * @function getContractGasLimit
 *
 * @description Gets gas limit for the contract transaction
 *
 * @param {function} method - Contract method that used to send transaction
 * @param {array} args - Contract method argumets
 *
 * @returns Promise that will be resolved with estimate gas for sending of the contract transaction
 */
export function getContractGasLimit(method, args) {
  return Promise
    .promisify(method.estimateGas)(...args)
    .timeout(config.promiseTimeout, new Error('Can not get estimate gas for contract method'))
}

function getNonce(address) {
  return Promise
    .promisify(web3.eth.getTransactionCount)(address)
    .timeout(config.promiseTimeout, new Error('Can not get transaction count'))
}

function getGasPrice() {
  return Promise
    .promisify(web3.eth.getGasPrice)()
    .timeout(config.promiseTimeout, new Error('Can not get gas price'))
}
