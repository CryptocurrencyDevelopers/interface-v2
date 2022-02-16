import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import {
  ButtonGroup,
  Typography,
  Button,
  Box,
  Grid,
  useMediaQuery,
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { Currency } from '@uniswap/sdk';
import { useTheme } from '@material-ui/core/styles';
import Motif from 'assets/images/Motif.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiat.svg';
import Analytics from 'assets/images/featured/Analytics.svg';
import DragonsLair from 'assets/images/featured/DragonsLair.svg';
import ProvideLiquidity from 'assets/images/featured/ProvideLiquidity.svg';
import Rewards from 'assets/images/featured/Rewards.svg';
import FeaturedSwap from 'assets/images/featured/Swap.svg';
import FiatMask from 'assets/images/FiatMask.svg';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';
import { ReactComponent as CoingeckoIcon } from 'assets/images/social/Coingecko.svg';
import { ReactComponent as DiscordIcon } from 'assets/images/social/Discord.svg';
import { ReactComponent as InstagramIcon } from 'assets/images/social/Instagram.svg';
import { ReactComponent as FacebookIcon } from 'assets/images/social/Facebook.svg';
import { ReactComponent as MediumIcon } from 'assets/images/social/Medium.svg';
import { ReactComponent as RedditIcon } from 'assets/images/social/Reddit.svg';
import { ReactComponent as TelegramIcon } from 'assets/images/social/Telegram.svg';
import { ReactComponent as TwitterIcon } from 'assets/images/social/Twitter.svg';
import { ReactComponent as YouTubeIcon } from 'assets/images/social/YouTube.svg';
import {
  Swap,
  CurrencyInput,
  RewardSlider,
  AddLiquidity,
  StakeQuickModal,
  TopMovers,
} from 'components';
import { useActiveWeb3React, useInitTransak } from 'hooks';
import {
  addMaticToMetamask,
  getEthPrice,
  getGlobalData,
  formatCompact,
  getDaysCurrentYear,
  returnTokenFromKey,
  isSupportedNetwork,
} from 'utils';
import { useGlobalData, useWalletModalToggle } from 'state/application/hooks';
import { useLairInfo, useTotalRewardsDistributed } from 'state/stake/hooks';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '100px 0 80px',
    position: 'relative',
    textAlign: 'center',
    zIndex: 2,
    '& h3': {
      textTransform: 'uppercase',
      marginBottom: 20,
    },
    '& h1': {
      color: palette.primary.main,
    },
    '& > button': {
      height: 56,
      width: 194,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    [breakpoints.down('xs')]: {
      margin: '64px 0',
    },
  },
  tradingInfo: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
    justifyContent: 'center',
    [breakpoints.down('md')]: {
      flexWrap: 'wrap',
    },
    '& > div': {
      background: palette.background.default,
      width: 'calc(25% - 24px)',
      maxWidth: 288,
      minWidth: 220,
      height: 133,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      margin: 12,
      '& p': {
        marginBottom: 24,
        textTransform: 'uppercase',
      },
      [breakpoints.down('xs')]: {
        height: 'unset',
      },
    },
  },
  quickInfo: {
    textAlign: 'center',
    margin: '128px auto 30px',
    width: '100%',
    maxWidth: 800,
    '& h2': {
      marginBottom: 60,
    },
  },
  swapContainer: {
    textAlign: 'center',
    padding: '20px 0',
    maxWidth: 1048,
    margin: 'auto',
    width: '100%',
    '& > div': {
      width: '100%',
    },
    '& .MuiButtonGroup-root': {
      marginBottom: 50,
      '& button': {
        maxWidth: 180,
        width: '50%',
        height: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        border: `1px solid ${palette.primary.dark}`,
        color: 'white',
        '&.active': {
          background: '#FFFFFFDE',
          border: `1px solid transparent`,
          color: palette.background.default,
        },
        '&:first-child': {
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        },
        '&:last-child': {
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      },
    },
    [breakpoints.down('xs')]: {
      '& .MuiGrid-item': {
        width: '100%',
        marginBottom: 32,
        textAlign: 'center',
      },
    },
  },
  buttonGroup: {
    textAlign: 'center',
    padding: '20px 0',
    maxWidth: 1048,
    margin: 'auto',
    width: '100%',
    '& > div': {
      width: '100%',
    },
    '& .MuiButtonGroup-root': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 50,
      '& button': {
        maxWidth: 180,
        width: '50%',
        height: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        border: `1px solid ${palette.primary.dark}`,
        color: palette.text.secondary,
        '&.active': {
          background: '#FFFFFFDE',
          border: `1px solid transparent`,
          color: palette.background.default,
        },
        '&:first-child': {
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        },
        '&:last-child': {
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      },
    },
    [breakpoints.down('xs')]: {
      '& .MuiGrid-item': {
        width: '100%',
        marginBottom: 32,
        textAlign: 'center',
      },
    },
  },
  swapInfo: {
    textAlign: 'left',
    marginBottom: 60,
    [breakpoints.down('sm')]: {
      order: -1,
    },
    '& h3': {
      marginBottom: 16,
    },
  },
  rewardsContainer: {
    textAlign: 'center',
    margin: '172px 0 100px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [breakpoints.down('xs')]: {
      margin: '32px 0 64px',
    },
  },
  buyFiatContainer: {
    background: palette.background.paper,
    height: 338,
    borderRadius: 48,
    marginBottom: 160,
    overflow: 'hidden',
    position: 'relative',
    [breakpoints.down('sm')]: {
      height: 'auto',
    },
    [breakpoints.down('xs')]: {
      marginBottom: 80,
    },
    '& > img': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1248,
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 80,
      height: '100%',
      position: 'relative',
      zIndex: 2,
      [breakpoints.down('sm')]: {
        flexDirection: 'column',
        padding: 0,
      },
    },
    '& .buyFiatInfo': {
      display: 'flex',
      width: '50%',
      alignItems: 'center',
      position: 'relative',
      '& img': {
        width: 200,
        maxWidth: 320,
      },
      '& > div': {
        width: 'calc(100% - 200px)',
        '& > h3': {
          marginBottom: 12,
        },
      },
      [breakpoints.down('sm')]: {
        width: '100%',
      },
      [breakpoints.down('xs')]: {
        flexDirection: 'column',
        '& img, & > div': {
          width: '100%',
        },
        '& img': {
          margin: '-32px 0',
        },
        '& div': {
          padding: '0 20px 20px',
        },
      },
    },
    '& .buyFiatWrapper': {
      width: 408,
      [breakpoints.down('sm')]: {
        width: 'calc(100% - 64px)',
        marginBottom: 32,
      },
      [breakpoints.down('xs')]: {
        width: 'calc(100% - 40px)',
      },
      '& .buyContent': {
        background: palette.background.default,
        borderRadius: 20,
        padding: 24,
        '& > div': {
          padding: 0,
          border: 'none',
          background: 'transparent',
          '& > p': {
            marginBottom: 8,
          },
        },
      },
      '& > button': {
        height: 56,
        marginTop: 20,
      },
    },
  },
  featureHeading: {
    margin: 'auto',
    textAlign: 'center',
    '& h3': {
      color: 'rgba(255, 255, 255, 0.87)',
      marginBottom: 32,
    },
  },
  featureDivider: {
    width: 32,
    height: 2,
    background: palette.success.dark,
    margin: 'auto',
  },
  featureContainer: {
    '& > div.MuiGrid-root': {
      marginTop: 32,
      '& > div': {
        '& img': {
          width: 150,
          maxWidth: 240,
        },
        '& > div': {
          width: 'calc(100% - 270px)',
        },
        [breakpoints.down('xs')]: {
          flexDirection: 'column',
          '& img, & > div': {
            width: '100%',
            textAlign: 'center',
          },
        },
      },
    },
    '& .featureText': {
      marginLeft: 8,
      '& h3': {
        color: 'white',
        marginBottom: 8,
      },
    },
  },
  communityContainer: {
    margin: '100px 0',
    '& .socialContent': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 48,
      '& > div': {
        margin: 16,
        textAlign: 'center',
        width: 120,
        '& a': {
          textDecoration: 'none',
          color: palette.text.primary,
          '&:hover': {
            color: 'white',
            '& svg path': {
              fill: 'white',
            },
          },
        },
        '& svg': {
          width: 64,
          height: 64,
          '& path': {
            fill: palette.text.primary,
          },
        },
      },
    },
  },
  smallCommunityContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    height: 56,
    position: 'fixed',
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 24,
    background: 'rgb(27, 32, 43, 0.9)',
    backdropFilter: 'blur(30px)',
    zIndex: 10,
    '& svg': {
      width: 32,
      height: 32,
      cursor: 'pointer',
      '&:hover path': {
        fill: palette.text.primary,
      },
      '& path': {
        fill: palette.text.secondary,
      },
    },
    [breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

const LandingPage: React.FC = () => {
  const classes = useStyles();
  const daysCurrentYear = getDaysCurrentYear();
  const [swapIndex, setSwapIndex] = useState(0);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const { palette, breakpoints } = useTheme();
  const { account } = useActiveWeb3React();
  const { ethereum } = window as any;
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const { initTransak } = useInitTransak();
  const toggleWalletModal = useWalletModalToggle();
  const [fiatCurrency, setFiatCurrency] = useState<Currency | undefined>(
    returnTokenFromKey('MATIC'),
  );
  const [fiatAmount, setFiatAmount] = useState('');

  const features = [
    {
      img: FeaturedSwap,
      title: 'Swap Tokens',
      desc: 'Trade any combination of ERC-20 tokens permissionless, with ease.',
    },
    {
      img: ProvideLiquidity,
      title: 'Supply Liquidity',
      desc: 'Earn 0.25% fee on trades proportional to your share of the pool.',
    },
    {
      img: BuyWithFiat,
      title: 'Buy Crypto with Fiat',
      desc:
        'Simple way to buy with Apple Pay, credit card, bank transfer & more.',
    },
    {
      img: Analytics,
      title: 'Analytics',
      desc: 'Scan through Quickwap analytics & Historical Data.',
    },
  ];

  const socialicons = [
    {
      link: 'https://www.reddit.com/r/intergalacticracing/',
      icon: <RedditIcon />,
      title: 'Reddit',
    },
    {
      link: 'https://www.facebook.com/intergalactic.racing/',
      icon: <FacebookIcon />,
      title: 'Facebook',
    },
    {
      link: 'https://www.instagram.com/intergalactic.racing/',
      icon: <InstagramIcon />,
      title: 'Instagram',
    },
    {
      link: 'https://medium.com/@igc/list/intergalactic-racing-19e94cbfc30b/',
      icon: <TwitterIcon />,
      title: 'Twitter',
    },
    {
      link: 'https://medium.com/@igc/list/intergalactic-racing-19e94cbfc30b/',
      icon: <MediumIcon />,
      title: 'Medium',
    },
    {
      link: 'https://www.youtube.com/channel/UCzvgg-g7ZIdX7NILVHOSR6g/',
      icon: <YouTubeIcon />,
      title: 'Youtube',
    },
    {
      link: 'https://t.me/intergalactic_racing/',
      icon: <TelegramIcon />,
      title: 'Telegram',
    },
  ];

  const history = useHistory();
  const tellStory = true;
  const { globalData, updateGlobalData } = useGlobalData();
  const lairInfo = useLairInfo();

  const APR =
    (((Number(lairInfo?.oneDayVol) * 0.04 * 0.01) /
      Number(lairInfo?.dQuickTotalSupply.toSignificant(6))) *
      daysCurrentYear) /
    (Number(lairInfo?.dQUICKtoQUICK.toSignificant()) *
      Number(lairInfo?.quickPrice));

  const dQUICKAPY = useMemo(() => {
    if (!APR) return;
    return (Math.pow(1 + APR / daysCurrentYear, daysCurrentYear) - 1) * 100;
  }, [APR, daysCurrentYear]);

  const totalRewardsUSD = useTotalRewardsDistributed();

  useEffect(() => {
    async function fetchGlobalData() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const newGlobalData = await getGlobalData(newPrice, oneDayPrice);
      if (newGlobalData) {
        updateGlobalData({ data: newGlobalData });
      }
    }
    fetchGlobalData();
  }, [updateGlobalData]);

  return (
    <div id='landing-page' style={{ width: '100%' }}>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      <Box className={classes.heroSection}>
        <Typography variant='body2' style={{ fontWeight: 'bold' }}>
          Play to Earn
        </Typography>
        <Box my={1}>
          <QuickIcon />
        </Box>
        <Typography style={{ fontSize: '15px', color: palette.text.secondary }}>
          DeFi & GameFi on the Polygon Network with QuickSwap for convenience
        </Typography>
        <Box mt={2} width={200} height={48}>
          <Button
            fullWidth
            style={{
              backgroundColor: '#004ce6',
              borderRadius: '30px',
              height: '100%',
              fontSize: 16,
              fontWeight: 500,
            }}
            onClick={() => {
              ethereum && !isSupportedNetwork(ethereum)
                ? addMaticToMetamask()
                : account
                ? history.push('/swap')
                : toggleWalletModal();
            }}
          >
            {ethereum && !isSupportedNetwork(ethereum)
              ? 'Switch to Polygon'
              : account
              ? 'Enter App'
              : 'Connect Wallet'}
          </Button>
        </Box>
      </Box>
      <Box className={classes.smallCommunityContainer}>
        {socialicons.map((val, ind) => (
          <a href={val.link} target='_blank' key={ind} rel='noreferrer'>
            <Box display='flex' mx={1.5}>
              {val.icon}
            </Box>
          </a>
        ))}
      </Box>
      <Box mt={2} width={1}>
        <TopMovers background={palette.background.paper} />
      </Box>
      <br />
      <br />
      <Box className={classes.featureContainer}>
        <Box className={classes.featureHeading}>
          <Typography variant='h3'>Gaming</Typography>
          <Box className={classes.featureDivider} />
          <Typography>
            <Box sx={{ fontSize: '15px', color: palette.text.secondary }}>
              {tellStory === true
                ? 'Intergalactic space racing sets the gateway into the world of metaverse space gaming where players can get an immersive experience through its high definition 3D graphics, set in space. Get ready for an adventure into space where you can race, compete, and collect Spaceship NFTs. There is an open world metaverse where we all can share a joke or a laugh and prepare to challenge in the arena, and the first mini-game in the Intergalactic metaverse is Space Racing 3d! The high definition 3D graphics built into the game ensures an immersive experience of what it’s like to be an astronaut in your own spaceship, porting from one galaxy to the other. The spaceships are designed with insane speed capabilities and have functions to engage in combat operations, covert missions, hidden modes, and more. Featuring 5 game levels set at different difficulties, epic jumps and loops, 3- dimensional views and highly responsive haptic feedback, the game is certainly one to kill for. You can destroy and overtake other competing space racers by deploying different game attacking techniques such as boosts, flips, and vehicle add-ons. You set the tone and pace for your game use black holes, and boosters and everything you need to finish among the top 3. The game features spaceship NFT packs of five stunning rarities including COMMON, RARE, ULTRA, LEGENDARY, EPIC. With each spaceship NFTs redeemed, you can unlock special contents and enjoy other amazing benefits for a massive boost in the game. Players are going to have a mint with Astronauts and Spaceships on those 5 game levels in a random mint. This is your ticket to the game. Intergalactic space racing is built on the Polygon network and powered by Unreal Engine; it combines the mechanisms of play-to-earn, play-to-win, and player-versus-player together. In this regard, it integrates a token system where players can earn tokens from each race and the emerging top 3 winners take a share of the prize pool. Another special perk to the Intergalactic space racing game is its in-game market feature where players can buy items such as power-ups, spacesuits upgrades, spaceship engines boosters, and a lot more.'
                : 'Intergalactic space racing sets the gateway into the world of metaverse space gaming where players can get an immersive experience through its high definition 3D graphics, set in space. Get ready for an adventure into space where you can race, compete, and collect Spaceship NFTs. There is an open world metaverse where we all can share a joke or a laugh and prepare to challenge in the arena, and the first mini-game in the Intergalactic metaverse is Space Racing 3d! The high definition 3D graphics built into the game ensures an immersive experience of what it’s like to be an astronaut in your own spaceship, porting from one galaxy to the other. The spaceships are designed with insane speed capabilities and have functions to engage in combat operations, covert missions, hidden modes, and more. Featuring 5 game levels set at different difficulties, epic jumps and loops, 3- dimensional views and highly responsive haptic feedback, the game is certainly one to kill for. You can destroy and overtake other competing space racers by deploying different game attacking techniques such as boosts, flips, and vehicle add-ons. You set the tone and pace for your game use black holes, and boosters and everything you need to finish among the top 3. The game features spaceship NFT packs of five stunning rarities including COMMON, RARE, ULTRA, LEGENDARY, EPIC. With each spaceship NFTs redeemed, you can unlock special contents and enjoy other amazing benefits for a massive boost in the game. Players are going to have a mint with Astronauts and Spaceships on those 5 game levels in a random mint. This is your ticket to the game. Intergalactic space racing is built on the Polygon network and powered by Unreal Engine; it combines the mechanisms of play-to-earn, play-to-win, and player-versus-player together. In this regard, it integrates a token system where players can earn tokens from each race and the emerging top 3 winners take a share of the prize pool. Another special perk to the Intergalactic space racing game is its in-game market feature where players can buy items such as power-ups, spacesuits upgrades, spaceship engines boosters, and a lot more.'}
              <br />
            </Box>
          </Typography>
        </Box>
      </Box>
      <Box className={classes.quickInfo}>
        <Typography style={{ fontSize: '24px' }}>
          QuickSwap is a next-generation layer-2 decentralized exchange and
          Automated Market Maker.
        </Typography>
        <img src={Motif} alt='Motif' />
      </Box>
      <Box className={classes.buttonGroup}>
        <ButtonGroup>
          <Button
            className={swapIndex === 0 ? 'active' : ''}
            onClick={() => setSwapIndex(0)}
          >
            Swap
          </Button>
          <Button
            className={swapIndex === 1 ? 'active' : ''}
            onClick={() => setSwapIndex(1)}
          >
            Liquidity
          </Button>
        </ButtonGroup>
      </Box>
      <Box className={classes.swapContainer}>
        <Grid container spacing={mobileWindowSize ? 0 : 8} alignItems='center'>
          <Grid item sm={12} md={6}>
            {swapIndex === 0 ? (
              <Swap currencyBg={palette.background.paper} />
            ) : (
              <AddLiquidity currencyBg={palette.background.paper} />
            )}
          </Grid>
          <Grid item sm={12} md={6} className={classes.swapInfo}>
            <Typography variant='h4'>
              {swapIndex === 0
                ? 'Swap tokens at near-zero gas fees'
                : 'Let your crypto work for you'}
            </Typography>
            <Typography variant='body1' style={{ marginTop: '20px' }}>
              {swapIndex === 0
                ? 'Deposit your Liquidity Provider tokens to receive Rewards in $QUICK on top of LP Fees.'
                : 'Provide Liquidity and earn 0.25% fee on all trades proportional to your share of the pool. Earn additional rewards by depositing your LP Tokens in Rewards Pools.'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.buyFiatContainer}>
        <img src={FiatMask} alt='Fiat Mask' />
        <Box>
          <Box className='buyFiatInfo'>
            <img src={BuyWithFiat} alt='buy with fiat' />
            <Box>
              <Typography variant='h3'>Buy crypto with Fiat</Typography>
              <Typography variant='h6'>
                Simple way to buy or sell crypto with a credit card, bank
                transfer and more
              </Typography>
            </Box>
          </Box>
          <Box className='buyFiatWrapper'>
            <Box className='buyContent'>
              <CurrencyInput
                currency={fiatCurrency}
                title='I want to Buy:'
                showMaxButton={false}
                otherCurrency={undefined}
                handleCurrencySelect={setFiatCurrency}
                amount={fiatAmount}
                setAmount={setFiatAmount}
              />
            </Box>
            {fiatCurrency && (
              <Button
                fullWidth
                color='primary'
                onClick={() =>
                  initTransak(
                    account,
                    mobileWindowSize,
                    fiatCurrency.symbol || '',
                  )
                }
              >
                Buy {fiatCurrency.symbol} Now
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      <Box className={classes.featureContainer}>
        <br />
        <Box className={classes.featureHeading}>
          <Typography variant='h3'>Features</Typography>
          <Box className={classes.featureDivider} />
        </Box>
        <Grid container spacing={4}>
          {features.map((val, index) => (
            <Grid item container alignItems='center' sm={12} md={6} key={index}>
              <img src={val.img} alt={val.title} />
              <Box className='featureText'>
                <Typography variant='h5'>{val.title}</Typography>
                <Typography variant='body1'>{val.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box className={classes.communityContainer}>
        <Box className={classes.featureHeading}>
          <Typography variant='h3'>Join our ever-growing Community</Typography>
          <Box className={classes.featureDivider} />
        </Box>
        <Box className='socialContent'>
          {socialicons.map((val, ind) => (
            <Box key={ind}>
              <a href={val.link} target='_blank' rel='noreferrer'>
                {val.icon}
                <Typography>{val.title}</Typography>
              </a>
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default LandingPage;
