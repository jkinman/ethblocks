import React, {useRef, MutableRefObject} from "react";
import BlockScene from "./BlockScene";
// let threeRootElement: HTMLDivElement; // ref to canvas container
let blockScene = new BlockScene();

interface ThreeComponentProps {
  blockNumber: number;
  block: object;
}
export default (props: ThreeComponentProps) => {
  const { blockNumber, block } = props;
  let threeRootElementRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    blockScene.start(threeRootElementRef.current);
    return ()=>blockScene.stop();
  }, []);

  React.useEffect(() => {
    console.log("BlockScene: props updated");
  }, [block, blockNumber]);

  return (
    <div
      className="three-canvas-container"
    //   ref={(element) => (threeRootElementRef = element as HTMLDivElement)}
      ref={threeRootElementRef}
    />
  );
};
