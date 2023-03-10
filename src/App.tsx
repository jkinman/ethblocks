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
} from "@chakra-ui/react";
import ethers from "ethers";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { Logo } from "./Logo";
import EthersDataSource from "./sources/EthersDataSource";
import ThreeComponent from "./scene/ThreeComponent";

// create the eth service
const ethersDataSource = new EthersDataSource();

type Block = {
  transactions: any[];
}


export const App = () => {
  const [blockData, setBlockData] = React.useState([])
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
        if (a)  unpacked.push(a.toJSON()); 
      })
    );

    console.log(unpacked);

    const normalizedBlock = {
      ...blockReturn.toJSON(),
      transactions: unpacked,
    };
    const newBlock:any[] = []
    newBlock[`${blockNumber}`] = normalizedBlock
    setBlockData( [...blockData, newBlock] )
    setBlock(normalizedBlock);
    localStorage.setItem('lastblock', JSON.stringify(normalizedBlock));
    debugger
  };

  React.useEffect(() => {

    getBlock();

  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <Heading>Hello World</Heading>
            <Text>
              <Code>{JSON.stringify(blockNumber)}</Code>
            </Text>
            <ThreeComponent block={block} blockNumber={blockNumber} />
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
};
