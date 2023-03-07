import React, { useRef, MutableRefObject } from "react";
import BlockScene from "./BlockScene";
let blockScene = new BlockScene();

type Block = {
  transactions: any[];
}

interface ThreeComponentProps {
  blockNumber: number;
  block: Block;
}

// type block {
//   transactions: 
// }

export default (props: ThreeComponentProps) => {
  const { blockNumber, block } = props;
  let threeRootElementRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    blockScene.start(threeRootElementRef.current);
    return () => blockScene.stop();
  }, []);

  React.useEffect(() => {
    console.log("BlockScene: props updated");
    blockScene.newBlock( block, blockNumber)
  }, [block, blockNumber]);

  return <div className="three-canvas-container" ref={threeRootElementRef} />;
};
