exports.getPoolImmutables=async(poolContract)=>{
    //we get these value from "https://info.uniswap.org/#/" then in search pool write uni/eth and go to it then go to etherscan from there.
    const [token0,token1,fee]=await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee()
    ])
    const immutables={
        token0:token0,
        token1:token1,
        fee:fee,
    }
    return immutables
}

exports.getPoolState=async (poolContract)=>{
    const slot=poolContract.slot0()

    const state={
        sqrtPriceX96:slot[0]
    }
    return state
}