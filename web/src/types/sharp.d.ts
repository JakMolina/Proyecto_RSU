declare module "sharp" {
  interface Sharp {
    composite(composite: Array<{
      input: Buffer | string;
      left?: number;
      top?: number;
    }>): Sharp;
    png(): Sharp;
    toBuffer(): Promise<Buffer>;
  }
  function sharp(input: string | Buffer): Sharp;
  export = sharp;
}