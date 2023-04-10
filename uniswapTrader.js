const ethers=require(`ethers`)
const {abi:IUniswapV3PoolABI}=require(`@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json`)
const {abi:SwapRouterABI}=require("@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json")
const {getPoolImmutables,getPoolState}=require(`./helpers.js`)
const ERC20ABI=require("./abi.json")

require(`dotenv`).config()
const GOERLI_RPC_URL=process.env.GOERLI_RPC_URL
const PRIVATE_KEY=process.env.PRIVATE_KEY
const provider=new ethers.providers.JsonRpcProvider(GOERLI_RPC_URL)
const MY_WALLET_ADDRESS=process.env.MY_WALLET_ADDRESS
//This is the pool address from which we get uniswap against our weth
//we will get it throw running code in 8.FindPoolUniSwap/findPoolUniswap.js
const poolAddress="0x07A4f63f643fE39261140DF5E613b9469eccEC86" //uni/weth

//This is the address of deployed uniswap contract.
//we will get this from "https://docs.uniswap.org/contracts/v3/reference/deployments" as swapRouter
const swapRouterAddress="0xE592427A0AEce92De3Edee1F18E0157C05861564"

const name0=`Wrapped Ether`
const symbol0=`WETH`
const decimals0=`18`
const address0=`0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6`

const name1=`Uniswap Token`
const symbol1=`UNI`
const decimals1=`18`
const address1=`0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984`

async function main(){
    const poolContract=new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
    )
    const immutables=await getPoolImmutables(poolContract)
    const state=await getPoolState(poolContract)
  
    const wallet=new ethers.Wallet(PRIVATE_KEY)

    const connectedWallet=wallet.connect(provider)

    const swapRouterContract=await new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
    )
    console.log("swapRouterContract.address",swapRouterContract.address)

    const inputAmount=0.001
    // 0.001 => 1 000 000 000 000 000
//here decimals0 denotes 18 decimals
const amountIn=ethers.utils.parseUnits(
    inputAmount.toString(),
    decimals0
)

//The amount we want to give access to uniswap to swap tokens
// const approveAmount=(0.001*10000).toString()
const approveAmount=(0.001*1000).toString()
const tokenContract0=new ethers.Contract(
  address0,
  ERC20ABI,
  provider
)
const approvalResponse=await tokenContract0.connect(connectedWallet).approve(
    swapRouterAddress,
    // approveAmount
    "1000000000000000000"
)
console.log("approvalResponse",approvalResponse)
const params={
    tokenIn: immutables.token1,
    tokenOut: immutables.token0,
    fee: immutables.fee,
    recipient: MY_WALLET_ADDRESS,
    deadline:Math.floor(Date.now()/1000)+(60*10),
    amountIn:amountIn,
    amountOutMinimum:0,
    sqrtPriceLimitX96:0
}

const transaction=swapRouterContract.connect(connectedWallet).exactInputSingle(
    params,
    {
        gasLimit:ethers.utils.hexlify(1000000)
    }
).then(transaction=>{
    console.log("transaction",transaction)
})

}
main()

