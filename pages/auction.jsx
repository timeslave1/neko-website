import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from "ethers";
import useEtherSWR from 'ether-swr'

import { useContractAddresses, useContracts } from '../hooks/evm'
import { injectedConnector, formatNeko, formatAvax } from '../lib/evm'
import Nav from '../components/Nav'

let tokensOnSale = [40, 41, 42, 43, 44, 45, 46, 47];
let tokensSold = [
  0, 1, 2, 3, 4, 5, 6, 7,
  8, 9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 31,
  32, 33, 34, 35, 36, 37, 38, 39,
];
let soldPrices = {};
let soldTokenSets = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30, 31],
  [32, 33, 34, 35, 36, 37, 38, 39],
  // [40, 41, 42, 43, 44, 45, 46, 47],
  // [48, 49, 50, 51, 52, 53, 54, 55],
  // [56, 57, 58, 59, 60, 61, 62, 63],
]
const tokenImageHashes = [
  "eVP-SktyhZTdscybn8N4bF7SxSeiotMLoXx9ICX0AqI",
  "hGZgIGvBe2xFXKmvJL1pZlHyLasBpbjlakxhpTFSHUg",
  "nz4mdS2ezT56xvfrJS-agSQG4MQ53lo6F0VgMI_hUqQ",
  "5QwrsPr6eTCKyw8Rp1z6piyDGAJZETPi7t4vAOqqXhY",
  "RGW4B8gbrg-5NJIH-1W1ObaxRsZXu9btzVnoG-Pa2ro",
  "yVqU3zZXdk_5OhWtvtepuGMVo2oNw9gjeY70PzdVFPs",
  "pHwazN2WvM8MujV-VSnSTHKzS3zRHFOhPx2OGk-G3Ww",
  "XiKA583lYhGSDn41vFqUX2qnKnIjy9TJCk4iaVA1J7c",
  "n3dY_0ihPMRay4Yde9mJJs3AjWbans9OXKnQgB9jAgc",
  "iSwvVmrh9jSIqOjY6-6CVvrMVAmFhU0PR56kn8FCsPI",
  "6PAIxK7BUhyKYymDdJKH8okCeZeDfzUaLLCLbUO-Hbw",
  "EzMayyLAMuhvbMAnM6MAt_vuqkygj9kz5DrtPQjyJA0",
  "cEkN3-_IRZI2eyMmBSxw2QYju5JmRU0oc0biPuCS3PU",
  "46AWYbyNfFOsqROqElojI4vx8qI7KLtEcbXJUJPeGmc",
  "OZLCnsc_ngsvuULtKZrv52AN3F7BBttzizPHi4UegKc",
  "YV-Co6G97F4fa36P0SEQq7bDGBFfGvKco6fBvrZdQjk",
  "eOeB3AsHjfsVQUw3LcIBHfbWGcmatwKHkEFWPeDs_u4",
  "5Zn6cG9eUEGmzF54y8MGMcO6Pu4fO7jUklGlwghZmBU",
  "buels6mVDosXG64g59xEfleE5UGm0MLGiNcckVa8BNs",
  "9XFWn2F8qpI9b7glV9-Gh2szIxYt_hOF_KuklidCP4E",
  "qzaBRkMa7QJY4Hk0HoQaS_FcKjaJDRFhuyxuDdUvscw",
  "8hBwz_cQYiG65pe55p5KQWF0FVKbQIzAC-wXy1BWHOg",
  "CHbvy-fOtVD-kV1PsVouQcz5gzKQN6_jCk_EDnzb96M",
  "1OebVZIU-jbzR5fiJBuEQDUc2WgEwHRT9bIdSOiVHLM",
  "IoVwCYjBR47DZZkaKkQnxbLoVuhUWarpUN1CtPcUXmU",
  "lxPcL8HY88tAfZsJn0hx32p_Xrjl3jrK-53vJ1QL0Vg",
  "A_-HKvVKoovPbZkUinGN_kzGirjTjZacb6kg-mZC1f4",
  "XMJKGdj9iRbiHUVEXCyLpbsZlvjIoIEDGnEZd9xIT2U",
  "n1iHSHdEvhXF6ni8lNR7S2fes0IlBNN-FDtZ3kDgyUE",
  "GCHwZ1jW6topqr5u0ZrZ0qQ9AV5NUMwzKyJOvFE65wo",
  "qTqHg0L3fyEpL-uWba_TBLUaeQiWZ6P600KraH6txzU",
  "R8k-nzlHJz7iws99DyfwgaaRf4ey_0z5RQ6L-jKcCy0",
  "Vw8sji_BvYNjqeF4J9fBqM23x9Y5wsAOUPHwLeCBh_c",
  "aUUcTIuecf797aAWfzwpFcMQeeM44cWZI7lozcHQ7Ec",
  "ZKbno0E8t21LP5RSGFlVsxzK7Xpxa4yOAjuzHIp1_V4",
  "aTbV53Y4zSAh51brO0H0NUEKF9r4tdSlF7aO5QJvlrE",
  "JZr9f8RVo7LMSm0DQdo7ElY-Jd-NpT3DTyfBxLKU0HQ",
  "lGDRPEscj1r5CZJbPDzZ0KQA-f4DLu5adcVL89OF_oQ",
  "owVwPct8qP1n--RQNhr771P93XmpwTiKuEVpmeL69ok",
  "JYuCII5zcNefqsctL0h-Y7HiR3-Jd8gpUNmNgvl-ozA",
  "icuuvoZ_oqEnUzZR8ZsqUL_N8L28YH1h4LIlEJNl9bo",
  "YuegviyfNi-yQy51a9tzJT12Cw_Lvp2hb7PffJi6MrM",
  "mhp7Wr8iXBLbePeEfQzALK_mKHygEWdc3_MsdsyO7Do",
  "SGmqyO4bC5aALiiUTGz-a4zTj3VXxsCrYUzs54zljKs",
  "9Za1FV48FB1KD1xwunOULqJzudgXeGYM_6Tekiy5E0k",
  "GDhRu55HpxXDFCBtz8e9y8NlaW28mPQTlmeFfA1Ca8c",
  "eeneqcwiBjvr9lfvWZ-P9fhXZt88l5yCVXChytohncs",
  "V2RjXJr8Dp81i7o9OQOQy5TtSwxryPtxtc95EFbI4zA",
  "hlOGLDH3YR4jBEePD6HYGXE_TZua3OkSrl8vpzDa8VM",
  "aPKHHentMHkAjV2gShb-fsaZUyMDZoeZ6Xr7pY3DOtE",
  "6YOyGNIB-QUGCz4q3RODuZqC8JMLlhkgU4DcKCkNfR0",
  "k_bXOK69A--cY_j2Zb6P43XqAbkPJnr9Oqnl-Xf-XTY",
  "XnhYKtSoiI7lBzSHBCBDaI7UC4TivbIMw_7ISwwVBrs",
  "uHWmDDRuW9HdQUOYrFx5RHvmuPZURBta8If_36BaXdU",
  "7818e4NgaGugnlz1GovNgTtzJphtqJ6bFnUrLXEWNWA",
  "il_H4D8fId3Jsc-PeoxDpjGF3gZ7DppaY2CL3_Cxfz8",
  "g9-jEYi8VcGxSqtsTYOsjwDwffwn-8wPyeqrNoMmFSc",
  "FKvSQnva-4h1TAL7XOdyj9lTULTUia0ofGU-1H6I_1g",
  "sX1AqkNPHKlBfXhEEUBbcrGd8J5MK6lZQqv96XztiJU",
  "sqA-svE-zUOr8pxPeVj9Mzx_MAyDMQxYp6rgtxBcqDc",
  "-b67SdgHqe7pKgR6y7qKHhd_l6BIlhwOsO_jBhQ69hQ",
  "RAM3avUaqn2q2rVv9HS8Lw2vMNthmuvP8_4PtqWv4S0",
  "TfpHgXgxi8q0BSINoVTw14ZILaCdFGDIZ7c_Ofh7ejE",
  "lTgT6zl14_-0rdieGCZLJhAKLzVXuWoI9MAU3GiAEWE",
]

