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

// create the eth service
const ethersDataSource = new EthersDataSource();

export const App = () => {
  const [block, setBlock] = React.useState<object>({});
  const [blockNumber, setBlockNumber] = React.useState<number>(0);

  const getBlock = async () => {
    const blockNumber = await ethersDataSource.getBlockNumber();
    setBlockNumber(blockNumber);
    const blockReturn = await ethersDataSource.getBlock(blockNumber);
    console.log(blockReturn);
    let filledTransactions = await ethersDataSource.getBlockTransactions(
      blockReturn
    );

    const unpacked:ethers.TransactionResponse[] = []
    
    await filledTransactions.map((val) =>
      val.then( async (a) => {
        if(a) unpacked.push(a)
      })
    );

    console.log(unpacked);

    const normalizedBlock = {
      ...blockReturn,
      transactions: unpacked,
    };
    setBlock(normalizedBlock);
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
              {/* <Code>{JSON.stringify(block)}</Code> */}
            </Text>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
};
