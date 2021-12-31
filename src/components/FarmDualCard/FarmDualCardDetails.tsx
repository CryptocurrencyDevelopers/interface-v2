import React, { useState, useMemo } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useDualStakingInfo } from 'state/stake/hooks';
import { JSBI, TokenAmount, Pair, ETHER } from '@uniswap/sdk';
import { QUICK, EMPTY } from 'constants/index';
import { unwrappedToken } from 'utils/wrappedCurrency';
import {
  usePairContract,
  useDualRewardsStakingContract,
} from 'hooks/useContract';
import { useDerivedStakeInfo } from 'state/stake/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { CurrencyLogo } from 'components';
import { Link } from 'react-router-dom';
import { useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import useTransactionDeadline from 'hooks/useTransactionDeadline';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  syrupCard: {
    background: palette.secondary.dark,
    width: '100%',
    borderRadius: 10,
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  syrupCardUp: {
    background: palette.secondary.dark,
    width: '100%',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    cursor: 'pointer',
    [breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  inputVal: {
    backgroundColor: palette.secondary.contrastText,
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '& input': {
      flex: 1,
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      fontSize: 16,
      fontWeight: 600,
      color: palette.text.primary,
    },
    '& p': {
      cursor: 'pointer',
    },
  },
  buttonToken: {
    backgroundColor: palette.grey.A400,
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  buttonClaim: {
    backgroundImage:
      'linear-gradient(280deg, #64fbd3 0%, #00cff3 0%, #0098ff 10%, #004ce6 100%)',
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
  },
  syrupText: {
    fontSize: 14,
    fontWeight: 600,
    color: palette.text.secondary,
  },
}));

const FarmDualCardDetails: React.FC<{
  pair: Pair;
  dQuicktoQuick: number;
  stakingAPY: number;
}> = ({ pair, dQuicktoQuick, stakingAPY }) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [stakeAmount, setStakeAmount] = useState('');
  const [attemptStaking, setAttemptStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);
  const [attemptClaimReward, setAttemptClaimReward] = useState(false);
  // const [hash, setHash] = useState<string | undefined>();
  const [unstakeAmount, setUnStakeAmount] = useState('');
  const stakingInfos = useDualStakingInfo(pair);
  const stakingInfo = useMemo(
    () => (stakingInfos && stakingInfos.length > 0 ? stakingInfos[0] : null),
    [stakingInfos],
  );

  const token0 = stakingInfo ? stakingInfo.tokens[0] : undefined;
  const token1 = stakingInfo ? stakingInfo.tokens[1] : undefined;

  const rewardTokenA = stakingInfo?.rewardTokenA;
  const rewardTokenB = stakingInfo?.rewardTokenB;

  const { account, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();

  const currency0 = token0 ? unwrappedToken(token0) : undefined;
  const currency1 = token1 ? unwrappedToken(token1) : undefined;
  const baseTokenCurrency = stakingInfo
    ? unwrappedToken(stakingInfo.baseToken)
    : undefined;
  const empty = unwrappedToken(EMPTY);

  // get the color of the token
  const baseToken =
    baseTokenCurrency === empty ? token0 : stakingInfo?.baseToken;

  const totalSupplyOfStakingToken = stakingInfo?.totalSupply;
  const stakingTokenPair = stakingInfo?.stakingTokenPair;

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    stakingInfo?.stakedAmount.token,
  );

  let valueOfTotalStakedAmountInBaseToken: TokenAmount | undefined;
  let valueOfMyStakedAmountInBaseToken: TokenAmount | undefined;
  let valueOfUnstakedAmountInBaseToken: TokenAmount | undefined;
  if (
    totalSupplyOfStakingToken &&
    stakingTokenPair &&
    stakingInfo &&
    baseToken
  ) {
    // take the total amount of LP tokens staked, multiply by ETH value of all LP tokens, divide by all LP tokens
    valueOfTotalStakedAmountInBaseToken = new TokenAmount(
      baseToken,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(
            stakingInfo.totalStakedAmount.raw,
            stakingTokenPair.reserveOf(baseToken).raw,
          ),
          JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw,
      ),
    );

    valueOfMyStakedAmountInBaseToken = new TokenAmount(
      baseToken,
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(
            stakingInfo.stakedAmount.raw,
            stakingTokenPair.reserveOf(baseToken).raw,
          ),
          JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the WETH they entitle owner to
        ),
        totalSupplyOfStakingToken.raw,
      ),
    );

    if (userLiquidityUnstaked) {
      valueOfUnstakedAmountInBaseToken = new TokenAmount(
        baseToken,
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(
              userLiquidityUnstaked.raw,
              stakingTokenPair.reserveOf(baseToken).raw,
            ),
            JSBI.BigInt(2),
          ),
          totalSupplyOfStakingToken.raw,
        ),
      );
    }
  }

  // get the USD value of staked WETH
  const USDPrice = stakingInfo?.usdPrice;
  const valueOfTotalStakedAmountInUSDC =
    valueOfTotalStakedAmountInBaseToken &&
    USDPrice?.quote(valueOfTotalStakedAmountInBaseToken);

  const valueOfMyStakedAmountInUSDC =
    valueOfMyStakedAmountInBaseToken &&
    USDPrice?.quote(valueOfMyStakedAmountInBaseToken);

  const valueOfUnstakedAmountInUSDC =
    valueOfUnstakedAmountInBaseToken &&
    USDPrice?.quote(valueOfUnstakedAmountInBaseToken);

  let apyWithFee: number | string = 0;

  if (stakingInfo && stakingAPY && stakingAPY > 0) {
    apyWithFee =
      ((1 +
        ((Number(stakingInfo.perMonthReturnInRewards) +
          Number(stakingAPY) / 12) *
          12) /
          12) **
        12 -
        1) *
      100;

    if (apyWithFee > 100000000) {
      apyWithFee = '>100000000';
    } else {
      apyWithFee = parseFloat(apyWithFee.toFixed(2)).toLocaleString();
    }
  }

  const stakingContract = useDualRewardsStakingContract(
    stakingInfo?.stakingRewardAddress,
  );

  const { parsedAmount: unstakeParsedAmount } = useDerivedStakeInfo(
    unstakeAmount,
    stakingInfo?.stakedAmount.token,
    stakingInfo?.stakedAmount,
  );

  const onWithdraw = () => {
    if (stakingInfo && stakingContract && unstakeParsedAmount) {
      setAttemptUnstaking(true);
      stakingContract
        .withdraw(`0x${unstakeParsedAmount.raw.toString(16)}`, {
          gasLimit: 300000,
        })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`,
          });
          try {
            await response.wait();
            setAttemptUnstaking(false);
          } catch (error) {
            setAttemptUnstaking(false);
          }
          // setHash(response.hash);
        })
        .catch((error: any) => {
          setAttemptUnstaking(false);
          console.log(error);
        });
    }
  };

  const onClaimReward = () => {
    if (stakingInfo && stakingContract && stakingInfo.stakedAmount) {
      setAttemptClaimReward(true);
      stakingContract
        .getReward({ gasLimit: 350000 })
        .then(async (response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated QUICK rewards`,
          });
          try {
            await response.wait();
            setAttemptClaimReward(false);
          } catch (error) {
            setAttemptClaimReward(false);
          }
          // setHash(response.hash);
        })
        .catch((error: any) => {
          setAttemptClaimReward(false);
          console.log(error);
        });
    }
  };

  const { parsedAmount } = useDerivedStakeInfo(
    stakeAmount,
    stakingInfo?.stakedAmount.token,
    userLiquidityUnstaked,
  );
  const deadline = useTransactionDeadline();
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    stakingInfo?.stakingRewardAddress,
  );
  const [signatureData, setSignatureData] = useState<{
    v: number;
    r: string;
    s: string;
    deadline: number;
  } | null>(null);

  const dummyPair = stakingInfo
    ? new Pair(
        new TokenAmount(stakingInfo.tokens[0], '0'),
        new TokenAmount(stakingInfo.tokens[1], '0'),
      )
    : undefined;
  const pairContract = usePairContract(
    stakingInfo && stakingInfo.lp && stakingInfo.lp !== ''
      ? stakingInfo.lp
      : dummyPair?.liquidityToken.address,
  );

  const onStake = async () => {
    setAttemptStaking(true);
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        stakingContract
          .stake(`0x${parsedAmount.raw.toString(16)}`, {
            gasLimit: 350000,
          })
          .then(async (response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Stake Deposited Liquidity`,
            });
            try {
              await response.wait();
              setAttemptStaking(false);
            } catch (error) {
              setAttemptStaking(false);
            }
            // setHash(response.hash);
          })
          .catch((error: any) => {
            setAttemptStaking(false);
            console.log(error);
          });
      } else {
        setAttemptStaking(false);
        throw new Error(
          'Attempting to stake without approval or a signature. Please contact support.',
        );
      }
    }
  };

  const onAttemptToApprove = async () => {
    if (!pairContract || !library || !deadline)
      throw new Error('missing dependencies');
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error('missing liquidity amount');

    return approveCallback();
  };

  const earnedUSD =
    Number(stakingInfo?.earnedAmountA.toSignificant()) *
      dQuicktoQuick *
      Number(stakingInfo?.quickPrice) +
    Number(stakingInfo?.earnedAmountB.toSignificant()) *
      Number(stakingInfo?.maticPrice);

  const earnedUSDStr =
    earnedUSD < 0.001 && earnedUSD > 0
      ? '< $0.001'
      : '$' + earnedUSD.toLocaleString();

  return (
    <Box
      width='100%'
      mt={2.5}
      pl={isMobile ? 2 : 4}
      pr={isMobile ? 2 : 4}
      pt={2}
      display='flex'
      flexDirection='row'
      flexWrap='wrap'
      borderTop='1px solid #444444'
      alignItems='center'
      justifyContent='space-between'
    >
      {stakingInfo && (
        <>
          <Box
            minWidth={250}
            width={isMobile ? 1 : 0.3}
            color={palette.text.secondary}
            my={1.5}
          >
            <Box
              display='flex'
              flexDirection='row'
              alignItems='flex-start'
              justifyContent='space-between'
            >
              <Typography variant='body2'>In Wallet:</Typography>
              <Box
                display='flex'
                flexDirection='column'
                alignItems='flex-end'
                justifyContent='flex-start'
              >
                <Typography variant='body2'>
                  {userLiquidityUnstaked
                    ? userLiquidityUnstaked.toSignificant(2)
                    : 0}{' '}
                  LP{' '}
                  <span>
                    (
                    {valueOfUnstakedAmountInUSDC
                      ? Number(valueOfUnstakedAmountInUSDC.toSignificant(2)) >
                          0 &&
                        Number(valueOfUnstakedAmountInUSDC.toSignificant(2)) <
                          0.001
                        ? '< $0.001'
                        : `$${valueOfUnstakedAmountInUSDC.toSignificant(2)}`
                      : '$0'}
                    )
                  </span>
                </Typography>
                <Link
                  to={`/pools?currency0=${
                    token0?.symbol?.toLowerCase() === 'wmatic'
                      ? 'ETH'
                      : token0?.address
                  }&currency1=${
                    token1?.symbol?.toLowerCase() === 'wmatic'
                      ? 'ETH'
                      : token1?.address
                  }`}
                  style={{ color: palette.primary.main }}
                >
                  Get {currency0?.symbol} / {currency1?.symbol} LP
                </Link>
              </Box>
            </Box>
            <Box className={classes.inputVal} mb={2} mt={2} p={2}>
              <input
                placeholder='0.00'
                value={stakeAmount}
                onChange={(evt: any) => {
                  setStakeAmount(evt.target.value);
                }}
              />
              <Typography
                variant='body2'
                style={{
                  color:
                    userLiquidityUnstaked &&
                    userLiquidityUnstaked.greaterThan('0')
                      ? palette.primary.main
                      : palette.text.hint,
                }}
                onClick={() => {
                  if (
                    userLiquidityUnstaked &&
                    userLiquidityUnstaked.greaterThan('0')
                  ) {
                    setStakeAmount(userLiquidityUnstaked.toSignificant());
                  } else {
                    setStakeAmount('');
                  }
                }}
              >
                MAX
              </Typography>
            </Box>
            <Box
              className={
                Number(!attemptStaking && stakeAmount) > 0 &&
                Number(stakeAmount) <=
                  Number(userLiquidityUnstaked?.toSignificant())
                  ? classes.buttonClaim
                  : classes.buttonToken
              }
              mb={2}
              mt={2}
              p={2}
              onClick={() => {
                if (
                  !attemptStaking &&
                  Number(stakeAmount) > 0 &&
                  Number(stakeAmount) <=
                    Number(userLiquidityUnstaked?.toSignificant())
                ) {
                  if (
                    approval === ApprovalState.APPROVED ||
                    signatureData !== null
                  ) {
                    onStake();
                  } else {
                    onAttemptToApprove();
                  }
                }
              }}
            >
              <Typography variant='body1'>
                {attemptStaking
                  ? 'Staking LP Tokens...'
                  : approval === ApprovalState.APPROVED ||
                    signatureData !== null
                  ? 'Stake LP Tokens'
                  : 'Approve'}
              </Typography>
            </Box>
          </Box>
          <Box
            minWidth={250}
            width={isMobile ? 1 : 0.3}
            my={1.5}
            color={palette.text.secondary}
          >
            <Box
              display='flex'
              flexDirection='row'
              alignItems='flex-start'
              justifyContent='space-between'
            >
              <Typography variant='body2'>My deposits:</Typography>
              <Typography variant='body2'>
                {stakingInfo.stakedAmount.toSignificant(2)} LP{' '}
                <span>
                  (
                  {valueOfMyStakedAmountInUSDC
                    ? Number(valueOfMyStakedAmountInUSDC.toSignificant(2)) >
                        0 &&
                      Number(valueOfMyStakedAmountInUSDC.toSignificant(2)) <
                        0.001
                      ? '< $0.001'
                      : `$${valueOfMyStakedAmountInUSDC.toSignificant(2)}`
                    : '$0'}
                  )
                </span>
              </Typography>
            </Box>
            <Box className={classes.inputVal} mb={2} mt={4.5} p={2}>
              <input
                placeholder='0.00'
                value={unstakeAmount}
                onChange={(evt: any) => {
                  setUnStakeAmount(evt.target.value);
                }}
              />
              <Typography
                variant='body2'
                style={{
                  color:
                    stakingInfo.stakedAmount &&
                    stakingInfo.stakedAmount.greaterThan('0')
                      ? palette.primary.main
                      : palette.text.hint,
                }}
                onClick={() => {
                  if (
                    stakingInfo.stakedAmount &&
                    stakingInfo.stakedAmount.greaterThan('0')
                  ) {
                    setUnStakeAmount(stakingInfo.stakedAmount.toSignificant());
                  } else {
                    setUnStakeAmount('');
                  }
                }}
              >
                MAX
              </Typography>
            </Box>
            <Box
              className={
                !attemptUnstaking &&
                Number(unstakeAmount) > 0 &&
                Number(unstakeAmount) <=
                  Number(stakingInfo.stakedAmount.toSignificant())
                  ? classes.buttonClaim
                  : classes.buttonToken
              }
              mb={2}
              mt={2}
              p={2}
              onClick={() => {
                if (
                  !attemptUnstaking &&
                  Number(unstakeAmount) > 0 &&
                  Number(unstakeAmount) <=
                    Number(stakingInfo.stakedAmount.toSignificant())
                ) {
                  onWithdraw();
                }
              }}
            >
              <Typography variant='body1'>
                {attemptUnstaking
                  ? 'Unstaking LP Tokens...'
                  : 'Unstake LP Tokens'}
              </Typography>
            </Box>
          </Box>
          <Box
            minWidth={250}
            my={1.5}
            width={isMobile ? 1 : 0.3}
            color={palette.text.secondary}
          >
            <Box
              display='flex'
              flexDirection='column'
              alignItems='center'
              justifyContent='space-between'
            >
              <Box mb={1}>
                <Typography variant='body2'>Unclaimed Rewards:</Typography>
              </Box>
              <Box mb={1} display='flex'>
                <CurrencyLogo currency={QUICK} />
                <CurrencyLogo
                  currency={
                    rewardTokenB?.symbol?.toLowerCase() === 'wmatic'
                      ? ETHER
                      : rewardTokenB
                  }
                />
              </Box>
              <Box mb={1} textAlign='center'>
                <Typography variant='body1'>{earnedUSDStr}</Typography>
                <Typography variant='body1' color='textSecondary'>
                  {stakingInfo.earnedAmountA.toSignificant(2)}
                  <span>&nbsp;dQUICK</span>
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  {stakingInfo.earnedAmountB.toSignificant(2)}
                  <span>&nbsp;{rewardTokenB?.symbol}</span>
                </Typography>
              </Box>
            </Box>
            <Box
              className={
                !attemptClaimReward &&
                stakingInfo.earnedAmountA.greaterThan('0')
                  ? classes.buttonClaim
                  : classes.buttonToken
              }
              mb={2}
              p={2}
              onClick={() => {
                if (
                  !attemptClaimReward &&
                  stakingInfo.earnedAmountA.greaterThan('0')
                ) {
                  onClaimReward();
                }
              }}
            >
              <Typography variant='body1'>
                {attemptClaimReward ? 'Claiming...' : 'Claim'}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default FarmDualCardDetails;