function FirstBid({ tokenId }) {
  const [bid, setBid] = useState("")
  const { auction } = useContracts()

  function submitBid() {
    const weiBid = ethers.utils.parseUnits(bid, 'ether');
    console.log("Placing " + bid + " bid on token #", tokenId);
    auction.bidTopUp(tokenId, { value: weiBid })
  }
  return (
    <div className="bidBox flex flex-col items-center">
      <div>First bid</div>
      <div className="btn-group btn-group-lg pb-2" role="group" aria-label="Bid">
        <div className="flex flex-row">
          <input type="text" value={bid} onChange={e => setBid(e.target.value)}
            className="rounded-l-xl text-xl py-1 px-4 outline-none focus:ring-1 ring-inset" aria-label="Amount" />
          <button disabled={bid < 3} onClick={submitBid} className="btn-pill rounded-r-xl">
            Bid
          </button>
        </div>
      </div>
    </div>
  )
}

function UpBid({ tokenId }) {
  const { auction } = useContracts()

  function submitUpBid(upBid) {
    const weiUpBid = ethers.utils.parseUnits(upBid, 'ether');
    console.log("Placing " + upBid + " bid on token #", tokenId);
    auction.bidTopUp(tokenId, { value: weiUpBid })
  }
  return (
    <div className="upbidBox">
      <div className="d-flex justify-content-center fs-normal">Upbid</div>
      <div className="d-flex justify-content-center">
        <div className="btn-group btn-group-lg pb-2" role="group" aria-label="Upbid">
          <button onClick={() => submitUpBid("0.5")} className="btn-pill rounded-l-xl"> 0.5 </button>
          <button onClick={() => submitUpBid("1")} className="btn-pill"> 1 </button>
          <button onClick={() => submitUpBid("2")} className="btn-pill rounded-r-xl"> 2 </button>
        </div>
      </div>
    </div>
  )
}

