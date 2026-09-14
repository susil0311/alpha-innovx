declare module "@wlearn/xgboost" {
  export function train(params: Record<string, unknown>, X: number[][], y: number[]): Promise<any>;
}
