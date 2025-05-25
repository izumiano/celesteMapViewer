import Result from './result.js';

export type OnProgress = (progress: number) => void;

export default async function responseProgress(
  response: Response,
  onProgress: OnProgress,
): Promise<Result<Uint8Array>> {
  if (!response.ok || !response.body) {
    return Result.failure(
      new Error(`Failed to fetch: ${response.status} ${response.statusText}`),
    );
  }

  const reader = response.body.getReader();
  const contentLength = Number(response.headers.get('Content-Length'));
  let receivedLength = 0;
  const chunks = [];

  while (true) {
    const {done, value} = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    if (contentLength) {
      const progress = receivedLength / contentLength;
      onProgress(progress);
    }
  }

  const allChunks = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }

  return Result.success(allChunks);
}