function TokenBidder({ tokenId }) {
  const { account, active, activate, chainId } = useWeb3React()

  const { auction: auctionAddr } = useContractAddresses()
  const { data: auctionState } = useEtherSWR(account ? [
    [auctionAddr, 'highestBidOn', tokenId],
    [auctionAddr, 'bidOf', account, tokenId],
  ] : [])
  const [highBid, myBid] = auctionState ? auctionState : []
  return (
    <div className="">
      <div className="flex justify-center text-lg ff-lulo">
        <div className="myBid text-primary">{myBid && formatAvax(myBid)}</div>|
        <div className="highBid">{highBid && formatAvax(highBid)}</div>
      </div>
      {(highBid !== undefined) && (
        (highBid > 0) ? (
          (highBid.eq(myBid)) ? (
            <div>You're the top bidder!</div>
          ) : (
            <UpBid tokenId={tokenId} />
          )
        ) : (
          <FirstBid tokenId={tokenId} />
        )
      )}
    </div>
  )
}

function TokenOnSale({ tokenId }) {
  const { active, activate } = useWeb3React()
  const connectWallet = function () {
    activate(injectedConnector)
  }
  return (
    <div className="text-center mb-8">
      <img src={`https://arweave.net/${tokenImageHashes[tokenId]}`}
        className="img-max p-1" alt={`Neko #${tokenId}`} />
      {active ? (
        <TokenBidder tokenId={tokenId} />
      ) : (
        <button className="btn-pill rounded-xl" onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  )
}

function SoldFor({ tokenId }) {
  const { account } = useWeb3React()
  const { auction: auctionAddr } = useContractAddresses()
  const { auction } = useContracts()
  const { data: soldData } = useEtherSWR(account ? [
    [auctionAddr, 'highestBidOn', tokenId],
    [auctionAddr, 'winnerOf', tokenId]
  ] : [])
  const [salePrice, winner] = soldData ? soldData : []
  function mint() {
    auction.collect(tokenId)
  }
  return (
    <div className="text-center">
      <span>{salePrice && formatAvax(salePrice)}</span>
      {winner && (winner === account) && (
        <button onClick={mint}>mint!</button>
      )}
    </div>
  )
}

export default function AuctionPage() {
  const { active, account, activate } = useWeb3React()
  const { auction } = useContracts()
  function withdraw() {
    auction.withdraw()
  }
  return (
    <div className="max-w-6xl m-auto">
      <Nav />
      <main className="p-4">
        <section id="intro" className="pt-5">
          <div className="relative">
            <img src="images/ultra64-promo.gif" className="img-fluid mx-auto d-block" alt="Neko Logo" />
          </div>
          <div className="relative pb-3 mt-16">
            <h1 className="text-center text-4xl">NEKO</h1>
            <h2 className="text-center">Ultra 64</h2>
          </div>
          <div className="position-relative pb-3">
            <div className="text-center fs-normal">
              <p>Income generating NFT collection.</p>
            </div>
          </div>
          <div className="relative pb-3">
            <div className="text-center text-xl">
              <b className="text-success">Auction is live!</b>
              {/* <b className="text-warning fs-large">Auction is suspended.</b> */}
              {/* <b className="text-secondary fs-large">Auction will start soon.</b> */}
              {/* <b className="text-info fs-large">Auction has ended!</b> */}
            </div>
          </div>
          <div className="md:mx-16">
            <h4 className="mb-2 text-xl">RULES</h4>
            <div className="relative mb-16">
              <ul>
                <li>You can buy only one NFT per wallet.</li>
                <li>You can only have one winning bid at any time.</li>
                <li>Minimum bid is 3 AVAX</li>
                <li>Bids can be upped by 0.5, 1 or 2 AVAX</li>
                <li>Winning bids are binding</li>
                <li>You can withdraw your AVAX on lost bids at any point</li>
                <li>You can mint your NEKO once the auction for that set has ended</li>
              </ul>
            </div>
          </div>
          <hr />
        </section>
        <section id="live" className="pt-5">
          <div className="position-relative pb-3">
            <h2 className="fw-bold text-center text-dark">LIVE</h2>
          </div>
          <div className="position-relative pb-3">
            <div className="text-center fs-normal">
              <p>These NEKOs are on sale now.</p>
              <p>Mouseover to place a bid (min 3 AVAX).</p>
              <p className="fs-large">Set 6/8</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 pt-2 pb-4">
            {tokensOnSale.map(tokenId => (
              <TokenOnSale tokenId={tokenId} key={tokenId} />
            ))}
          </div>
          <div className="relative pt-3 pb-3 d-none mx-auto text-center">
            <button onClick={withdraw}
              className="btn-pill rounded-xl mb-2" type="submit">Withdraw all bids</button>
            <div>(winning bids won't be withdrawn)</div>
          </div>
          {/* hide for now pending connect flow rework

        <div id="installMetamaskBox1" className="position-relative pt-3 pb-3 d-none alert mx-auto">
          <button className="install btn btn-lg btn-danger mx-auto d-block rounded-pill" type="submit">Install MetaMask</button>
        </div>
        <div id="connectWalletBox1" className="position-relative pt-3 pb-3 d-none alert mx-auto">
          <button className="connect btn btn-lg btn-danger mx-auto d-block rounded-pill" type="submit">Connect Wallet</button>
        </div>
        <div id="switchNetworkBox1" className="position-relative pt-3 pb-3 d-none alert mx-auto">
          <button className="switch btn btn-lg btn-danger mx-auto d-block rounded-pill" type="submit">Switch to Avalanche</button>
        </div>
        */}
        </section >
        <hr />
        <section id="sold" className="pt-5">
          <div className="position-relative pb-3">
            <h2 className="fw-bold text-center text-dark">SOLD</h2>
          </div>
          <div className="position-relative pb-3">
            <div className="text-center fs-normal">
              <p>These NEKOs have been sold.</p>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 pt-2 pb-4">
            {tokensSold.map(tokenId => (
              <div className="flow flow-col">
                <img src={`https://arweave.net/${tokenImageHashes[tokenId]}`} />
                {active && <SoldFor tokenId={tokenId} />}
              </div>
            ))}
          </div>
          {/* hide for now pending connect flow rework
        <div id="installMetamaskBox2" className="position-relative pt-3 pb-3 d-none alert mx-auto">
          <button className="install btn btn-lg btn-danger mx-auto d-block rounded-pill" type="submit">Install MetaMask</button>
        </div>
        <div id="connectWalletBox2" className="position-relative pt-3 pb-3 d-none alert mx-auto">
          <button className="connect btn btn-lg btn-danger mx-auto d-block rounded-pill" type="submit">Connect Wallet</button>
        </div>
        <div id="switchNetworkBox2" className="position-relative pt-3 pb-3 d-none alert mx-auto">
          <button className="switch btn btn-lg btn-danger mx-auto d-block rounded-pill" type="submit">Switch to Avalanche</button>
        </div>
        */}
        </section >
      </main >
    </div>
  )
}