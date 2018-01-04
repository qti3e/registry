import { listDevices } from "./api";
import { train } from "./nn_example";
import { test } from "./test";

test(async function nn_example() {
  const useGPU = (listDevices().length > 1);
  await train(useGPU, 2);  // Train for two steps.
});