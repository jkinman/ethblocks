import "./style/three.scss";

import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import ethers from "ethers";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import EthersDataSource from "./sources/EthersDataSource";
import ThreeComponent from "./scene/ThreeComponent";

// create the eth service
const ethersDataSource = new EthersDataSource();

type Block = {
  transactions: any[];
};

const lastBlock = JSON.parse(localStorage.getItem("lastblock"));
let lastBlockNum;
if (lastBlock) lastBlockNum = lastBlock.number;

export const App = () => {
  const [blockData, setBlockData] = React.useState(new Map());
  const [block, setBlock] = React.useState<Block>(null);
  const [blockNumber, setBlockNumber] = React.useState<number>(0);

  // add useSyncExternalStore to poll the blockchain

  const getBlock = async () => {
    const blockNumber = await ethersDataSource.getBlockNumber();
    setBlockNumber(blockNumber);
    const blockReturn = await ethersDataSource.getBlock(blockNumber);
    let filledTransactions = await ethersDataSource.getBlockTransactions(
      blockReturn
    );

    const unpacked: ethers.TransactionResponse[] = [];

    await filledTransactions.map((val) =>
      val.then(async (a) => {
        if (a) unpacked.push(a.toJSON());
      })
    );

    const normalizedBlock = {
      ...blockReturn.toJSON(),
      transactions: unpacked,
    };

    blockData.set(blockNumber, normalizedBlock);
    setBlockData(new Map(blockData));
    setBlock(normalizedBlock);
    localStorage.setItem("lastblock", JSON.stringify(normalizedBlock));
    console.log(blockData);
  };

  React.useEffect(() => {
    getBlock();
  }, []);

  const blockKeys = [];
  for (const block of blockData.keys()) {
    blockKeys.push(block);
  }

  const BlockSelection = (props:any) => {
    
    const { blockKeys, setBlock} = props
    return (
      <Slider defaultValue={blockKeys.length} min={1} max={blockKeys.length} step={1} >
        <SliderTrack bg="red.100">
          <Box position="relative" right={10} />
          <SliderFilledTrack bg="tomato" />
        </SliderTrack>
        <SliderThumb boxSize={6} />
      </Slider>
    );
  };


  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        {/* <Grid minH="100vh" p={3}> */}
        <ColorModeSwitcher justifySelf="flex-end" />
        <VStack spacing={8}>
          <Heading>Literal Ethereum Block Explorer</Heading>
          <Text>
            Each block is a transaction with mass and lifespan of log(value)
          </Text>
          <Text>
            {blockKeys.map((el) => (
              <Code key={el} onClick={() => setBlockNumber(el)}>
                {el}/
              </Code>
            ))}
          </Text>
          {/* <BlockSelection blockKeys={blockKeys} setBlock={setBlockNumber} /> */}
          <ThreeComponent block={block} blockNumber={blockNumber} />
        </VStack>
        {/* </Grid> */}
      </Box>
    </ChakraProvider>
  );
};
