import path from 'path';

export default function absolute(options: {
  file: string;
  cwd: string;
}): string {
  return path.isAbsolute(options.file)
    ? options.file
    : path.join(options.cwd, options.file);
}
