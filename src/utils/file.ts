import * as Path from "path";

export const getRelativePathname = (filename: string) => {
  return Path.relative(process.cwd(), filename);
};
